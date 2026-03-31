import { createFileRoute } from "@tanstack/react-router";
import { format, setMinutes, startOfDay } from "date-fns";
import { useState } from "react";
import { Accordion } from "../components/ui/accordion";
import { Button } from "../components/ui/button";
import { ComponentExplainer } from "../components/ui/ComponentExplainer";
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
import { useGetMe } from "../hooks/query/useGetMe";
import type { EventType } from "../mocks/types";

export const Route = createFileRoute("/create")({
	component: Create,
	validateSearch: search => ({
		name: (search.name as string) ?? "",
	}),
});

function Create() {
	const { name } = Route.useSearch();

	const { mutate } = useCreateEvent();

	const { data: user } = useGetMe();

	const [calendarSelectedDates, setCalendarSelectedDates] = useState<Date[]>([]);
	const [selectedDays, setSelectedDays] = useState<string[]>([]);

	const [startTime, setStartTime] = useState(START_TIME);
	const [endTime, setEndTime] = useState(END_TIME);
	const [timeIncrement, setTimeIncrement] = useState(30);

	const [eventType, setEventType] = useState<EventType>("SPECIFIC_DATES_AND_TIMES");

	/**
	 * @todo implement different event types when calculating
	 * Calculates the times array based on the event type:
	 *
	 * SPECIFIC_DATES_AND_TIMES → ["HHmm-DDMMyyyy", ...]  ["0900-31032026", "0930-31032026", "0900-01042026"]
	 * SPECIFIC_DATES           → ["DDMMyyyy", ...]       ["31032026", "01042026"]
	 * WEEKDAYS_AND_TIMES       → ["HHmm-DDD", ...]       ["0900-MON", "0930-MON", "0900-TUE"]
	 * WEEKDAYS                 → ["DDD", ...]            ["MON", "TUE", "FRI"]
	 */
	const calculateTimes = () => {
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
	};

	return (
		<main className="px-8 py-12">
			<h1 className="text-2xl text-center mb-5">{name}</h1>
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
						<ComponentExplainer title="Pick a time range" text="Press and drag to select" />
						<TimeSlider
							startTime={startTime}
							endTime={endTime}
							setStartTime={setStartTime}
							setEndTime={setEndTime}
						/>
					</>
				)}
			</div>

			<div className="mt-8">
				<Accordion
					key="Advanced"
					title="Advanced"
					body={
						<div className="px-6 mb-2">
							{/* start of time increment */}
							<div className="flex flex-row items-center mb-4">
								<p className="mr-3">Time increment:</p>
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
							<div className="text-center">
								{eventType === "SPECIFIC_DATES_AND_TIMES" || eventType === "WEEKDAYS_AND_TIMES" ? (
									<>
										<p className="text-info text-sm mb-2">
											If you wish to only have dates press this
										</p>
										<Button
											onClick={() => {
												if (eventType === "SPECIFIC_DATES_AND_TIMES") {
													setEventType("SPECIFIC_DATES");
												} else if (eventType === "WEEKDAYS_AND_TIMES") {
													setEventType("WEEKDAYS");
												}
											}}
											variant="red"
											size="small"
										>
											Remove time ranges
										</Button>
									</>
								) : (
									<>
										<p className="text-info text-sm mb-2">
											If you wish to also have times press this
										</p>
										<Button
											onClick={() => {
												if (eventType === "SPECIFIC_DATES") {
													setEventType("SPECIFIC_DATES_AND_TIMES");
												} else if (eventType === "WEEKDAYS") {
													setEventType("WEEKDAYS_AND_TIMES");
												}
											}}
											variant="red"
											size="small"
										>
											Add time ranges
										</Button>
									</>
								)}
							</div>

							{/* start of timezone */}
							{/* @todo */}
						</div>
					}
				/>
			</div>
			<div className="flex justify-center mt-16">
				<Button
					disabled={
						((eventType === "SPECIFIC_DATES" || eventType === "SPECIFIC_DATES_AND_TIMES") &&
							calendarSelectedDates.length === 0) ||
						((eventType === "WEEKDAYS" || eventType === "WEEKDAYS_AND_TIMES") &&
							selectedDays.length === 0)
					}
					onClick={() =>
						mutate({
							name,
							type: eventType,
							times: calculateTimes(),
							timeIncrement,
							timezone: "Europe/Tallinn",
							creator: user,
						})
					}
				>
					Create Event
				</Button>
			</div>
		</main>
	);
}
