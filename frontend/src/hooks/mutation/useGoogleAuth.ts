import { useGoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import { env } from "../../env";
import { useLogin } from "./useLogin";

export const useGoogleAuth = () => {
	const { mutate: login } = useLogin();
	const googleLogin = useGoogleLogin({
		onSuccess: ({ access_token }) => login(access_token),
		onError: () => toast.error("Google sign-in failed"),
	});
	return env.VITE_GOOGLE_CLIENT_ID ? googleLogin : () => login(undefined);
};
