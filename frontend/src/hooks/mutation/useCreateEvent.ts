import { useMutation, useQueryClient } from "@tanstack/react-query";

import { GatherrApiClient } from "../../lib/axios";
import type { Event } from "../../mocks/types";

interface CreateEventInput extends Partial<Event> {}

interface ResponseType extends Event {}

const mutationFn = async (input: CreateEventInput): Promise<ResponseType> => {
	const { data } = await GatherrApiClient.post<ResponseType>("/events", input);
	return data;
};

export const useCreateEvent = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["event"] });
		},
	});
};
