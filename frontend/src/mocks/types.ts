export type EventType =
	| "SPECIFIC_DATES_AND_TIMES"
	| "SPECIFIC_DATES"
	| "WEEKDAYS"
	| "WEEKDAYS_AND_TIMES";

export interface User {
	id: number;
	name: string;
	email: string;
	profilePicture: string | null;
	timezone: string;
	startOnMonday: boolean;
	timeFormat24: boolean;
	language: string;
	createdAt: string; // ISO 8601
	updatedAt: string; // ISO 8601
}

export interface Event {
	id: number;
	name: string;
	description: string | null;
	shortId: string;
	creator: User;
	type: EventType;
	/** Format: "HHMM-DDMMYYYY", e.g. "0700-10032026" */
	times: string[];
	timeIncrement: number;
	timezone: string;
	isDeleted: boolean;
	createdAt: string; // ISO 8601
	updatedAt: string; // ISO 8601
}

export interface SummarySlotUser {
	id: number;
	name: string;
}

export interface SummarySlot {
	/** Format: "HHMM-DDMMYYYY", e.g. "0700-10032026" */
	slot: string;
	count: number;
	users: SummarySlotUser[];
}

export interface SummaryUserResponse {
	user: Pick<User, "id" | "name" | "profilePicture">;
	available: string[];
	notAvailable: string[];
}

export interface SummaryResponse {
	users: SummaryUserResponse[];
	slots: SummarySlot[];
}

export interface EventUser {
	id: number;
	event: Pick<Event, "id" | "shortId" | "name">;
	user: Pick<User, "id" | "name" | "email" | "profilePicture">;
	available: string[];
	notAvailable: string[];
	createdAt: string; // ISO 8601
	updatedAt: string; // ISO 8601
}
