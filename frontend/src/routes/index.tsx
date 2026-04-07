import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { FireplaceIcon } from "../components/icons/FireplaceIcon";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import * as m from "../paraglide/messages";

export const Route = createFileRoute("/")({ component: App });

function App() {
	const [value, setValue] = useState("");
	const navigate = useNavigate();

	const handleCreate = () => {
		const trimmed = value.trim();
		if (!trimmed) return;

		navigate({
			to: "/create",
			search: { name: trimmed },
		});
	};

	return (
		<main className="min-h-screen bg-surface flex flex-col items-center justify-center px-6">
			<div className="w-full max-w-[339px] mx-auto font-bold flex items-center justify-center">
				<p className="text-center text-3xl">
					{m.home_plan_any_gathering()}
					<br />
					<span className="text-primary">{m.home_in_seconds()}</span>
				</p>
			</div>
			<div className="w-full max-w-[339px] text-center mx-auto mt-7 px-5">
				<p className="text-lg font-main text-info leading-8">{m.home_description()}</p>
			</div>
			<section className="w-full bg-canvas mt-12 px-7 pb-8 flex flex-col gap-6">
				<div className="flex items-center justify-center mt-8">
					<FireplaceIcon />
				</div>
				<p className="text-center text-3xl font-medium">{m.home_create_new_event_title()}</p>
				<div className="w-full mx-auto flex flex-col gap-8">
					<Input
						value={value}
						onChange={e => setValue(e.target.value)}
						placeholder={m.home_event_name_placeholder()}
						className="min-h-16 py-3.5 rounded-[21px] bg-surface text-left text-placeholder font-main border-0"
					/>
					<Button
						disabled={!value.trim()}
						onClick={handleCreate}
						className="w-full min-h-12 py-3 rounded-[10px] text-xl bg-primary"
					>
						{m.home_create_event_button()}
					</Button>
				</div>
			</section>
		</main>
	);
}
