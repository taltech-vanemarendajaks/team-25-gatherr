/** biome-ignore-all lint/correctness/useUniqueElementIds: <a> */
import {
	addDays,
	eachDayOfInterval,
	eachWeekOfInterval,
	endOfMonth,
	endOfWeek,
	format,
	parse,
	startOfWeek,
} from "date-fns";
import { enUS, et, type Locale } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, type Variants } from "motion/react";
import { useState } from "react";
import { useGetMe } from "../../../../../hooks/query/useGetMe";
import { cn } from "../../../../../lib/utils";
import { getLocale } from "../../../../../paraglide/runtime";
import { AnimationWrapper } from "../../../../animations/AnimationWrapper";
import { animations } from "../../../../animations/anim-constants";
import { CalendarDate } from "./CalendarDate";
import { getSeason, nextTimeFrame, previousTimeFrame, seasonEmoji } from "./utils";

const dateFnsLocales: Record<string, Locale> = {
	en: enUS,
	et: et,
};

export const dateFnsLocale = dateFnsLocales[getLocale()] ?? enUS;
// @todo
// draggable grid

const removeImmediately: Variants = {
	exit: { visibility: "hidden" },
};
const currentMonthType = "MMMM yyyy";

interface Props {
	selected: Date[];
	setSelected: React.Dispatch<React.SetStateAction<Date[]>>;
}

export const Calendar = ({ selected, setSelected }: Props) => {
	const { data: user } = useGetMe();

	const [isAnimating, setIsAnimating] = useState(false);
	const [direction, setDirection] = useState<number>();
	const [currentMonthString, setCurrentMonthString] = useState(
		format(new Date(), currentMonthType, { locale: dateFnsLocale }),
	);

	const firstDayOfCurrentMonth = parse(currentMonthString, currentMonthType, new Date(), {
		locale: dateFnsLocale,
	});

	const firstDayOfCalendarMonth = startOfWeek(firstDayOfCurrentMonth, {
		weekStartsOn: user?.startOnMonday ? 1 : 0,
	});

	const days = Array.from({ length: 7 }, (_, i) =>
		format(addDays(firstDayOfCalendarMonth, i), "EEEEE", {
			locale: dateFnsLocale,
		}),
	);

	const lastDayOfCalendarMonth = endOfWeek(endOfMonth(firstDayOfCurrentMonth));
	const weeks = eachWeekOfInterval({
		start: firstDayOfCalendarMonth,
		end: lastDayOfCalendarMonth,
	});

	const month = parse(currentMonthString, currentMonthType, new Date(), {
		locale: dateFnsLocale,
	});

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
						type="button"
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
						type="button"
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
				{days.map(day => (
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
