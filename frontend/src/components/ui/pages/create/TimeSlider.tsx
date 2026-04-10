/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <no need> */

import { format, setHours, startOfDay } from "date-fns";
import { motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import { cn } from "../../../../lib/utils";

const OBJECT_OVERFLOW = 20;
const GRADIENT_BAR_OFFSET = 10;
export const START_TIME = 8;
export const END_TIME = 17;

interface ConvertProps {
	trackWidth: number;
	minHour: number;
	totalHours: number;
	overflow: number;
}

interface PositionToHourProps extends ConvertProps {
	position: number;
}

interface HourToPositionProps extends ConvertProps {
	hour: number;
}
const convertPositionToHour = ({
	minHour,
	overflow,
	position,
	totalHours,
	trackWidth,
}: PositionToHourProps) => {
	return Math.round((position / (trackWidth - overflow)) * totalHours) + minHour;
};

const convertHourToPosition = ({
	minHour,
	overflow,
	hour,
	totalHours,
	trackWidth,
}: HourToPositionProps) => {
	return ((hour - minHour) / totalHours) * (trackWidth - overflow);
};

interface Props {
	startTime: number;
	setStartTime: React.Dispatch<React.SetStateAction<number>>;
	endTime: number;
	setEndTime: React.Dispatch<React.SetStateAction<number>>;
	useFullTimeRange?: boolean;
}

export const TimeSlider = ({
	startTime,
	endTime,
	setStartTime,
	setEndTime,
	useFullTimeRange = true,
}: Props) => {
	const minHour = useFullTimeRange ? 0 : 8;
	const totalHours = useFullTimeRange ? 23 : 13;

	const trackRef = useRef<HTMLDivElement>(null);

	const trackWidth = useMotionValue(0);
	const leftX = useMotionValue(0);
	const rightX = useMotionValue(0);

	const highlightedBarWidth = useTransform([leftX, rightX], ([left, right]: number[]) => {
		return right - left + GRADIENT_BAR_OFFSET;
	});
	const highlightedBarLeft = useTransform(leftX, left => {
		return left + GRADIENT_BAR_OFFSET;
	});

	useEffect(() => {
		const observer = new ResizeObserver(entries => {
			const width = entries[0].contentRect.width;
			trackWidth.set(width);
			leftX.set(
				convertHourToPosition({
					hour: START_TIME,
					minHour,
					overflow: OBJECT_OVERFLOW,
					totalHours,
					trackWidth: width,
				}),
			);
			rightX.set(
				convertHourToPosition({
					hour: END_TIME,
					minHour,
					overflow: OBJECT_OVERFLOW,
					totalHours,
					trackWidth: width,
				}),
			);
		});
		if (trackRef.current) {
			observer.observe(trackRef.current);
		}

		leftX.on("change", position => {
			setStartTime(() =>
				convertPositionToHour({
					position,
					minHour,
					overflow: OBJECT_OVERFLOW,
					totalHours,
					trackWidth: trackWidth.get(),
				}),
			);
		});
		rightX.on("change", position => {
			setEndTime(() =>
				convertPositionToHour({
					position,
					minHour,
					overflow: OBJECT_OVERFLOW,
					totalHours,
					trackWidth: trackWidth.get(),
				}),
			);
		});

		return () => observer.disconnect();
	}, []);

	return (
		<div className="flex flex-col items-center mb-12">
			<div className="flex-row flex justify-center font-medium font-number mb-7 text-2xl">
				<p>{format(setHours(startOfDay(new Date()), startTime), "HH:mm")}</p>
				<p>-</p>
				<p>{format(setHours(startOfDay(new Date()), endTime), "HH:mm")}</p>
			</div>
			<div
				ref={trackRef}
				className="h-5 rounded-xl min-w-xs max-w-md relative bg-canvas ring-2 ring-amber-300"
			>
				<motion.div
					className="bg-linear-to-r from-orange-600 via-yellow-500 to-orange-600 absolute h-5 shadow-md shadow-amber-400"
					style={{ x: highlightedBarLeft, width: highlightedBarWidth }}
				/>
				<motion.div
					drag="x"
					dragElastic={0}
					dragMomentum={false}
					dragConstraints={trackRef}
					onDrag={() => {
						if (leftX.get() >= rightX.get()) {
							leftX.set(rightX.get());
						}
					}}
					className={cn(
						"absolute ring-2 ring-amber-300 bg-linear-to-tr from-primary from-5% to-[#C21515] w-5 h-16 rounded-lg -top-5.5",
						"shadow-[0_0_8px_2px_rgba(251,191,36,0.5)]",
						"touch-manipulation",
					)}
					style={{
						x: leftX,
					}}
				/>
				<motion.div
					drag="x"
					dragElastic={0}
					dragMomentum={false}
					dragConstraints={trackRef}
					onDrag={() => {
						if (rightX.get() <= leftX.get()) {
							rightX.set(leftX.get());
						}
					}}
					className={cn(
						"absolute ring-2 ring-amber-300 bg-linear-to-tr from-primary from-5% to-[#C21515] w-5 h-16 rounded-lg -top-5.5",
						"shadow-[0_0_8px_2px_rgba(251,191,36,0.5)]",
						"touch-manipulation",
					)}
					style={{
						x: rightX,
					}}
				/>
			</div>
		</div>
	);
};
