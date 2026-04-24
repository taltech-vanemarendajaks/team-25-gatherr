import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { components } from "../../api/types.gen";
import { GatherrApiClient } from "../../lib/axios";
import { m } from "../../paraglide/messages";

type CreateInput = components["schemas"]["UpdateUserDto"];
type ResponseType = components["schemas"]["UserResponseDto"];

const mutationFn = async (input: CreateInput): Promise<ResponseType> => {
	const { data } = await GatherrApiClient.patch<ResponseType>("/users/me", input);

	console.log(data);

	return data;
};

export const useUpdateUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn,
		onSuccess: () => {
			toast.success(m.update_user_user_updated);
			queryClient.invalidateQueries({ queryKey: ["/users/me"] });
		},
	});
};
