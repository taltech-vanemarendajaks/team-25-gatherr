import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GatherrApiClient } from "../../lib/axios";

interface AuthResponse {
	token: string;
	id: number;
	name: string;
	email: string;
	profilePicture: string;
}

export const useLogin = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (accessToken?: string) => {
			const { data } = await GatherrApiClient.post<AuthResponse>("/auth/google", {
				accessToken,
				timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
			});
			return data;
		},
		onSuccess: data => {
			localStorage.setItem("token", data.token);
			queryClient.setQueryData(["/users/me"], {
				id: data.id,
				name: data.name,
				email: data.email,
				profilePicture: data.profilePicture,
			});
			queryClient.invalidateQueries({ queryKey: ["/events/mine"] });
		},
	});
};
