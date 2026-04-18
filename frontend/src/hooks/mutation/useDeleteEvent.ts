import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { GatherrApiClient } from "../../lib/axios";
import { m } from "../../paraglide/messages";

const mutationFn = async (shortId: string): Promise<void> => {
	await GatherrApiClient.delete(`/events/${shortId}`);
};

export const useDeleteEvent = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn,
		onSuccess: () => {
			toast.success(m.home_event_deleted());
			queryClient.invalidateQueries({ queryKey: ["/events/mine"] });
		},
	});
};
