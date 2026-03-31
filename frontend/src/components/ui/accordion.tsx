/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <aa> */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: <aa> */
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { type ReactNode, useState } from "react";
import { cn } from "../../lib/utils";

interface AccordionContentListProps {
	title: string;
	content: React.ReactNode;
	className?: string;
}

export const AccordionContentList = ({ title, content, className }: AccordionContentListProps) => (
	<div className={cn(className)}>
		<p className="text-lg font-medium">{title}</p>
		<div className="px-6 pt-2">
			<ul className="list-disc text-base text-gray-700 space-y-1">{content}</ul>
		</div>
	</div>
);

interface Props {
	title: string;
	body: ReactNode;
}

export const Accordion = ({ title, body }: Props) => {
	const [isOpen, setIsOpen] = useState(false);

	const rotateAmount = 480;
	return (
		<div className={cn("rounded-2xl bg-canvas px-2 py-3 flex flex-col")}>
			<button
				type="button"
				aria-controls={title}
				aria-expanded={isOpen}
				className={cn("flex justify-between items-center w-full space-x-4 px-4")}
			>
				<p className={cn("text-lg sm:text-xl font-semibold text-start")}>{title}</p>
				<AnimatePresence initial={false} mode="wait">
					<motion.div
						onClick={() => setIsOpen(prev => !prev)}
						key={isOpen ? "minus" : "plus"}
						initial={{
							rotate: isOpen ? -rotateAmount : rotateAmount,
						}}
						animate={{
							rotate: 0,
							transition: {
								type: "tween",
								duration: 0.15,
								ease: "circOut",
							},
						}}
						exit={{
							rotate: isOpen ? -rotateAmount : rotateAmount,
							transition: {
								type: "tween",
								duration: 0.15,
								ease: "circIn",
							},
						}}
					>
						{isOpen ? (
							<Minus className={cn("h-8 w-8 text-secondary")} />
						) : (
							<Plus className={cn("h-8 w-8 text-secondary")} />
						)}
					</motion.div>
				</AnimatePresence>
			</button>
			<motion.div
				id={title}
				initial={false}
				animate={
					isOpen
						? {
								height: "auto",
								opacity: 1,
								display: "block",
								transition: {
									height: {
										duration: 0.4,
									},
									opacity: {
										duration: 0.25,
										delay: 0.15,
									},
								},
							}
						: {
								height: 0,
								opacity: 0,
								transition: {
									height: {
										duration: 0.4,
									},
									opacity: {
										duration: 0.25,
									},
								},
								transitionEnd: {
									display: "none",
								},
							}
				}
				className={cn("px-4 overflow-hidden")}
			>
				<div className="pt-4">{body}</div>
			</motion.div>
		</div>
	);
};
