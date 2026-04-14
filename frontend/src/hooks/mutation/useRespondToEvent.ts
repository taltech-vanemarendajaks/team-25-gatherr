import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GatherrApiClient } from "../../lib/axios";
import type { EventUser } from "../../mocks/types";

interface RespondInput {
	shortId: string;
	available: string[];
	notAvailable: string[];
}

const mutationFn = async ({
	shortId,
	available,
	notAvailable,
}: RespondInput): Promise<EventUser> => {
	const { data } = await GatherrApiClient.put<EventUser>(`/events/${shortId}/respond`, {
		available,
		notAvailable,
	});
	return data;
};

export const useRespondToEvent = (shortId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["events", shortId] });
		},
	});
};
