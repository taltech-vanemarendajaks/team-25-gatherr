import { GoogleLogin } from "@react-oauth/google";
import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import api from "../lib/api";
import { authStore, clearUser, setUser } from "../store/authStore";

export const Route = createFileRoute("/")({ component: App });

function App() {
	const user = useStore(authStore, s => s.user);

	return (
		<main className="max-w-md m-auto mt-40 flex flex-col items-center gap-6">
			<p className="text-5xl text-center">Gatherr</p>

			{user ? (
				<>
					{user.profilePicture && (
						<img src={user.profilePicture} alt={user.name} className="w-16 h-16 rounded-full" />
					)}
					<p className="text-content font-medium">{user.name}</p>
					<p className="text-info text-sm">{user.email}</p>
					<p className="text-info text-sm">ID: {user.id}</p>
					<button type="button" onClick={clearUser} className="text-info text-sm underline">
						Log out
					</button>
				</>
			) : (
				<GoogleLogin
					onSuccess={async credentialResponse => {
						const res = await api.post("/auth/google", {
							idToken: credentialResponse.credential,
							timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
						});
						setUser(res.data);
					}}
					onError={() => console.error("Google login failed")}
				/>
			)}
		</main>
	);
}
