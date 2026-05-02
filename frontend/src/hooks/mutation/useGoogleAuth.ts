import { useGoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import { env } from "../../env";
import { m } from "../../paraglide/messages";
import { useLogin } from "./useLogin";

export const useGoogleAuth = () => {
	const { mutate: login } = useLogin();
	const googleLogin = useGoogleLogin({
		onSuccess: ({ access_token }) => login(access_token),
		onError: () => toast.error(m.google_sign_in_failed()),
	});
	if (env.VITE_ENABLE_MOCK) return () => login(undefined);
	return env.VITE_GOOGLE_CLIENT_ID ? () => googleLogin() : () => login(undefined);
};
