import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";

// Google redirects to /calendar-connect?success=true or ?error=...
// after the backend stores the tokens and issues its own redirect to the frontend.
const searchSchema = z.object({
    success: z.string().optional(),
    error: z.string().optional(),
});

export const Route = createFileRoute("/calendar-connect")({
    validateSearch: searchSchema,
    component: CalendarConnectPage,
});

function CalendarConnectPage() {
    const { success, error } = useSearch({ from: "/calendar-connect" });
    const navigate = useNavigate();

    useEffect(() => {
        // Auto-navigate back after a moment so the user lands back in context.
        // In practice the user likely had the respond page open before clicking connect,
        // so going back (-1) is the right UX. Adjust if your flow differs.
        const timer = setTimeout(() => {
            navigate({ to: "/", replace: true });
        }, 2500);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <main className="m-auto max-w-md flex flex-col items-center justify-center min-h-screen gap-4 px-6">
            {success ? (
                <>
                    <span className="text-5xl">🗓️</span>
                    <p className="text-xl font-semibold text-center">Google Calendar connected!</p>
                    <p className="text-sm text-info text-center">Taking you back...</p>
                </>
            ) : (
                <>
                    <span className="text-5xl">😔</span>
                    <p className="text-xl font-semibold text-center">Calendar access denied</p>
                    <p className="text-sm text-info text-center">
                        {error === "access_denied"
                            ? "You declined calendar access. You can connect it later from the event respond page."
                            : "Something went wrong. Please try again."}
                    </p>
                    <p className="text-sm text-info text-center">Taking you back...</p>
                </>
            )}
        </main>
    );
}