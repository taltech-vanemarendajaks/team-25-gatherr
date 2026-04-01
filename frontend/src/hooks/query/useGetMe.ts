import { useQuery } from "@tanstack/react-query";

import { GatherrApiClient } from "../../lib/axios";
import type { User } from "../../mocks/types";

interface ResponseType extends User {}

const queryFn = async (): Promise<ResponseType> => {
	const { data } = await GatherrApiClient.get<ResponseType>("/users/me");
	return data;
};

export const useGetMe = () => {
	return useQuery({
		queryKey: ["/users/me"],
		queryFn,
	});
};
