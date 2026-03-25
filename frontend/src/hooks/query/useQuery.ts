import { useQuery } from "@tanstack/react-query";

import { GatherrApiClient } from "../../lib/axios";

interface ResponseType {
	id: string;
	// ...
}

const queryFn = async (): Promise<ResponseType[]> => {
	const { data } = await GatherrApiClient.get<ResponseType[]>("/something");
	return data;
};

export const useGetSomething = () => {
	return useQuery({
		queryKey: ["something"],
		queryFn,
	});
};
