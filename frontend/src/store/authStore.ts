import { Store } from "@tanstack/react-store";

interface AuthState {
	token: string | null;
}

export const authStore = new Store<AuthState>({
	token: typeof window !== "undefined" ? localStorage.getItem("jwt") : null,
});

export function setToken(token: string) {
	localStorage.setItem("jwt", token);
	authStore.setState(() => ({ token }));
}

export function clearToken() {
	localStorage.removeItem("jwt");
	authStore.setState(() => ({ token: null }));
}
