import { createFileRoute } from "@tanstack/react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ChooseEventTypeSlider } from "../components/ui/pages/create/ChooseEventTypeSlider";
import { TimeSlider } from "../components/ui/pages/create/TimeSlider";

export const Route = createFileRoute("/about")({
	component: About,
});

function About() {
	return (
		<main className="mt-40 px-4 py-12">
			<div className="mb-32">
				<TimeSlider />
			</div>

			<div className="min-w-sm p-20 bg-canvas rounded-2xl">
				<Input className="mb-20" placeholder="e.g. Team meeting, game night" />
				<Input placeholder="e.g. Team meeting, game night" />
			</div>
			<div className="my-20" />
			<Button>Create Event</Button>

			<p>Button slider</p>
			<div>
				<ChooseEventTypeSlider />
			</div>
		</main>
	);
}
