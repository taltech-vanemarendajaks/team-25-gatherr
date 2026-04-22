import { useQueryClient } from "@tanstack/react-query";

export const useLogout = () => {
	const queryClient = useQueryClient();
	return () => {
		localStorage.removeItem("token");
		queryClient.resetQueries();
	};
};
