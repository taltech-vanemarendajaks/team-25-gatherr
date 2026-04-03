import { createFileRoute } from "@tanstack/react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import FireplaceIcon from "../components/icons/fireplace";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		
			<main className="min-h-screen bg-surface flex flex-col items-center justify-center  *:px-4">
				<div className="w-[297px] min-h-[94px] mx-auto flex items-center justify-center">
					<p className="text-center text-2xl">
						Plan any gathering
						<br />
						<span className="text-primary">in seconds.</span>
					</p>
				</div>
				<div className="w-[339px] min-h-[132px] mx-auto text-center">
					<p className="text-center text-sm font-main text-info">
						Just share a link and let everyone pick their availability. The
						simplest way to coordinate with friends, family, or colleagues.
					</p>
				</div>
				<section className="w-[373px] min-h-[392px] rounded-[21px] bg-canvas px-[17px] py-8 flex flex-col gap-8">
				<FireplaceIcon className="mx-auto h-[62px] w-auto" alt="Fireplace icon" />
				<p className="text-center text-2xl">Create a new event</p>
					<div className="w-[339px] mx-auto flex flex-col gap-12">
						<Input
							placeholder="e.g. Team meeting, game night, som"
							className="h-[66px] rounded-[21px] bg-surface text-center text-placeholder font-main border-0"
						/>
						<Button className="w-[310px] h-[52px] mx-auto rounded-[10px]">
							Create event
						</Button>
					</div>
				</section>
			</main>
	);
}
