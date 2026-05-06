import { faker } from "@faker-js/faker";
import type { Event, EventType, EventUser, User } from "./types";

// Fixed seed = same data every refresh
faker.seed(43);

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
		for (let h = 10; h <= 22; h++) {
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
		profilePicture: null,
		// profilePicture: faker.datatype.boolean(0.6) ? faker.image.avatar() : null,
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
	name: "Tomi",
	email: "tomi@demo.ee",
	timezone: "Europe/Tallinn",
	startOnMonday: true,
	timeFormat24: true,
	language: "EN",
});

export const JAMES: User = makeUser(6, {
	name: "Britishhh Dudee",
	email: "james@demo.co.uk",
	timezone: "Europe/London",
	startOnMonday: true,
	timeFormat24: false,
	language: "EN",
});

export const USERS: User[] = [
	ME,
	makeUser(2, { name: "Oliver", email: "oliver@demo.ee" }),
	makeUser(3, { name: "Karina", email: "karina@demo.ee" }),
	makeUser(4, { name: "Kaur", email: "kaur@demo.ee" }),
	makeUser(5, { name: "Ingrid", email: "ingrid@demo.ee" }),
	JAMES,
];

// ─── Events ──────────────────────────────────────────────────────────────────

function makeEvent(id: number, creator: User, overrides: Partial<Event> = {}): Event {
	const increment = faker.helpers.arrayElement([30]);
	const type: EventType = "SPECIFIC_DATES";
	const startDate = faker.date.soon({ days: 5 });
	const times = generateTimeSlots(startDate, 12, increment);

	return {
		id,
		name: faker.helpers.arrayElement([
			"Palworld pela",
			"Game Night",
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
		respondedCount: faker.number.int({ min: 0, max: 5 }),
		isDeleted: false,
		createdAt: faker.date.past({ years: 0.5 }).toISOString(),
		updatedAt: isoNow(),
		...overrides,
	};
}

function demoSlots(): string[] {
	const slots: string[] = [];
	for (let d = 1; d <= 4; d++) {
		const date = new Date();
		date.setDate(date.getDate() + d);
		const dd = String(date.getDate()).padStart(2, "0");
		const mm = String(date.getMonth() + 1).padStart(2, "0");
		const yyyy = date.getFullYear();
		const dateStr = `${dd}${mm}${yyyy}`;
		for (let h = 9; h < 18; h++) {
			for (const min of [0, 30]) {
				slots.push(`${String(h).padStart(2, "0")}${String(min).padStart(2, "0")}-${dateStr}`);
			}
		}
	}
	return slots;
}

function gatherSlots(): string[] {
	const slots: string[] = [];
	const dates = [
		"11052026",
		"12052026",
		"13052026",
		"14052026",
		"15052026",
		"16052026",
		"17052026",
		"23052026",
		"24052026",
	];
	for (const dateStr of dates) {
		for (let h = 12; h <= 22; h++) {
			for (const min of [0, 30]) {
				if (h === 22 && min === 30) continue;
				slots.push(`${String(h).padStart(2, "0")}${String(min).padStart(2, "0")}-${dateStr}`);
			}
		}
	}
	return slots;
}

const DEMO_TIMES = demoSlots();
const GATHER_TIMES = gatherSlots();

export const GATHER_EVENT: Event = {
	id: 20,
	name: "Game Night",
	description: null,
	shortId: "game-night",
	creator: ME,
	type: "SPECIFIC_DATES_AND_TIMES",
	times: GATHER_TIMES,
	timeIncrement: 30,
	timezone: "Europe/Tallinn",
	isDeleted: false,
	respondedCount: 4,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
};

export const DEMO_EVENT: Event = {
	id: 10,
	name: "Gaming",
	description: null,
	shortId: "english",
	creator: ME,
	type: "SPECIFIC_DATES_AND_TIMES",
	times: DEMO_TIMES,
	timeIncrement: 30,
	timezone: "Europe/London",
	isDeleted: false,
	respondedCount: 2,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
};

export const EVENTS: Event[] = [
	GATHER_EVENT,
	DEMO_EVENT,
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

const jamesAvailable = DEMO_TIMES.filter(s => {
	const h = parseInt(s.slice(0, 2));
	return h >= 9 && h < 14;
});
const tomiAvailable = DEMO_TIMES.filter(s => {
	const h = parseInt(s.slice(0, 2));
	return h >= 12 && h < 18;
});

// "game-night" event availability — all three only overlap on Wed May 13 at 19:00 (peak)
const gatherOliver = GATHER_TIMES.filter(s => {
	const dateStr = s.slice(5);
	const h = parseInt(s.slice(0, 2));
	if (dateStr === "13052026") return h >= 18 && h < 21; // Wed: 18:00–20:30
	return h >= 14 && h < 17; // other days: 14:00–16:30 (no triple overlap)
});
const gatherKarina = GATHER_TIMES.filter(s => {
	const dateStr = s.slice(5);
	const h = parseInt(s.slice(0, 2));
	if (dateStr === "13052026") return h >= 19; // Wed: 19:00–22:00
	return h >= 20; // other days: 20:00–22:00 (no triple overlap)
});
const gatherKaur = GATHER_TIMES.filter(s => {
	const dateStr = s.slice(5);
	const h = parseInt(s.slice(0, 2));
	if (dateStr === "13052026") return h >= 16 && h < 20; // Wed: 16:00–19:30
	return h >= 12 && h < 15; // other days: 12:00–14:30 (no triple overlap)
});

export const EVENT_USERS: EventUser[] = [
	makeEventUser(20, GATHER_EVENT, ME, { available: [], notAvailable: [] }),
	makeEventUser(21, GATHER_EVENT, USERS[1], { available: gatherOliver, notAvailable: [] }),
	makeEventUser(22, GATHER_EVENT, USERS[2], { available: gatherKarina, notAvailable: [] }),
	makeEventUser(23, GATHER_EVENT, USERS[3], { available: gatherKaur, notAvailable: [] }),
	makeEventUser(11, DEMO_EVENT, JAMES, { available: jamesAvailable, notAvailable: [] }),
	makeEventUser(12, DEMO_EVENT, ME, { available: tomiAvailable, notAvailable: [] }),
	makeEventUser(1, EVENTS[2], ME, { available: [], notAvailable: [] }),
	makeEventUser(2, EVENTS[2], USERS[1]),
	makeEventUser(3, EVENTS[2], USERS[2]),
	makeEventUser(8, EVENTS[2], USERS[4]),
	makeEventUser(4, EVENTS[3], ME, { available: [], notAvailable: [] }),
	makeEventUser(5, EVENTS[3], USERS[3]),
	makeEventUser(6, EVENTS[5], ME, { available: [], notAvailable: [] }),
];

for (const event of EVENTS) {
	event.respondedCount = EVENT_USERS.filter(eu => eu.event.id === event.id).length;
}
