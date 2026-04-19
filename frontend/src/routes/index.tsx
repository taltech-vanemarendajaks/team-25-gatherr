import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Navbar } from "../components/ui/navbar";
import { MyEvents } from "../components/ui/pages/home/MyEvents";
import { m } from "../paraglide/messages";

export const Route = createFileRoute("/")({ component: App });

function App() {
	const [name, setName] = useState("");
	const navigate = useNavigate();

	return (
		<main className="m-auto max-w-md">
			<div className="mb-4">
				<Navbar />
				<MyEvents />
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
			<script src="https://accounts.google.com/gsi/client" async defer></script>
		</main>
	);
}
