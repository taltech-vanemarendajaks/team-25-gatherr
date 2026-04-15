export async function enableMocking(): Promise<void> {
	if (!import.meta.env.DEV && !import.meta.env.VITE_ENABLE_MOCK) return;
	const { worker } = await import("./browser");
	await worker.start({
		onUnhandledRequest: "bypass", // don't warn for non-API requests (assets, HMR, etc.)
	});
}
