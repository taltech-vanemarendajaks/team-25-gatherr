import axios from "axios";

export const GatherrApiClient = axios.create({
	// @todo: uncomment this when api is live
	// baseURL: import.meta.env.VITE_API_URL,
	baseURL: `/api/v1`,
	headers: {
		"Content-Type": "application/json",
	},
});
