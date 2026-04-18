import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GatherrApiClient } from "../../lib/axios";
import type { Event } from "../../mocks/types";

interface UpdateInput {
	shortId: string;
	data: Partial<Pick<Event, "name" | "description">>;
}

const mutationFn = async ({ shortId, data }: UpdateInput): Promise<Event> => {
	const { data: response } = await GatherrApiClient.patch<Event>(`/events/${shortId}`, data);
	return response;
};

export const useUpdateEvent = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["/events/mine"] });
		},
	});
};
