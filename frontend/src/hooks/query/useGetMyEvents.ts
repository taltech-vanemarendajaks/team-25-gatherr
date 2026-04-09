import { useQuery } from "@tanstack/react-query";

import { GatherrApiClient } from "../../lib/axios";
import type { Event } from "../../mocks/types";

interface ResponseType extends Event {}

const queryFn = async (): Promise<ResponseType[]> => {
	const { data } = await GatherrApiClient.get<ResponseType[]>("/events/mine");
	return data;
};

export const useGetMyEvents = () => {
	return useQuery({
		queryKey: ["/events/mine"],
		queryFn,
	});
};
