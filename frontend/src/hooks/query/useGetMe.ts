import { useQuery } from "@tanstack/react-query";

import { GatherrApiClient } from "../../lib/axios";
import type { User } from "../../mocks/types";

interface ResponseType extends User {}

const queryFn = async (): Promise<ResponseType | null> => {
	try {
		const { data } = await GatherrApiClient.get<ResponseType>("/users/me");
		return data;
	} catch (error: any) {
		if (error?.response?.status === 401) return null;
		throw error;
	}
};

export const useGetMe = () => {
	return useQuery({
		queryKey: ["/users/me"],
		queryFn,
		enabled: !!localStorage.getItem("token"),
	});
};
