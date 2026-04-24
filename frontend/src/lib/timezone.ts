import { format, fromZonedTime } from "date-fns-tz";

const SLOT_REGEX = /^\d{4}-\d{8}$/;

export function convertSlot(slot: string, fromTz: string, toTz: string): string {
	if (fromTz === toTz || !SLOT_REGEX.test(slot)) return slot;
	const HH = slot.slice(0, 2);
	const mm = slot.slice(2, 4);
	const dd = slot.slice(5, 7);
	const MM = slot.slice(7, 9);
	const yyyy = slot.slice(9, 13);
	const utcDate = fromZonedTime(`${yyyy}-${MM}-${dd}T${HH}:${mm}:00`, fromTz);
	return `${format(utcDate, "HHmm", { timeZone: toTz })}-${format(utcDate, "ddMMyyyy", { timeZone: toTz })}`;
}
