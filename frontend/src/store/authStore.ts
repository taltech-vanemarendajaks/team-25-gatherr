import { Store } from "@tanstack/react-store";

interface User {
	id: number;
	name: string;
	email: string;
	profilePicture: string;
	token: string;
}

export const authStore = new Store<{ user: User | null }>({
	user: typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") ?? "null") : null,
});

export function setUser(user: User) {
	localStorage.setItem("user", JSON.stringify(user));
	authStore.setState(() => ({ user }));
}

export function clearUser() {
	localStorage.removeItem("user");
	authStore.setState(() => ({ user: null }));
}
