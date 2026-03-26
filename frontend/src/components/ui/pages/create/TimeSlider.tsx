/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <no need> */

import { format, setHours, startOfDay } from "date-fns";
import { motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../../../../lib/utils";

const HOURS = 24;
const BALL_OVERFLOW = 40;
const OFFSET = 15;
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
		return right - left + OFFSET;
	});
	const highlightedBarLeft = useTransform(leftX, left => {
		return left + OFFSET;
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
			<div className="flex-row flex justify-center font-semibold font-number mb-4 text-2xl">
				<p>{format(setHours(startOfDay(new Date()), startTime), "HH:mm")}</p>
				<p>-</p>
				<p>{format(setHours(startOfDay(new Date()), endTime), "HH:mm")}</p>
			</div>
			<div ref={trackRef} className="h-5 rounded-2xl min-w-xs max-w-md relative bg-stone-600">
				<motion.div
					className="bg-gradient absolute h-5"
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
					className={cn("absolute bg-amber-300 size-10 rounded-full -top-2")}
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
					className={cn("absolute bg-orange-500 size-10 rounded-full -top-2")}
					style={{
						x: rightX,
					}}
				/>
			</div>
		</div>
	);
};
