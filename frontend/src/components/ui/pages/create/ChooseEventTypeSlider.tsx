import { motion, type Variants } from "motion/react";
import { useState } from "react";
import { cn } from "../../../../lib/utils";
import type { EventType } from "../../../../mocks/types";
import * as m from "../../../../paraglide/messages";
import { ComponentExplainer } from "../../ComponentExplainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../tabs";
import { Calendar } from "./calendar/Calendar";
import { DaysOfTheWeek } from "./DaysOfTheWeek";

interface TwoElementMovingBoxProps {
	selectedIndex: number;
	duration?: number;
}

const TwoElementMovingBox = ({ selectedIndex, duration = 0.4 }: TwoElementMovingBoxProps) => {
	const whiteMovingBox: Variants = {
		active: {
			left: "0%",
			transition: {
				ease: "easeOut",
				duration,
			},
		},
		inactive: {
			left: "50%",
			transition: {
				ease: "easeOut",
				duration,
			},
		},
	};
	return (
		<motion.div
			variants={whiteMovingBox}
			animate={selectedIndex === 0 ? "active" : "inactive"}
			className="bg-primary absolute inset-0 w-[50%] rounded-2xl shadow-lg/60 shadow-amber-900"
		/>
	);
};

interface Props {
	selected: Date[];
	setSelected: React.Dispatch<React.SetStateAction<Date[]>>;
	selectedDays: string[];
	setSelectedDays: React.Dispatch<React.SetStateAction<string[]>>;
	setEventType: React.Dispatch<React.SetStateAction<EventType>>;
}

export const ChooseEventTypeSlider = ({
	selected,
	setSelected,
	selectedDays,
	setSelectedDays,
	setEventType,
}: Props) => {
	const [selectedIndex, setSelectedIndex] = useState(0);
	return (
		<Tabs defaultValue="dates-and-times" className={cn()}>
			<div className="bg-canvas p-2 rounded-xl max-w-xl m-auto">
				<TabsList>
					<TabsTrigger
						onClick={() => {
							setSelectedIndex(0);
							setEventType("SPECIFIC_DATES_AND_TIMES");
						}}
						value="dates-and-times"
					>
						{m.choose_event_type_dates_and_times()}
					</TabsTrigger>
					<TabsTrigger
						onClick={() => {
							setSelectedIndex(1);
							setEventType("WEEKDAYS_AND_TIMES");
						}}
						value="days-of-the-week"
					>
						{m.choose_event_type_weekdays()}
					</TabsTrigger>
					<TwoElementMovingBox selectedIndex={selectedIndex} />
				</TabsList>
			</div>
			<TabsContent value="dates-and-times">
				<ComponentExplainer
					title={m.choose_event_type_dates_title()}
					text={m.choose_event_type_dates_text()}
				/>
				<div className="mb-8 bg-canvas rounded-xl py-6 max-w-xs m-auto px-4">
					<Calendar selected={selected} setSelected={setSelected} />
				</div>
			</TabsContent>
			<TabsContent value="days-of-the-week">
				<ComponentExplainer
					title={m.choose_event_type_days_title()}
					text={m.choose_event_type_days_text()}
				/>
				<div className="mb-8 bg-canvas rounded-xl py-4 px-4">
					<DaysOfTheWeek selected={selectedDays} setSelected={setSelectedDays} />
				</div>
			</TabsContent>
		</Tabs>
	);
};
