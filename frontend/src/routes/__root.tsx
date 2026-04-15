import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import TanStackQueryProvider from "../integrations/tanstack-query/root-provider";
import { SITE_TITLE } from "../lib/site";
import { getLocale } from "../paraglide/runtime";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	beforeLoad: async () => {
		if (typeof document !== "undefined") {
			document.documentElement.setAttribute("lang", getLocale());
		}
	},

	notFoundComponent: () => {
		return <p>Not Found</p>;
	},

	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: SITE_TITLE,
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
});

function useMswReady(): boolean {
	"use no memo"; // opt out of React Compiler — async .then() chains in useEffect are not safe to memoize
	// In production or SSR: always ready
	const [ready, setReady] = useState(
		(!import.meta.env.DEV && !import.meta.env.VITE_ENABLE_MOCK) || typeof window === "undefined",
	);

	useEffect(() => {
		if (!import.meta.env.DEV && !import.meta.env.VITE_ENABLE_MOCK) return;
		import("../mocks/index").then(({ enableMocking }) =>
			enableMocking().then(() => setReady(true)),
		);
	}, []);

	return ready;
}

function RootDocument({ children }: { children: ReactNode }) {
	const mswReady = useMswReady();

	return (
		<html lang={getLocale()} suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body className="font-main bg-surface text-content touch-manipulation">
				<TanStackQueryProvider>
					{mswReady ? children : null}
					<TanStackDevtools
						config={{ position: "bottom-right" }}
						plugins={[
							{
								name: "Tanstack Router",
								render: <TanStackRouterDevtoolsPanel />,
							},
							TanStackQueryDevtools,
						]}
					/>
				</TanStackQueryProvider>
				<Scripts />
				<Toaster
					position="top-center"
					toastOptions={{
						style: {
							background: "#1a1a1a",
							color: "#f5f5f5",
						},
					}}
				/>
			</body>
		</html>
	);
}
