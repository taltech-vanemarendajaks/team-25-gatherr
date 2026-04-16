import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { forwardRef } from "react";
import { cn } from "../../lib/utils";

export const buttonVariantColors = {
	orange: ["text-content bg-primary border-[#894822]", "active:border-primary"],
	red: ["text-content bg-secondary border-[#752102]", "active:border-secondary"],
	dark: ["text-content bg-paint border-[#130E0A]", "active:border-paint"],
};

export const buttonVariants = cva(
	[
		"inline-flex items-center justify-center cursor-pointer",
		"m-0 border-b-[6px] text-center font-medium tracking-wider font-sans whitespace-nowrap",
		"transition-all duration-500 hover:-translate-y-[0.15rem]",
		"active:translate-y-[0.2rem] active:duration-75",
		"touch-manipulation",
		"disabled:opacity-50 disabled:cursor-not-allowed",
	],
	{
		// regular --> hover --> active --> dark --> focus
		variants: {
			variant: buttonVariantColors,
			size: {
				small: `p-2 text-xs rounded-lg mx-0.5`,
				xs: `py-2 px-4 text-sm rounded-xl`,
				sm: `py-2 px-10 text-sm rounded-xl`,
				md: `py-2 px-14 text-md rounded-xl`,
				lg: `py-3 px-18 text-lg rounded-xl`,
			},
		},
		defaultVariants: { variant: "orange", size: "md" },
	},
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, type = "button", ...props }, ref) => (
		<button
			type={type}
			className={cn(buttonVariants({ variant, size, className }), "")}
			ref={ref}
			{...props}
		/>
	),
);

Button.displayName = "Button";
