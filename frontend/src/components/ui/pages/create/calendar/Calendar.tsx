/** biome-ignore-all lint/correctness/useUniqueElementIds: <a> */
import {
	eachDayOfInterval,
	eachWeekOfInterval,
	endOfMonth,
	endOfWeek,
	format,
	parse,
	startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { motion, type Variants } from "motion/react";
import { useState } from "react";
import { cn } from "../../../../../lib/utils";
import { AnimationWrapper } from "../../../../animations/AnimationWrapper";
import { animations } from "../../../../animations/anim-constants";
import { CalendarDate } from "./CalendarDate";
import { getSeason, nextTimeFrame, previousTimeFrame, seasonEmoji } from "./utils";

// @todo
// add localization
// draggable grid

const removeImmediately: Variants = {
	exit: { visibility: "hidden" },
};
const currentMonthType = "MMMM yyyy";

export const days = {
	short: ["M", "T", "W", "T", "F", "S", "S"],
};

interface Props {
	selected: Date[];
	setSelected: React.Dispatch<React.SetStateAction<Date[]>>;
}

export const Calendar = ({ selected, setSelected }: Props) => {
	const [isAnimating, setIsAnimating] = useState(false);
	const [direction, setDirection] = useState<number>();
	const [currentMonthString, setCurrentMonthString] = useState(
		format(new Date(), currentMonthType),
	);

	const firstDayOfCurrentMonth = parse(currentMonthString, currentMonthType, new Date());
	const firstDayOfCalendarMonth = startOfWeek(firstDayOfCurrentMonth);
	const lastDayOfCalendarMonth = endOfWeek(endOfMonth(firstDayOfCurrentMonth));
	const weeks = eachWeekOfInterval({
		start: firstDayOfCalendarMonth,
		end: lastDayOfCalendarMonth,
	});

	const month = parse(currentMonthString, currentMonthType, new Date());

	const previousMonth = () =>
		previousTimeFrame({
			current: firstDayOfCurrentMonth,
			currentType: currentMonthType,
			setCurrentString: setCurrentMonthString,
			setDirection,
			isAnimating,
			setIsAnimating,
		});

	const nextMonth = () =>
		nextTimeFrame({
			current: firstDayOfCurrentMonth,
			currentType: currentMonthType,
			setCurrentString: setCurrentMonthString,
			setDirection,
			isAnimating,
			setIsAnimating,
		});

	// splice first letter, make it uppercase and then add the rest of the string
	const beautifulCurrentMonth =
		currentMonthString.slice(0, 1).toUpperCase() + currentMonthString.slice(1);

	return (
		<motion.div
			className="overflow-hidden max-w-xs m-auto"
			id="calendarMonth"
			key={currentMonthString}
			initial="enter"
			animate="middle"
			exit="exit"
			onAnimationComplete={() => setIsAnimating(false)}
		>
			<div className="flex items-center justify-center">
				<header className="relative mb-4 flex justify-between items-center min-w-[18rem] max-w-[18rem]">
					<motion.button
						variants={removeImmediately}
						className={cn("z-10 rounded-full cursor-pointer")}
						onClick={previousMonth}
					>
						<AnimationWrapper variants={animations.calendar.dateScale}>
							<ChevronLeft className="size-6 text-content" />
						</AnimationWrapper>
					</motion.button>
					<motion.p
						variants={animations.calendar.header}
						custom={direction}
						className="min-w-32 absolute inset-0 flex items-center justify-center font-semibold text-lg"
					>
						<span className="mr-2">{seasonEmoji[getSeason(month)]}</span>
						<span>{beautifulCurrentMonth}</span>
					</motion.p>
					<motion.button
						variants={removeImmediately}
						className={cn("z-10 rounded-full cursor-pointer")}
						onClick={nextMonth}
					>
						<AnimationWrapper variants={animations.calendar.dateScale}>
							<ChevronRight className="size-6 text-content" />
						</AnimationWrapper>
					</motion.button>
				</header>
			</div>

			<div className="grid grid-cols-7 font-semibold mb-2">
				{days.short.map(day => (
					<div key={day} className="flex justify-center">
						<p className="text-content">{day}</p>
					</div>
				))}
			</div>
			<motion.div variants={animations.calendar.view} custom={direction}>
				<div className="grid grid-rows-5 gap-0.5">
					{weeks.map(week => {
						const daysForWeek = eachDayOfInterval({
							start: startOfWeek(week),
							end: endOfWeek(week),
						});
						return (
							<div key={week.toISOString()} className={cn("grid grid-cols-7 gap-0.5 h-10")}>
								{daysForWeek.map(day => (
									<CalendarDate
										key={day.toISOString()}
										date={day}
										month={month}
										selected={selected}
										setSelected={setSelected}
									/>
								))}
							</div>
						);
					})}
				</div>
			</motion.div>
		</motion.div>
	);
};
