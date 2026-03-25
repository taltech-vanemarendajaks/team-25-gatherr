import { useWindowWidth } from "@react-hook/window-size";
import { useEffect, useState } from "react";

const sizes = {
	minscreen: 340,
	xs: 460,
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1280,
	"2xl": 1536,
};

export const useIsMobile = (size: keyof typeof sizes = "md") => {
	const width = useWindowWidth();

	const [isMobile, setIsMobile] = useState<boolean>(width >= sizes[size] ? false : true);

	const getCurrentSize = () => {
		if (width >= sizes["2xl"]) {
			return "2xl";
		}
		if (width >= sizes.xl) {
			return "xl";
		}
		if (width >= sizes.lg) {
			return "lg";
		}
		if (width >= sizes.md) {
			return "md";
		}
		if (width >= sizes.sm) {
			return "sm";
		}
		if (width >= sizes.xs) {
			return "xs";
		}
		if (width >= sizes.minscreen) {
			return "minscreen";
		}
		return "xs";
	};

	useEffect(() => {
		const checkIfUserIsOnMobile = () => {
			if (width >= 768) {
				setIsMobile(false);
			} else {
				setIsMobile(true);
			}
		};

		checkIfUserIsOnMobile();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [width]);

	return { isMobile, size: getCurrentSize() };
};
