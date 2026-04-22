import axios from "axios";

export const GatherrApiClient = axios.create({
	baseURL: import.meta.env.VITE_API_URL ?? "/api/v1",
	headers: {
		"Content-Type": "application/json",
	},
});

GatherrApiClient.interceptors.request.use(config => {
	const token = localStorage.getItem("token");
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});
