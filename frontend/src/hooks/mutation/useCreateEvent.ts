import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { components } from "../../api/types.gen";
import { GatherrApiClient } from "../../lib/axios";

type CreateInput = components["schemas"]["CreateEventDto"];
type ResponseType = components["schemas"]["EventResponseDto"];

const mutationFn = async (input: CreateInput): Promise<ResponseType> => {
	const { data } = await GatherrApiClient.post<ResponseType>("/events", input);

	console.log(data);

	return data;
};

export const useCreateEvent = () => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn,
		onSuccess: ({ shortId }) => {
			if (shortId) {
				navigate({ to: `/e/${shortId}` });
			}
			queryClient.invalidateQueries({ queryKey: ["event"] });
		},
	});
};
