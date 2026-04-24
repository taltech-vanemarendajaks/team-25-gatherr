import { useQuery } from "@tanstack/react-query";

import type { components } from "../../api/types.gen";
import { GatherrApiClient } from "../../lib/axios";

type EventDetailDto = components["schemas"]["EventResponseDto"] & { times?: string[] };

interface ResponseType {
	details: EventDetailDto;
	summary: components["schemas"]["EventSummaryDto"];
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
