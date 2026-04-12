import { faker } from "@faker-js/faker";
import type { Event, EventType, EventUser, User } from "./types";

// Fixed seed = same data every refresh
faker.seed(42);

// ─── Helpers ────────────────────────────────────────────────────────────────

function isoNow(): string {
	return new Date().toISOString();
}

/**
 * Generates time slot strings in backend format: "HHMM-DDMMYYYY"
 * e.g. "0700-10032026"
 */
function generateTimeSlots(startDate: Date, numberOfDays: number, increment: number): string[] {
	const slots: string[] = [];
	for (let d = 0; d <= numberOfDays; d++) {
		const date = new Date(startDate);
		date.setDate(date.getDate() + d);
		const dd = String(date.getDate()).padStart(2, "0");
		const mm = String(date.getMonth() + 1).padStart(2, "0");
		const yyyy = date.getFullYear();
		const dateStr = `${dd}${mm}${yyyy}`;
		for (let h = 8; h <= 14; h++) {
			for (let m = 0; m < 60; m += increment) {
				slots.push(`${String(h).padStart(2, "0")}${String(m).padStart(2, "0")}-${dateStr}`);
			}
		}
	}
	return slots;
}

export function shortId(): string {
	return `cozy-hot-toast-${faker.string.alphanumeric(8)}`;
}

// ─── Users ───────────────────────────────────────────────────────────────────

function makeUser(id: number, overrides: Partial<User> = {}): User {
	return {
		id,
		name: faker.person.fullName(),
		email: faker.internet.email(),
		profilePicture: faker.datatype.boolean(0.6) ? faker.image.avatarGitHub() : null,
		timezone: faker.helpers.arrayElement(["Europe/Tallinn", "Europe/London"]),
		startOnMonday: faker.datatype.boolean(0.7),
		timeFormat24: faker.datatype.boolean(0.6),
		language: faker.helpers.arrayElement(["EN", "ET"]),
		createdAt: faker.date.past({ years: 1 }).toISOString(),
		updatedAt: isoNow(),
		...overrides,
	};
}

/** The hardcoded "logged in" user — always returned by GET /users/me */
export const ME: User = makeUser(1, {
	name: "Tomi Markus Alber",
	email: "tomimarkus@alber.ee",
	timezone: "Europe/Tallinn",
	startOnMonday: true,
	timeFormat24: true,
	language: "EN",
});

export const USERS: User[] = [ME, makeUser(2), makeUser(3), makeUser(4), makeUser(5)];

// ─── Events ──────────────────────────────────────────────────────────────────

function makeEvent(id: number, creator: User, overrides: Partial<Event> = {}): Event {
	const increment = faker.helpers.arrayElement([30]);
	const type: EventType = "SPECIFIC_DATES";
	const startDate = faker.date.soon({ days: 5 });
	const times = generateTimeSlots(startDate, 12, increment);

	return {
		id,
		name: faker.helpers.arrayElement([
			"Team Standup",
			"Team Standup",
			"Birthday party",
			"Team Standup",
		]),
		description: faker.datatype.boolean(0.7) ? faker.lorem.sentences(2) : null,
		shortId: shortId(),
		creator,
		type,
		times,
		timeIncrement: increment,
		timezone: creator.timezone,
		isDeleted: false,
		createdAt: faker.date.past({ years: 0.5 }).toISOString(),
		updatedAt: isoNow(),
		...overrides,
	};
}

export const EVENTS: Event[] = [
	makeEvent(1, ME, { shortId: "cozy-hot-toast-1234" }),
	makeEvent(2, ME),
	makeEvent(3, ME),
	makeEvent(4, USERS[1]),
	makeEvent(5, USERS[2]),
	makeEvent(6, USERS[3]),
];

// ─── EventUsers (availability responses) ─────────────────────────────────────

export function makeEventUser(
	id: number,
	event: Event,
	user: User,
	overrides: { available?: string[]; notAvailable?: string[] } = {},
): EventUser {
	// Pick a random subset of event.times as available
	// Other users get ~70% of slots marked available; ME starts with none
	const shuffled = faker.helpers.shuffle([...event.times]);
	const splitAt = faker.number.int({
		min: Math.floor(shuffled.length * 0.3),
		max: Math.floor(shuffled.length * 0.7),
	});
	const available = overrides.available ?? shuffled.slice(0, splitAt);
	const notAvailable = overrides.notAvailable ?? shuffled.slice(splitAt);

	return {
		id,
		event: { id: event.id, shortId: event.shortId, name: event.name },
		user: {
			id: user.id,
			name: user.name,
			email: user.email,
			profilePicture: user.profilePicture,
		},
		available,
		notAvailable,
		createdAt: faker.date.past({ years: 0.1 }).toISOString(),
		updatedAt: isoNow(),
	};
}

export const EVENT_USERS: EventUser[] = [
	makeEventUser(1, EVENTS[0], ME, { available: [], notAvailable: [] }),
	makeEventUser(2, EVENTS[0], USERS[1]),
	makeEventUser(3, EVENTS[0], USERS[2]),
	makeEventUser(8, EVENTS[0], USERS[4]),
	makeEventUser(4, EVENTS[1], ME, { available: [], notAvailable: [] }),
	makeEventUser(5, EVENTS[1], USERS[3]),
	makeEventUser(6, EVENTS[3], ME, { available: [], notAvailable: [] }),
];
