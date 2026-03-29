import { addMonths, format, isBefore, isSameMonth, isToday, subMonths } from "date-fns";
import type { Dispatch, SetStateAction } from "react";

interface TimeFrameProps {
	setCurrentString: Dispatch<SetStateAction<string>>;
	setDirection: Dispatch<SetStateAction<number | undefined>>;
	isAnimating: boolean;
	setIsAnimating: Dispatch<SetStateAction<boolean>>;
	current: Date;
	currentType: string;
}

export const previousTimeFrame = ({
	setCurrentString,
	setDirection,
	isAnimating,
	setIsAnimating,
	current,
	currentType,
}: TimeFrameProps) => {
	if (isAnimating) return;

	setDirection(-1);
	setIsAnimating(true);

	const previous = subMonths(current, 1);

	setCurrentString(format(previous, currentType));
};

export const nextTimeFrame = ({
	setCurrentString,
	setDirection,
	isAnimating,
	setIsAnimating,
	current,
	currentType,
}: TimeFrameProps) => {
	if (isAnimating) return;

	setDirection(1);
	setIsAnimating(true);

	const next = addMonths(current, 1);

	setCurrentString(format(next, currentType));
};

interface GetTextColorForDateProps {
	date: Date;
	month: Date;
}

export const getTextColorForCalendarDate = ({ date, month }: GetTextColorForDateProps) => {
	if (isToday(date)) {
		return "text-primary";
	} else if (isBefore(date, new Date())) {
		return "text-stone-500";
	} else if (!isSameMonth(date, month)) {
		return "text-stone-400";
	} else {
		return "text-content";
	}
};

export const seasonEmoji: Record<string, string> = {
	winter: "⛄️",
	spring: "🌸",
	summer: "🌻",
	autumn: "🍂",
};

export const getSeason = (month: Date) => {
	const monthNumber = month.getMonth() + 1;
	if ((monthNumber >= 1 && monthNumber <= 2) || monthNumber === 12) return "winter";
	else if (monthNumber >= 3 && monthNumber <= 5) return "spring";
	else if (monthNumber >= 6 && monthNumber <= 8) return "summer";
	else if (monthNumber >= 9 && monthNumber <= 11) return "autumn";
	else return "";
};
