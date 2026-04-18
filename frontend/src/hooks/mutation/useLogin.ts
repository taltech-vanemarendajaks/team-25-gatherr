import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GatherrApiClient } from "../../lib/axios";
import type { User } from "../../mocks/types";

export const useLogin = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			const { data } = await GatherrApiClient.post<User>("/auth/google");
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["/users/me"] });
			queryClient.invalidateQueries({ queryKey: ["/events/mine"] });
		},
	});
};
