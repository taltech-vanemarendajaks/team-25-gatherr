import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";

import { cn } from "../../lib/utils";
import { AnimationWrapper } from "../animations/AnimationWrapper";
import { animations } from "../animations/anim-constants";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
	React.ComponentRef<typeof TabsPrimitive.List>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.List
		ref={ref}
		className={cn(
			"flex flex-row relative px-1 w-full flex-1 bg-canvas rounded-xl",
			"shadow-lg",
			className,
		)}
		{...props}
	/>
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
	React.ComponentRef<typeof TabsPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => {
	return (
		<AnimationWrapper className="z-1 w-full my-auto text-center" variants={animations.smallScaleXs}>
			<TabsPrimitive.Trigger
				ref={ref}
				className={cn(
					"text-lg sm:text-xl ring-offset-background rounded-xl mx-[0.2rem] font-normal px-1 py-3 opacity-20 inline-flex items-center justify-center whitespace-nowrap",
					"hover:opacity-100 data-[state=active]:opacity-100 data-[state=active]:bg-background data-[state=active]:text-foreground",
					"disabled:pointer-events-none disabled:opacity-50",
					"touch-manipulation",
					className,
				)}
				{...props}
			/>
		</AnimationWrapper>
	);
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
	React.ComponentRef<typeof TabsPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.Content
		ref={ref}
		className={cn(
			"mt-10 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
			className,
		)}
		{...props}
	/>
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsContent, TabsList, TabsTrigger };
