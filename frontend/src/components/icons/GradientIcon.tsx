import type { LucideIcon } from "lucide-react";
import { useId } from "react";

interface GradientIconProps {
	icon: LucideIcon;
	fromColor?: string;
	toColor?: string;
	className?: string;
	strokeWidth?: number;
}

export const GradientIcon = ({
	icon: Icon,
	fromColor = "#f26716",
	toColor = "#EEBE00",
	className,
	strokeWidth = 2,
}: GradientIconProps) => {
	const id = useId().replace(/:/g, "");

	return (
		<svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
			<defs>
				<linearGradient id={id} x1="0" y1="0" x2="0" y2="24" gradientUnits="userSpaceOnUse">
					<stop offset="20%" stopColor={fromColor} />
					<stop offset="100%" stopColor={toColor} />
				</linearGradient>
			</defs>
			<Icon stroke={`url(#${id})`} strokeWidth={strokeWidth} />
		</svg>
	);
};
