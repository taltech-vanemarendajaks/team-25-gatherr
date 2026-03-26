import { type HTMLMotionProps, motion } from "framer-motion";
import { forwardRef } from "react";

interface Props {
	children?: React.ReactNode;
	child?: boolean;
}

type IProps = Props & HTMLMotionProps<"div">;

export const AnimationWrapper = forwardRef<HTMLDivElement, IProps>(
	({ children, variants, child = false, ...props }, ref) => {
		return (
			<motion.div
				ref={ref}
				initial={child ? undefined : "initial"}
				animate={child ? undefined : "animate"}
				exit={child ? undefined : "exit"}
				whileHover={child ? undefined : "whileHover"}
				whileTap={child ? undefined : "whileTap"}
				variants={variants}
				{...props}
			>
				{children}
			</motion.div>
		);
	},
);

AnimationWrapper.displayName = "AnimationWrapper";
