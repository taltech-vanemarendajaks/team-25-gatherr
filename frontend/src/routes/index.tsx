import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<main className="max-w-md m-auto mt-40">
			<p className="text-5xl text-center">Gatherr</p>
		</main>
	);
}
