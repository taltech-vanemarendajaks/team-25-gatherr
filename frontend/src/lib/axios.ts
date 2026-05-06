import axios from "axios";

const baseURL =
	import.meta.env.VITE_ENABLE_MOCK === "true" ? "/api/v1" : import.meta.env.VITE_API_URL;

export const GatherrApiClient = axios.create({
	baseURL,
	headers: {
		"Content-Type": "application/json",
	},
});

GatherrApiClient.interceptors.request.use(config => {
	const token = localStorage.getItem("token");
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});
