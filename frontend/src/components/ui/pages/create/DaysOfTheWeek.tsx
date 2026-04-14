import { addDays, format, startOfWeek } from "date-fns";
import { enUS } from "date-fns/locale";
import { useGetMe } from "../../../../hooks/query/useGetMe";
import { cn } from "../../../../lib/utils";
import { Button } from "../../button";
import { dateFnsLocale } from "./calendar/Calendar";

interface Props {
	selected: string[];
	setSelected: React.Dispatch<React.SetStateAction<string[]>>;
}

export const DaysOfTheWeek = ({ selected, setSelected }: Props) => {
	const { data: user } = useGetMe();
	const firstDayOfCalendarMonth = startOfWeek(new Date(), {
		weekStartsOn: user?.startOnMonday ? 1 : 0,
	});

	const days = Array.from({ length: 7 }, (_, i) => {
		const localizedDay = (day => day.charAt(0).toUpperCase() + day.slice(1, 3).toLowerCase())(
			format(addDays(firstDayOfCalendarMonth, i), "EEE", {
				locale: dateFnsLocale,
			}),
		);

		const day = format(addDays(firstDayOfCalendarMonth, i), "EEE", {
			locale: enUS,
		}).toUpperCase();

		return { day, localizedDay };
	});

	const toggle = (day: string) => {
		setSelected(prev => (prev.includes(day) ? prev.filter(_day => _day !== day) : [...prev, day]));
	};

	return (
		<div className="flex flex-row justify-between">
			{days.map(({ day, localizedDay }) => (
				<Button
					className={cn(selected.includes(day) && "ring-2 ring-amber-400")}
					key={day}
					size="small"
					variant="orange"
					onClick={() => toggle(day)}
				>
					{localizedDay}
				</Button>
			))}
		</div>
	);
};
