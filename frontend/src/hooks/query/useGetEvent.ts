import { useQuery } from "@tanstack/react-query";

import { GatherrApiClient } from "../../lib/axios";
import type { Event, SummaryResponse } from "../../mocks/types";

interface ResponseType {
	details: Event;
	summary: SummaryResponse;
}

const queryFn = async (shortId: string): Promise<ResponseType> => {
	const [{ data: details }, { data: summary }] = await Promise.all([
		GatherrApiClient.get(`/events/${shortId}`),
		GatherrApiClient.get(`/events/${shortId}/summary`),
	]);
	return { details, summary };
};

export const useGetEvent = (shortId: string) => {
	return useQuery({
		queryKey: ["events", shortId],
		queryFn: async () => queryFn(shortId),
	});
};
