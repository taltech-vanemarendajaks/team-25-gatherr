/** biome-ignore-all lint/correctness/useUniqueElementIds: <a> */
/** biome-ignore-all lint/suspicious/noArrayIndexKey: <same letters> */
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
import { useRef, useState } from "react";
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

const removeImmediately: Variants = {
	exit: { visibility: "hidden" },
};
const currentMonthType = "MMMM yyyy";

interface Props {
	selected: Date[];
	setSelected: React.Dispatch<React.SetStateAction<Date[]>>;
}

export const Calendar = ({ selected, setSelected }: Props) => {
	const { data: me } = useGetMe();

	const isDragging = useRef(false);
	const visitedDates = useRef(new Set<string>());
	const dragMode = useRef<"add" | "remove">("add");

	const [isAnimating, setIsAnimating] = useState(false);
	const [direction, setDirection] = useState<number>();
	const [currentMonthString, setCurrentMonthString] = useState(
		format(new Date(), currentMonthType, { locale: dateFnsLocale }),
	);

	const firstDayOfCurrentMonth = parse(currentMonthString, currentMonthType, new Date(), {
		locale: dateFnsLocale,
	});

	const weekStartsOn = me?.startOnMonday === true || me?.startOnMonday === undefined ? 1 : 0;

	const firstDayOfCalendarMonth = startOfWeek(firstDayOfCurrentMonth, {
		weekStartsOn,
	});

	const days = Array.from({ length: 7 }, (_, i) =>
		format(addDays(firstDayOfCalendarMonth, i), "EEEEE", {
			locale: dateFnsLocale,
		}),
	);

	const lastDayOfCalendarMonth = endOfWeek(endOfMonth(firstDayOfCurrentMonth), {
		weekStartsOn,
	});
	const weeks = eachWeekOfInterval(
		{
			start: firstDayOfCalendarMonth,
			end: lastDayOfCalendarMonth,
		},
		{ weekStartsOn },
	);

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
				{days.map((day, index) => (
					<div key={day + index} className="flex justify-center">
						<p className="text-content">{day}</p>
					</div>
				))}
			</div>
			<motion.div variants={animations.calendar.view} custom={direction}>
				<div
					className="grid grid-rows-5 gap-0.5"
					style={{ touchAction: "none" }}
					onPointerDown={e => {
						const el = document.elementFromPoint(e.clientX, e.clientY);
						const dateStr = el?.closest("[data-date]")?.getAttribute("data-date");
						if (!dateStr) return;
						isDragging.current = true;
						visitedDates.current.clear();
						visitedDates.current.add(dateStr);
						const date = new Date(dateStr);
						dragMode.current = selected.some(d => d.toISOString() === dateStr) ? "remove" : "add";
						setSelected(prev => {
							const isAlreadySelected = prev.some(d => d.getTime() === date.getTime());
							if (dragMode.current === "add" && !isAlreadySelected) return [...prev, date];
							if (dragMode.current === "remove" && isAlreadySelected)
								return prev.filter(d => d.getTime() !== date.getTime());
							return prev;
						});
						(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
					}}
					onPointerMove={e => {
						if (!isDragging.current) return;
						const el = document.elementFromPoint(e.clientX, e.clientY);
						const dateStr = el?.closest("[data-date]")?.getAttribute("data-date");
						if (!dateStr || visitedDates.current.has(dateStr)) return;
						visitedDates.current.add(dateStr);
						const date = new Date(dateStr);
						setSelected(prev => {
							const isSelected = prev.some(d => d.getTime() === date.getTime());
							if (dragMode.current === "add" && !isSelected) return [...prev, date];
							if (dragMode.current === "remove" && isSelected)
								return prev.filter(d => d.getTime() !== date.getTime());
							return prev;
						});
					}}
					onPointerUp={() => {
						isDragging.current = false;
						visitedDates.current.clear();
					}}
					onPointerCancel={() => {
						isDragging.current = false;
						visitedDates.current.clear();
					}}
				>
					{weeks.map(week => {
						const daysForWeek = eachDayOfInterval({
							start: startOfWeek(week, { weekStartsOn }),
							end: endOfWeek(week, { weekStartsOn }),
						});
						return (
							<div key={week.toISOString()} className={cn("grid grid-cols-7 gap-0.5 h-10")}>
								{daysForWeek.map(day => (
									<CalendarDate
										key={day.toISOString()}
										date={day}
										month={month}
										selected={selected}
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
