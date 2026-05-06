/** biome-ignore-all lint/a11y/noLabelWithoutControl: <explanation> */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { cn } from "../../../../lib/utils";
import { GoogleIcon } from "../../../icons/GoogleIcon";
import { Button } from "../../button";

const MOCK_CALENDARS = [
	{ id: "personal", label: "Tomi's Calendar" },
	{ id: "work", label: "Work Calendar" },
	{ id: "family", label: "Family Calendar" },
];

// Slots that Google Calendar "blocks" — union of 13:00–15:00 and 14:00–16:00
const BLOCKED_HOUR_RANGES = [
	{ from: 10, to: 11 },
	{ from: 13, to: 14 },
	{ from: 17, to: 18 },
];

function isBlockedByCalendar(slot: string): boolean {
	const hhmm = slot.split("-")[0];
	const hour = Number.parseInt(hhmm.slice(0, 2), 10);
	const random = Math.floor(Math.random() * 5);
	return random !== 1
		? BLOCKED_HOUR_RANGES.some(({ from, to }) => hour >= from && hour < to)
		: false;
}

interface Props {
	eventTimes: string[];
	selectedSlots: string[];
	onSync: (available: string[], notAvailable: string[]) => void;
}

export const GoogleCalendarSync = ({ eventTimes, selectedSlots, onSync }: Props) => {
	const [open, setOpen] = useState(false);
	const [checked, setChecked] = useState<Set<string>>(new Set());
	const [synced, setSynced] = useState(false);

	const toggle = (id: string) => {
		setChecked(prev => {
			const next = new Set(prev);
			next.has(id) ? next.delete(id) : next.add(id);
			return next;
		});
	};

	const handleImport = () => {
		const busySlots = eventTimes.filter(isBlockedByCalendar);
		const busySet = new Set(busySlots);

		const newAvailable = selectedSlots.filter(s => !busySet.has(s));
		const newNotAvailable = busySlots;

		onSync(newAvailable, newNotAvailable);
		setSynced(true);
		setOpen(false);
		toast.success("Google Calendar synced");
	};

	// if (synced) {
	// 	return (
	// 		<div className="flex items-center gap-2 text-sm text-info mb-8">
	// 			<GoogleIcon className="size-4" />
	// 			<span>Google Calendar synced</span>
	// 		</div>
	// 	);
	// }

	return (
		<div className="mb-8">
			{!open ? (
				<Button size="sm" variant="orange" onClick={() => setOpen(true)} className="gap-2">
					<GoogleIcon className="size-4" />
					Sync Google Calendar
				</Button>
			) : (
				<div className="bg-canvas rounded-2xl p-4 space-y-4 mx-4 flex flex-col justify-center">
					<div className="flex items-center gap-2 mb-4">
						<GoogleIcon className="size-6" />
						<p className="font-semibold text-xl">Select calendars to import</p>
					</div>
					<div className="space-y-3">
						{MOCK_CALENDARS.map(cal => (
							<label key={cal.id} className="flex items-center gap-3 cursor-pointer select-none">
								<div
									className={cn(
										"size-5 rounded border-2 flex items-center justify-center transition-colors",
										checked.has(cal.id)
											? "bg-primary border-primary"
											: "border-muted-foreground/40",
									)}
									onClick={() => toggle(cal.id)}
								>
									{checked.has(cal.id) && <CalendarIcon className="size-3 text-white" />}
								</div>
								<span className="text-sm">{cal.label}</span>
							</label>
						))}
					</div>
					<div className="flex gap-2 pt-1">
						<Button className="px-4" size="sm" onClick={handleImport} disabled={checked.size === 0}>
							Import busy times
						</Button>
						<Button
							size="sm"
							variant="red"
							onClick={() => {
								setOpen(false);
								setChecked(new Set());
							}}
						>
							Cancel
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};
