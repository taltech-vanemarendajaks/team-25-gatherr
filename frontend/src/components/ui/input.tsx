import type * as React from "react";

import { cn } from "../../lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				"w-full min-w-0 rounded-xl px-5 py-3 text-lg",
				"border-2 border-primary focus:outline-none focus:border-orange-400",
				"placeholder:text-muted-foreground",
				"selection:bg-primary selection:text-primary-foreground",
				"focus-visible:border-primary focus-visible:ring-primary/50 focus-visible:ring-[3px]",
				"aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
				"disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
				"touch-manipulation",
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
