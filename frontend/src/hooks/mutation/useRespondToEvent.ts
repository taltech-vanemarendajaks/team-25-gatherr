import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { components } from "../../api/types.gen";
import { GatherrApiClient } from "../../lib/axios";

interface RespondInput {
	shortId: string;
	available: string[];
	notAvailable: string[];
}

type RespondBody = components["schemas"]["RespondDto"];

const mutationFn = async ({ shortId, available, notAvailable }: RespondInput): Promise<void> => {
	const body: RespondBody = { available, notAvailable };
	await GatherrApiClient.put(`/events/${shortId}/respond`, body);
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
