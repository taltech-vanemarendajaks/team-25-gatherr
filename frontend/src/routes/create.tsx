/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <explanation> */
import { createFileRoute } from "@tanstack/react-router";
import { format, setMinutes, startOfDay } from "date-fns";
import { User } from "lucide-react";
import { useEffect, useState } from "react";
import { GoogleIcon } from "../components/icons/GoogleIcon";
import { Accordion } from "../components/ui/accordion";
import { Button } from "../components/ui/button";
import { ComponentExplainer } from "../components/ui/ComponentExplainer";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "../components/ui/dialog";
import { Navbar } from "../components/ui/navbar";
import { ChooseEventTypeSlider } from "../components/ui/pages/create/ChooseEventTypeSlider";
import { END_TIME, START_TIME, TimeSlider } from "../components/ui/pages/create/TimeSlider";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../components/ui/select";
import { useCreateEvent } from "../hooks/mutation/useCreateEvent";
import { useLogin } from "../hooks/mutation/useLogin";
import { useGetMe } from "../hooks/query/useGetMe";
import type { EventType } from "../mocks/types";
import * as m from "../paraglide/messages";

export const Route = createFileRoute("/create")({
	component: Create,
	validateSearch: search => ({
		name: (search.name as string) ?? "",
	}),
});

const DRAFT_KEY = "gatherr:create-event-draft";

interface Draft {
	eventType: EventType;
	calendarSelectedDates: string[];
	selectedDays: string[];
	startTime: number;
	endTime: number;
	timeIncrement: number;
	timezone: string;
}

function loadDraft(): Draft | null {
	try {
		const raw = localStorage.getItem(DRAFT_KEY);
		return raw ? (JSON.parse(raw) as Draft) : null;
	} catch {
		return null;
	}
}

function saveDraft(draft: Draft) {
	localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function clearDraft() {
	localStorage.removeItem(DRAFT_KEY);
}

function Create() {
	const { name } = Route.useSearch();

	const { mutate: createEvent } = useCreateEvent();
	const { mutate: login } = useLogin();
	const { data: user } = useGetMe();

	const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
	const [pendingCreate, setPendingCreate] = useState(false);

	useEffect(() => {
		if (user && pendingCreate) {
			setPendingCreate(false);
			setIsLoginModalOpen(false);
			createEvent(
				{
					name,
					type: eventType,
					times: calculateTimes(),
					timeIncrement,
					timezone,
				},
				{ onSuccess: clearDraft },
			);
		}
	}, [user, pendingCreate]);

	const draft = loadDraft();

	const [calendarSelectedDates, setCalendarSelectedDates] = useState<Date[]>(
		draft?.calendarSelectedDates.map(d => new Date(d)) ?? [],
	);
	const [selectedDays, setSelectedDays] = useState<string[]>(draft?.selectedDays ?? []);

	const [startTime, setStartTime] = useState(draft?.startTime ?? START_TIME);
	const [endTime, setEndTime] = useState(draft?.endTime ?? END_TIME);
	const [timeIncrement, setTimeIncrement] = useState(draft?.timeIncrement ?? 30);

	const [timezone, setTimezone] = useState(
		draft?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
	);

	const [eventType, setEventType] = useState<EventType>(
		draft?.eventType ?? "SPECIFIC_DATES_AND_TIMES",
	);

	useEffect(() => {
		saveDraft({
			eventType,
			calendarSelectedDates: calendarSelectedDates.map(d => d.toISOString()),
			selectedDays,
			startTime,
			endTime,
			timeIncrement,
			timezone,
		});
	}, [eventType, calendarSelectedDates, selectedDays, startTime, endTime, timeIncrement, timezone]);

	/**
	 * Calculates the times array based on the event type:
	 *
	 * SPECIFIC_DATES_AND_TIMES → ["HHmm-DDMMyyyy", ...]  ["0900-31032026", "0930-31032026", "0900-01042026"]
	 * SPECIFIC_DATES           → ["DDMMyyyy", ...]       ["31032026", "01042026"]
	 * WEEKDAYS_AND_TIMES       → ["HHmm-DDD", ...]       ["0900-MON", "0930-MON", "0900-TUE"]
	 * WEEKDAYS                 → ["DDD", ...]            ["MON", "TUE", "FRI"]
	 */
	const calculateTimes = () => {
		if (eventType === "SPECIFIC_DATES_AND_TIMES") {
			const times = [];

			for (let time = startTime * 60; time <= endTime * 60; time = time + timeIncrement) {
				times.push(format(setMinutes(startOfDay(new Date()), time), "HHmm"));
			}

			const timesAndDates = [];
			for (const selectedDate of calendarSelectedDates) {
				const formattedDate = format(selectedDate, "ddMMyyyy");
				for (const time of times) {
					timesAndDates.push(`${time}-${formattedDate}`);
				}
			}
			return timesAndDates;
		} else if (eventType === "SPECIFIC_DATES") {
			const dates = [];
			for (const selectedDate of calendarSelectedDates) {
				const formattedDate = format(selectedDate, "ddMMyyyy");

				dates.push(`${formattedDate}`);
			}
			return dates;
		} else if (eventType === "WEEKDAYS") {
			return selectedDays;
		} else if (eventType === "WEEKDAYS_AND_TIMES") {
			const times = [];

			for (let time = startTime * 60; time <= endTime * 60; time = time + timeIncrement) {
				times.push(format(setMinutes(startOfDay(new Date()), time), "HHmm"));
			}

			const timesAndDays = [];
			for (const selectedDay of selectedDays) {
				for (const time of times) {
					timesAndDays.push(`${time}-${selectedDay}`);
				}
			}
			return timesAndDays;
		}
	};

	return (
		<main className="max-w-md m-auto px-4 sm:px-0">
			<div className="mb-12">
				<Navbar />
			</div>
			<h1 className="text-3xl font-viking text-center mb-6">{name}</h1>
			<ChooseEventTypeSlider
				selected={calendarSelectedDates}
				setSelected={setCalendarSelectedDates}
				selectedDays={selectedDays}
				setSelectedDays={setSelectedDays}
				setEventType={setEventType}
			/>
			<div>
				{(eventType === "SPECIFIC_DATES_AND_TIMES" || eventType === "WEEKDAYS_AND_TIMES") && (
					<>
						<ComponentExplainer
							title={m.create_pick_time_range_title()}
							text={m.create_pick_time_range_text()}
						/>
						<TimeSlider
							startTime={startTime}
							endTime={endTime}
							setStartTime={setStartTime}
							setEndTime={setEndTime}
						/>
					</>
				)}
			</div>

			<div className="mt-16">
				<Accordion
					key="Advanced"
					title={m.create_advanced()}
					body={
						<div className="px-6 mb-2">
							{/* start of time increment */}
							<div className="flex flex-row items-center mb-4">
								<p className="mr-3 text-lg font-semibold">{m.create_time_increment_label()}</p>
								<Select
									value={timeIncrement.toString()}
									onValueChange={value => setTimeIncrement(parseInt(value))}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectItem value="15">15 min</SelectItem>
											<SelectItem value="30">30 min</SelectItem>
											<SelectItem value="60">60 min</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>

							{/* start of time range button */}
							<div className="flex flex-col justify-start mb-4">
								{eventType === "SPECIFIC_DATES_AND_TIMES" || eventType === "WEEKDAYS_AND_TIMES" ? (
									<>
										<p className="text-info text-sm mb-2">{m.create_remove_time_ranges_hint()}</p>
										<Button
											className="self-start"
											onClick={() => {
												if (eventType === "SPECIFIC_DATES_AND_TIMES") {
													setEventType("SPECIFIC_DATES");
												} else if (eventType === "WEEKDAYS_AND_TIMES") {
													setEventType("WEEKDAYS");
												}
											}}
											variant="red"
											size="xs"
										>
											{m.create_remove_time_ranges()}
										</Button>
									</>
								) : (
									<>
										<p className="text-info text-sm mb-2">{m.create_add_time_ranges_hint()}</p>
										<Button
											onClick={() => {
												if (eventType === "SPECIFIC_DATES") {
													setEventType("SPECIFIC_DATES_AND_TIMES");
												} else if (eventType === "WEEKDAYS") {
													setEventType("WEEKDAYS_AND_TIMES");
												}
											}}
											variant="red"
											size="xs"
										>
											{m.create_add_time_ranges()}
										</Button>
									</>
								)}
							</div>

							<div>
								<p className="mb-2 text-lg font-semibold">{m.create_timezone()}</p>
								<Select value={timezone} onValueChange={value => setTimezone(value)}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											{Intl.supportedValuesOf("timeZone").map(_timezone => {
												return (
													<SelectItem key={_timezone} value={_timezone}>
														{_timezone}
													</SelectItem>
												);
											})}
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>
						</div>
					}
				/>
			</div>
			<div className="flex justify-center mt-16 mb-12">
				<Button
					disabled={
						!name.trim() ||
						((eventType === "SPECIFIC_DATES" || eventType === "SPECIFIC_DATES_AND_TIMES") &&
							calendarSelectedDates.length === 0) ||
						((eventType === "WEEKDAYS" || eventType === "WEEKDAYS_AND_TIMES") &&
							selectedDays.length === 0)
					}
					onClick={() => {
						if (!user) {
							setPendingCreate(true);
							setIsLoginModalOpen(true);
							return;
						}
						createEvent(
							{
								name,
								type: eventType,
								times: calculateTimes(),
								timeIncrement,
								timezone,
							},
							{ onSuccess: clearDraft },
						);
					}}
				>
					{m.create_event_button()}
				</Button>
			</div>

			<Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
				<DialogContent className="max-w-sm" showCloseButton={true}>
					<DialogHeader>
						<User className="text-amber-500 mb-8 size-12" />
						<DialogTitle className="font-medium text-2xl mb-8">
							{m.create_sign_in_title()}
						</DialogTitle>
						<Button onClick={() => login()} className="mb-8 px-8">
							<GoogleIcon className="size-8 mr-3" />
							{m.create_continue_with_google()}
						</Button>
						<DialogDescription className="text-info -mb-1">
							{m.create_google_calendar_hint_1()}
						</DialogDescription>
						<DialogDescription className="text-info">
							{m.create_google_calendar_hint_2()}
						</DialogDescription>
					</DialogHeader>
				</DialogContent>
			</Dialog>
		</main>
	);
}
