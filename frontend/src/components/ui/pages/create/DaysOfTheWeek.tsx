import { cn } from "../../../../lib/utils";
import { Button } from "../../button";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface Props {
	selected: string[];
	setSelected: React.Dispatch<React.SetStateAction<string[]>>;
}

export const DaysOfTheWeek = ({ selected, setSelected }: Props) => {
	const toggle = (day: string) => {
		setSelected(prev => (prev.includes(day) ? prev.filter(_day => _day !== day) : [...prev, day]));
	};

	return (
		<div className="flex flex-row justify-between">
			{DAYS.map(day => (
				<Button
					className={cn(selected.includes(day) && "ring-2 ring-amber-400")}
					key={day}
					size="small"
					variant="orange"
					onClick={() => toggle(day)}
				>
					{day}
				</Button>
			))}
		</div>
	);
};
