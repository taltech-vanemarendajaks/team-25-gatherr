import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Navbar } from "../components/ui/navbar";
import { useGetMyEvents } from "../hooks/query/useGetMyEvents";
import { m } from "../paraglide/messages";

export const Route = createFileRoute("/")({ component: App });

function App() {
	const [name, setName] = useState("");
	const navigate = useNavigate();
	const { data: myEvents, isLoading } = useGetMyEvents();

	return (
		<main className="m-auto max-w-md">
			<div className="mb-4">
				<Navbar />
				{myEvents?.length && !isLoading ? (
					<div className="flex flex-col space-y-4 bg-canvas rounded-xl px-6 py-6 mt-12">
						{myEvents.map(event => {
							return (
								<p key={event.id} className="text-2xl">
									{event.name}
								</p>
							);
						})}
					</div>
				) : (
					<>
						<p className="text-4xl font-bold text-center mt-16 mb-10">
							{m.home_hero_title()} <br />
							<span className="text-gradient">{m.home_hero_title_gradient()}</span>
						</p>
						<p className="text-info max-w-xs text-center m-auto">{m.home_hero_text()}</p>
					</>
				)}

				<div className="bg-canvas rounded-xl flex flex-col justify-center space-y-9 px-6 my-12 py-12 mx-4">
					<img src="/fireplace.svg" alt="Fireplace" className="h-16" />
					<p className="text-3xl font-semibold text-center">{m.home_create_title()}</p>
					<Input
						value={name}
						onChange={e => setName(e.target.value)}
						placeholder={m.home_create_input_placeholder()}
					/>
					<Button onClick={() => navigate({ to: "/create", search: { name } })}>
						{m.home_create_button()}
					</Button>
				</div>
			</div>
		</main>
	);
}
