import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";

import type { ReactNode } from "react";
import { toast } from "react-hot-toast";
import { AppInit } from "./AppInit";

let context:
	| {
			queryClient: QueryClient;
	  }
	| undefined;

export function getContext() {
	if (context) {
		return context;
	}

	const queryClient = new QueryClient({
		queryCache: new QueryCache({
			onError: error => {
				toast.error(error.message);
			},
		}),
		mutationCache: new MutationCache({
			onError: (error, _, __, mutation) => {
				const { mutationKey } = mutation.options;

				toast.error(`API Mutation Error ${error.message} ${mutationKey ? `: ${mutation}` : ""}`);
			},
		}),
	});

	context = {
		queryClient,
	};

	return context;
}

export default function TanStackQueryProvider({ children }: { children: ReactNode }) {
	const { queryClient } = getContext();

	return (
		<QueryClientProvider client={queryClient}>
			<AppInit />
			{children}
		</QueryClientProvider>
	);
}
