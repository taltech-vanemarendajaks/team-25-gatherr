import axios from "axios";

export const GatherrApiClient = axios.create({
	baseURL: import.meta.env.VITE_API_URL ?? "/api/v1",
	headers: {
		"Content-Type": "application/json",
	},
});
