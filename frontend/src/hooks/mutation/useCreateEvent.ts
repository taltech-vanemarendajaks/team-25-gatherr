import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import toast from "react-hot-toast";
import { GatherrApiClient } from "../../lib/axios";
import type { Event } from "../../mocks/types";
import { useGetMe } from "../query/useGetMe";

interface CreateInput extends Partial<Event> {}

interface ResponseType extends Event {}

const mutationFn = async (input: CreateInput): Promise<ResponseType> => {
	const { data } = await GatherrApiClient.post<ResponseType>("/events", input);

	return data;
};

export const useCreateEvent = () => {
	const queryClient = useQueryClient();
	const { data: user } = useGetMe();
	const navigate = useNavigate();

	return useMutation({
		mutationFn,
		onSuccess: ({ shortId }) => {
			if (user && shortId) {
				toast.success("Event created");
				console.log(user, shortId);
				navigate({ to: `/e/${shortId}` });
			}
			queryClient.invalidateQueries({ queryKey: ["event"] });
		},
	});
};
