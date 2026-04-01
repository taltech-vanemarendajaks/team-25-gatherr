import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import toast from "react-hot-toast";
import { GatherrApiClient } from "../../lib/axios";
import type { Event } from "../../mocks/types";

interface CreateInput extends Partial<Event> {}

interface ResponseType extends Event {}

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
			toast.success("Event created");
			if (shortId) {
				navigate({ to: `/e/${shortId}` });
			}
			queryClient.invalidateQueries({ queryKey: ["event"] });
		},
	});
};
