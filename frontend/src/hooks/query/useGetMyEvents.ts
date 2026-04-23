import { useQuery } from "@tanstack/react-query";

import { GatherrApiClient } from "../../lib/axios";
import type { Event } from "../../mocks/types";

interface ResponseType extends Event {}

const queryFn = async (): Promise<ResponseType[]> => {
	try {
		const { data } = await GatherrApiClient.get<ResponseType[]>("/events/mine");
		return data;
	} catch (error: any) {
		if (error?.response?.status === 401) return [];
		throw error;
	}
};

export const useGetMyEvents = () => {
	return useQuery({
		queryKey: ["/events/mine"],
		queryFn,
		enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
	});
};
