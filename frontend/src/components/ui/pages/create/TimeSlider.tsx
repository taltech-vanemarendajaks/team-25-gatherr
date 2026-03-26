/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <no need> */

import { format, setHours, startOfDay } from "date-fns";
import { motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../../../../lib/utils";

const HOURS = 24;
const BALL_OVERFLOW = 20;
const GRADIENT_BAR_OFFSET = 10;
const START_TIME = 7;
const END_TIME = 17;

const convertPositionToHour = (position: number, trackWidth: number) => {
	return Math.round((position / (trackWidth - BALL_OVERFLOW)) * HOURS);
};

const convertHourToPosition = (hour: number, trackWidth: number) => {
	return (hour / HOURS) * (trackWidth - BALL_OVERFLOW);
};

export const TimeSlider = () => {
	const trackRef = useRef<HTMLDivElement>(null);

	const trackWidth = useMotionValue(0);
	const leftX = useMotionValue(0);
	const rightX = useMotionValue(0);

	const [startTime, setStartTime] = useState(0);
	const [endTime, setEndTime] = useState(0);

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
			leftX.set(convertHourToPosition(START_TIME, width));
			rightX.set(convertHourToPosition(END_TIME, width));
		});
		if (trackRef.current) {
			observer.observe(trackRef.current);
		}

		leftX.on("change", latest => {
			setStartTime(() => convertPositionToHour(latest, trackWidth.get()));
		});
		rightX.on("change", latest => {
			setEndTime(() => convertPositionToHour(latest, trackWidth.get()));
		});

		return () => observer.disconnect();
	}, []);

	return (
		<div className="flex flex-col items-center">
			<div className="flex-row flex justify-center font-semibold font-number mb-7 text-2xl">
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
					)}
					style={{
						x: rightX,
					}}
				/>
			</div>
		</div>
	);
};
