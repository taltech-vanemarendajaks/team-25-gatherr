import { createFileRoute } from "@tanstack/react-router";
import FireplaceIcon from "../components/icons/fireplace";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import FireplaceIcon from "../components/icons/fireplace";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<main className="min-h-screen bg-surface flex flex-col items-center justify-center px-6">
			<div className="w-full max-w-sm min-h-[94px] mx-auto font-bold flex items-center justify-center">
				<p className="text-center text-3xl">
					Plan any gathering
					<br />
					<span className="text-primary">in seconds</span>
				</p>
			</div>
			<div className="w-full max-w-[339px] text-center mx-auto mt-7 px-5">
				<p className="text-lg font-main text-info leading-8">
					Just share a link and let everyone pick their availability. The simplest way to coordinate
					with friends, family, or colleagues.
				</p>
			</div>
			<section className="w-full min-h-[392px] rounded-[21px] bg-canvas mt-12  px-7 flex flex-col gap-6">
				<FireplaceIcon className="mx-auto h-[62px] w-auto mt-8" alt="Fireplace icon" />
				<p className="text-center text-3xl font-medium">Create a new event</p>
				<div className="w-full mx-auto flex flex-col gap-12">
					<Input
						placeholder="e.g. Team meeting, game night, some"
						className="h-[66px] rounded-[21px] bg-surface text-left text-placeholder font-main border-0"
					/>
					<Button className="w-full h-[52px] mx-auto rounded-[10px] text-xl">Create event</Button>
				</div>
			</section>
		</main>
	);
}
