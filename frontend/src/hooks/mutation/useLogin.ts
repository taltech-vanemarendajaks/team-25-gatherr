import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GatherrApiClient } from "../../lib/axios";
import type { User } from "../../mocks/types";

declare const window: Window & { google: any }

export const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            // Get an idToken from Google first
            const idToken = await getGoogleIdToken();
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const { data } = await GatherrApiClient.post<User>("/auth/google", { idToken, timezone });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/users/me"] });
            queryClient.invalidateQueries({ queryKey: ["/events/mine"] });
        },
    });
};

function getGoogleIdToken(): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!window.google) {
            reject(new Error("Google Identity Services not loaded"));
            return;
        }
        window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: (response: { credential: string }) => resolve(response.credential),
        });
        window.google.accounts.id.prompt((notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                // Prompt was blocked or dismissed — fall back to explicit button flow
                window.google.accounts.id.renderButton(
                    document.getElementById("google-signin-btn")!,
                    { theme: "outline", size: "large" }
                );
            }
        });
    });
}