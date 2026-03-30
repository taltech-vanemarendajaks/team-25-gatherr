import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { GatherrApiClient } from "../../lib/axios";

interface CreateSomethingInput {
	id: string;
	// ...
}

interface ResponseType {
	id: string;
	// ...
}

const mutationFn = async (input: CreateSomethingInput): Promise<ResponseType> => {
	const { data } = await GatherrApiClient.post<ResponseType>("/something", input);
	return data;
};

export const useCreateSomething = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn,
		onSuccess: () => {
			toast.success("Created successfully");
			queryClient.invalidateQueries({ queryKey: ["something"] });
		},
	});
};
