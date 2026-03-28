import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { setToken } from "../../store/authStore";

export const Route = createFileRoute("/oauth2/redirect")({
	component: OAuth2Redirect,
});

function OAuth2Redirect() {
	const navigate = useNavigate();

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const token = params.get("token");

		if (token) {
			setToken(token);
			navigate({ to: "/" });
		} else {
			navigate({ to: "/" });
		}
	}, [navigate]);

	return <p className="text-center mt-40">Signing you in...</p>;
}
