export type EventType = "SPECIFIC_DATES" | "DAYS_OF_THE_WEEK";

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

export interface EventUser {
	id: number;
	event: Pick<Event, "id" | "shortId" | "name">;
	user: Pick<User, "id" | "name" | "email" | "profilePicture">;
	available: string[];
	notAvailable: string[];
	createdAt: string; // ISO 8601
	updatedAt: string; // ISO 8601
}
