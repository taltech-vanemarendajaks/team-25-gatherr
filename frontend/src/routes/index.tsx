import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { Button } from "../components/ui/button";
import { authStore, clearToken } from "../store/authStore";

export const Route = createFileRoute("/")({ component: App });

function App() {
	const token = useStore(authStore, s => s.token);
	const user = useStore(authStore, s => s.user);

	return (
		<main className="max-w-md m-auto mt-40 flex flex-col items-center gap-6">
			<p className="text-5xl text-center">Gatherr</p>

			{token && user ? (
				<>
					{user.profilePicture && (
						<img src={user.profilePicture} alt={user.name} className="w-16 h-16 rounded-full" />
					)}
					<p className="text-content font-medium">{user.name}</p>
					<p className="text-info text-sm">{user.email}</p>
					<Button size="sm" onClick={clearToken}>
						Log out
					</Button>
				</>
			) : (
				<Button
					size="sm"
					onClick={() => {
						window.location.href = "http://localhost:8080/oauth2/authorization/google";
					}}
				>
					Sign in with Google
				</Button>
			)}
		</main>
	);
}
