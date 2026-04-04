import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "../components/ui/navbar";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<main className="m-auto max-w-md">
			<div className="mb-4">
				<Navbar />
			</div>
		</main>
	);
}
