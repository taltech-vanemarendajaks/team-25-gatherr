import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export const useLogout = () => {
	const queryClient = useQueryClient();
	return useCallback(() => {
		localStorage.removeItem("token");
		queryClient.resetQueries();
	}, [queryClient]);
};
