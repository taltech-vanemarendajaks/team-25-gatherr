import { Store } from "@tanstack/react-store";

interface AuthState {
	token: string | null;
	user: {
		id: string;
		email: string;
		name: string;
		profilePicture: string;
	} | null;
}

function parseJwt(token: string) {
	const base64 = token.split(".")[1];
	return JSON.parse(atob(base64));
}

export const authStore = new Store<AuthState>({
	token: typeof window !== "undefined" ? localStorage.getItem("jwt") : null,
	user: typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") ?? "null") : null,
});

export function setToken(token: string) {
	const { sub, email, name, profilePicture } = parseJwt(token);
	const user = { id: sub, email, name, profilePicture };
	localStorage.setItem("jwt", token);
	localStorage.setItem("user", JSON.stringify(user));
	authStore.setState(() => ({ token, user }));
}

export function clearToken() {
	localStorage.removeItem("jwt");
	localStorage.removeItem("user");
	authStore.setState(() => ({ token: null, user: null }));
}

/*
	USAGE EXAMPLE:
	const user = useStore(authStore, (s) => s.user);
	user.name, user.email, user.profilePicture
*/
