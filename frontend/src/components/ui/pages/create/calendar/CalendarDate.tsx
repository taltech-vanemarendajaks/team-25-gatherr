import { format, isBefore, subDays } from "date-fns";

import { motion } from "motion/react";
import { cn } from "../../../../../lib/utils";
import { getTextColorForCalendarDate } from "./utils";

interface Props {
	date: Date;
	month: Date;
	selected: Date[];
	setSelected: React.Dispatch<React.SetStateAction<Date[]>>;
}

export const CalendarDate = ({ date, month, selected, setSelected }: Props) => {
	const isSelected = selected.some(_date => _date.getTime() === date.getTime());
	const isDisabled = isBefore(date, subDays(new Date(), 1));

	return (
		<motion.button
			type="button"
			data-date={isDisabled ? undefined : date.toISOString()}
			className={cn(
				"relative w-full h-full m-auto rounded-lg overflow-hidden transition-colors duration-300",
				isSelected && "text-content!",
				getTextColorForCalendarDate({ date, month }),
			)}
			disabled={isBefore(date, subDays(new Date(), 1))}
			onClick={() => {
				if (isSelected) {
					setSelected(prev => prev.filter(_date => _date.getTime() !== date.getTime()));
				} else {
					setSelected(prev => [...prev, date]);
				}
			}}
		>
			<motion.span
				initial={false}
				animate={{
					scale: isSelected ? 1.5 : 0,
					opacity: isSelected ? 1 : 0,
				}}
				transition={{
					type: "spring",
					stiffness: 300,
					damping: 30,
				}}
				className="absolute inset-0 pointer-events-none rounded-full bg-primary"
				style={{ originX: 0.5, originY: 0.5 }}
			/>

			<div
				className={cn(
					"relative z-10 flex flex-col h-full justify-center text-sm",
					"duration-300 hover:text-lg",
				)}
			>
				<time className={cn("font-number font-medium")} dateTime={format(date, "dd-MM-yyyy")}>
					{date.getDate()}
				</time>
			</div>
		</motion.button>
	);
};
