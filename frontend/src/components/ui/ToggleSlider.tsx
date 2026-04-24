import { motion, type Variants } from "motion/react";
import { cn } from "../../lib/utils";

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
			className="bg-primary absolute inset-0 w-[50%] rounded-2xl shadow-lg/60 shadow-amber-900 pointer-events-none"
		/>
	);
};

interface Props {
	options: [string, string];
	selectedIndex: number; // 0 or 1
	setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
	onChange?: (index: number) => void;
}

export const ToggleSlider = ({ options, selectedIndex, setSelectedIndex, onChange }: Props) => {
	return (
		<div className="bg-canvas rounded-xl">
			<div
				className={cn(
					"flex flex-row relative px-1 w-full flex-1 bg-canvas rounded-xl",
					"shadow-lg",
				)}
			>
				{options.map((option, index) => {
					return (
						<button
							key={option}
							type="button"
							onClick={() => {
								setSelectedIndex(index);

								onChange?.(index);
							}}
							className={cn(
								"z-10 w-full my-auto text-center ring-offset-background rounded-xl mx-[0.2rem] font-normal px-5 py-2 opacity-20 inline-flex items-center justify-center whitespace-nowrap",
								"hover:opacity-100 data-[state=active]:text-foreground",
								"disabled:pointer-events-none disabled:opacity-50",
								"touch-manipulation",
								selectedIndex === index && "opacity-100",
							)}
						>
							{option}
						</button>
					);
				})}
				<TwoElementMovingBox selectedIndex={selectedIndex} />
			</div>
		</div>
	);
};
