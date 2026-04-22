import { HttpResponse, http } from "msw";
import { EVENT_USERS, EVENTS, ME, makeEventUser, shortId } from "./data";
import type { Event, EventUser, SummaryResponse, SummarySlot, SummaryUserResponse } from "./types";

const BASE = "/api/v1";

/**
 * FETCH EXAMPLES
  // GET /users/me
  fetch('/api/v1/users/me').then(r => r.json()).then(console.log)

  // PATCH /users/me
  fetch('/api/v1/users/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ language:
  'ET', timezone: 'UTC' }) }).then(r => r.json()).then(console.log)

  // GET /events/mine
  fetch('/api/v1/events/mine').then(r => r.json()).then(console.log)

  // POST /events
  fetch('/api/v1/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Test
  Event', type: 'SPECIFIC_DATES', times: ['0900-25032026', '0930-25032026'], timeIncrement: 30, timezone: 'Europe/Tallinn' })
  }).then(r => r.json()).then(console.log)

  // GET /events/:shortId  — first grab a shortId from /events/mine, then:
  fetch('/api/v1/events/mine').then(r => r.json()).then(events => fetch(`/api/v1/events/${events[0].shortId}`).then(r =>
  r.json()).then(console.log))

  fetch(`/api/v1/events/cozy-hot-toast-HmYXfuih`).then(r => r.json()).then(console.log)

  // PATCH /events/:shortId
  fetch('/api/v1/events/mine').then(r => r.json()).then(events => fetch(`/api/v1/events/${events[0].shortId}`, { method: 'PATCH',
  headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Renamed Event' }) }).then(r =>
  r.json()).then(console.log))

  // PUT /events/:shortId/respond
  fetch('/api/v1/events/mine').then(r => r.json()).then(events => fetch(`/api/v1/events/${events[0].shortId}/respond`, { method:
  'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ available: ['0900-25032026', '0930-25032026'],
  notAvailable: ['1000-25032026'] }) }).then(r => r.json()).then(console.log))

  // GET /events/:shortId/summary
  fetch('/api/v1/events/mine').then(r => r.json()).then(events => fetch(`/api/v1/events/${events[0].shortId}/summary`).then(r =>
  r.json()).then(console.log))

  // DELETE /events/:shortId
  fetch('/api/v1/events/mine').then(r => r.json()).then(events => fetch(`/api/v1/events/${events[0].shortId}`, { method: 'DELETE'
  }).then(r => console.log('deleted, status:', r.status)))
 */

// ── Auth state ───────────────────────────────────────────────────────────────
// Starts logged out. POST /auth/google sets this to true.
let isLoggedIn = false;

// IMPORTANT: MSW matches handlers in registration order.
// Specific paths (mine, summary, respond) MUST be registered before the
// generic /:shortId handler, or they'll be shadowed by the param matcher.
export const handlers = [
	// ── POST /auth/google ─────────────────────────────────────────────────────
	http.post(`${BASE}/auth/google`, () => {
		isLoggedIn = true;
		return HttpResponse.json({
			token: "mock-token",
			id: ME.id,
			name: ME.name,
			email: ME.email,
			profilePicture: ME.profilePicture,
		});
	}),

	// ── GET /users/me ─────────────────────────────────────────────────────────
	http.get(`${BASE}/users/me`, ({ request }) => {
		const auth = request.headers.get("Authorization");
		if (!isLoggedIn && auth !== "Bearer mock-token") return new HttpResponse(null, { status: 401 });
		return HttpResponse.json(ME);
	}),

	// ── PATCH /users/me ───────────────────────────────────────────────────────
	http.patch(`${BASE}/users/me`, async ({ request }) => {
		const body = (await request.json()) as Partial<typeof ME>;
		Object.assign(ME, body, { updatedAt: new Date().toISOString() });
		return HttpResponse.json(ME);
	}),

	// ── GET /events/mine /:shortId ───────────────────────────────────
	http.get(`${BASE}/events/mine`, () => {
		if (!isLoggedIn) return new HttpResponse(null, { status: 401 });
		const myEventIds = new Set(
			EVENT_USERS.filter(eu => eu.user.id === ME.id).map(eu => eu.event.id),
		);
		const mine = EVENTS.filter(e => myEventIds.has(e.id) && !e.isDeleted);
		return HttpResponse.json(mine);
	}),
	// ── GET /events/:shortId/summary ──────────────────────
	http.get(`${BASE}/events/:shortId/summary`, ({ params }) => {
		const event = EVENTS.find(e => e.shortId === params.shortId && !e.isDeleted);
		if (!event) return new HttpResponse(null, { status: 404 });

		const userResponses = EVENT_USERS.filter(eu => eu.event.shortId === params.shortId);

		const heatMap: Record<string, { count: number; users: { id: number; name: string }[] }> = {};
		const users = userResponses.map(user => {
			return {
				available: user.available,
				notAvailable: user.notAvailable,
				user: {
					id: user.user.id,
					name: user.user.name,
					profilePicture: user.user.profilePicture,
				},
			} satisfies SummaryUserResponse;
		});

		for (const user of userResponses) {
			for (const availability of user.available) {
				heatMap[availability] = {
					count: (heatMap[availability]?.count ?? 0) + 1,
					users: [
						...(heatMap[availability]?.users ?? []),
						{ id: user.user.id, name: user.user.name },
					],
				};
			}
		}

		const slots: SummarySlot[] = Object.keys(heatMap).map(slot => {
			const count = heatMap[slot].count;
			const users = heatMap[slot].users;
			return {
				slot,
				count,
				users,
			};
		});

		const responseWithHeatmap: SummaryResponse = {
			users,
			slots,
		};

		return HttpResponse.json(responseWithHeatmap);
	}),

	// ── PUT /events/:shortId/respond ──────────────────────
	http.put(`${BASE}/events/:shortId/respond`, async ({ params, request }) => {
		const event = EVENTS.find(e => e.shortId === params.shortId && !e.isDeleted);
		if (!event) return new HttpResponse(null, { status: 404 });

		const body = (await request.json()) as {
			available: string[];
			notAvailable: string[];
		};
		const existing = EVENT_USERS.find(
			eu => eu.event.shortId === params.shortId && eu.user.id === ME.id,
		);

		if (existing) {
			existing.available = body.available;
			existing.notAvailable = body.notAvailable;
			existing.updatedAt = new Date().toISOString();
			return HttpResponse.json(existing);
		}

		const newEu: EventUser = {
			id: EVENT_USERS.length + 1,
			event: { id: event.id, shortId: event.shortId, name: event.name },
			user: {
				id: ME.id,
				name: ME.name,
				email: ME.email,
				profilePicture: ME.profilePicture,
			},
			available: body.available,
			notAvailable: body.notAvailable,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		EVENT_USERS.push(newEu);
		return HttpResponse.json(newEu, { status: 201 });
	}),

	// ── POST /events ──────────────────────────────────────────────────────────
	http.post(`${BASE}/events`, async ({ request }) => {
		const body = (await request.json()) as Partial<Event>;
		const newEvent: Event = {
			id: EVENTS.length + 1,
			name: body.name ?? "New Event",
			description: body.description ?? null,
			// shortId: "cozy-hot-toast-1234",
			shortId: shortId(),
			creator: ME,
			type: body.type ?? "SPECIFIC_DATES",
			times: body.times ?? [],
			timeIncrement: body.timeIncrement ?? 30,
			timezone: body.timezone ?? ME.timezone,
			isDeleted: false,
			respondedCount: 0,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		EVENTS.push(newEvent);
		EVENT_USERS.push(
			makeEventUser(EVENT_USERS.length + 1, newEvent, ME, { available: [], notAvailable: [] }),
		);
		return HttpResponse.json(newEvent, { status: 201 });
	}),

	// ── GET /events/:shortId ──────────────────────────────────────────────────
	http.get(`${BASE}/events/:shortId`, ({ params }) => {
		const event = EVENTS.find(e => e.shortId === params.shortId && !e.isDeleted);
		if (!event) return new HttpResponse(null, { status: 404 });
		return HttpResponse.json(event);
	}),

	// ── PATCH /events/:shortId ────────────────────────────────────────────────
	http.patch(`${BASE}/events/:shortId`, async ({ params, request }) => {
		const event = EVENTS.find(e => e.shortId === params.shortId && !e.isDeleted);
		if (!event) return new HttpResponse(null, { status: 404 });
		const body = (await request.json()) as Partial<Event>;
		Object.assign(event, body, { updatedAt: new Date().toISOString() });
		return HttpResponse.json(event);
	}),

	// ── DELETE /events/:shortId ───────────────────────────────────────────────
	http.delete(`${BASE}/events/:shortId`, ({ params }) => {
		const event = EVENTS.find(e => e.shortId === params.shortId);
		if (!event) return new HttpResponse(null, { status: 404 });
		event.isDeleted = true;
		event.updatedAt = new Date().toISOString();
		return new HttpResponse(null, { status: 204 });
	}),
];
