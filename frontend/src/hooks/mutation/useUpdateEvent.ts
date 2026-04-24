import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { components } from "../../api/types.gen";
import { GatherrApiClient } from "../../lib/axios";

type EventResponseDto = components["schemas"]["EventResponseDto"];

interface UpdateInput {
	shortId: string;
	data: Pick<EventResponseDto, "name" | "description">;
}

const mutationFn = async ({ shortId, data }: UpdateInput): Promise<EventResponseDto> => {
	const { data: response } = await GatherrApiClient.patch<EventResponseDto>(
		`/events/${shortId}`,
		data,
	);
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
