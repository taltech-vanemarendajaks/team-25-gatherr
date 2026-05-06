/** biome-ignore-all lint/correctness/useUniqueElementIds: <a> */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */
/** biome-ignore-all lint/suspicious/noArrayIndexKey: <same letters> */
import {
	addDays,
	eachDayOfInterval,
	eachWeekOfInterval,
	endOfMonth,
	endOfWeek,
	format,
	getISOWeek,
	isBefore,
	parse,
	startOfWeek,
	subDays,
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
import { Button } from "../../../button";
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

const weekPrefix = getLocale() === "et" ? "N" : "W";

export const Calendar = ({ selected, setSelected }: Props) => {
	const { data: me } = useGetMe();

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

			<div className="grid grid-cols-[2rem_repeat(7,1fr)] font-semibold mb-2">
				<div />
				{days.map((day, index) => (
					<div key={day + index} className="flex justify-center">
						<p className="text-content">{day}</p>
					</div>
				))}
			</div>
			<motion.div variants={animations.calendar.view} custom={direction}>
				<div
					className="grid grid-rows-5 gap-0.5"
					onClick={e => {
						const el = e.target as HTMLElement;
						const dateStr = el?.closest("[data-date]")?.getAttribute("data-date");
						if (!dateStr) return;
						const date = new Date(dateStr);
						setSelected(prev => {
							const isAlreadySelected = prev.some(d => d.getTime() === date.getTime());
							if (isAlreadySelected) return prev.filter(d => d.getTime() !== date.getTime());
							return [...prev, date];
						});
					}}
				>
					{weeks.map(week => {
						const daysForWeek = eachDayOfInterval({
							start: startOfWeek(week, { weekStartsOn }),
							end: endOfWeek(week, { weekStartsOn }),
						});
						const futureDays = daysForWeek.filter(d => !isBefore(d, subDays(new Date(), 1)));
						const allFutureSelected =
							futureDays.length > 0 &&
							futureDays.every(d => selected.some(s => s.getTime() === d.getTime()));

						return (
							<div
								key={week.toISOString()}
								className={cn("grid grid-cols-[2rem_repeat(7,1fr)] gap-0.5 h-10")}
							>
								<Button
									variant="dark"
									type="button"
									size="xs"
									className={cn(
										"mr-4 text-[0.6rem] font-medium border-b-4",
										futureDays.length === 0 && "opacity-30 cursor-default",
									)}
									disabled={futureDays.length === 0}
									onClick={() => {
										if (allFutureSelected) {
											setSelected(prev =>
												prev.filter(d => !futureDays.some(fd => fd.getTime() === d.getTime())),
											);
										} else {
											setSelected(prev => {
												const toAdd = futureDays.filter(
													d => !prev.some(s => s.getTime() === d.getTime()),
												);
												return [...prev, ...toAdd];
											});
										}
									}}
								>
									{weekPrefix}
									{getISOWeek(week)}
								</Button>
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
