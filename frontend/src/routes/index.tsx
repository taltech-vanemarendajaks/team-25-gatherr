import { createFileRoute } from "@tanstack/react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<main className="max-w-md m-auto mt-40 font-logo flex flex-col gap-4">
			<p className="text-5xl text-center">Gatherr</p>
			<p className="text-center text-2xl">Paly and gather in seconds.</p>
			<div className="text-center text-0.5xl">just share the link and </div>
			<div className="flex flex-col gap-2 font-logo ">
				<Input placeholder="Event title" className="font-logo text-center text-white" />
				<Button className="w-full">Create Event</Button>
			</div>
		</main>
	);
}
