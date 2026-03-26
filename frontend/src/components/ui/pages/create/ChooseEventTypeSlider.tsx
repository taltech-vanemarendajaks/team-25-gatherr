import { motion, type Variants } from "motion/react";
import { useState } from "react";
import { cn } from "../../../../lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../tabs";

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

export const ChooseEventTypeSlider = () => {
	const [selectedIndex, setSelectedIndex] = useState(0);
	return (
		<Tabs defaultValue="dates-and-times" className={cn()}>
			<div className="bg-canvas px-4 py-4 rounded-xl shadow-lg shadow-amber-700 max-w-xl m-auto">
				<TabsList>
					<TabsTrigger onClick={() => setSelectedIndex(0)} value="dates-and-times">
						Dates and times
					</TabsTrigger>
					<TabsTrigger onClick={() => setSelectedIndex(1)} value="days-of-the-week">
						Days of the week
					</TabsTrigger>
					<TwoElementMovingBox selectedIndex={selectedIndex} />
				</TabsList>
			</div>
			{/* @todo add calendar in here */}
			<TabsContent value="dates-and-times">tere</TabsContent>
			<TabsContent value="days-of-the-week">hello</TabsContent>
		</Tabs>
	);
};
