import { format, isBefore, subDays } from "date-fns";

import { motion } from "motion/react";
import toast from "react-hot-toast";
import { cn } from "../../../../../lib/utils";
import * as m from "../../../../../paraglide/messages";
import { getTextColorForCalendarDate } from "./utils";

interface Props {
	date: Date;
	month: Date;
	selected: Date[];
}
export const CalendarDate = ({ date, month, selected }: Props) => {
	const isSelected = selected.some(_date => _date.getTime() === date.getTime());
	const isDisabled = isBefore(date, subDays(new Date(), 1));

	return (
		<motion.button
			type="button"
			aria-disabled={isDisabled}
			data-date={isDisabled ? undefined : date.toISOString()}
			className={cn(
				"relative w-full h-full m-auto rounded-lg overflow-hidden transition-colors duration-300",
				isSelected && "text-content!",
				getTextColorForCalendarDate({ date, month }),
				isDisabled && "opacity-50 cursor-not-allowed",
			)}
			onClick={() => {
				if (isDisabled) {
					toast.error(m.create_event_calendar_date_disabled(), {
						id: "create_event_calendar_date_disabled",
					});
					return;
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
