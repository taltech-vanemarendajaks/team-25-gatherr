import { CalendarDaysIcon, Loader2Icon, PlugZapIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { useGetBusySlots } from "../../../../hooks/mutation/useGetBusySlots.ts";
import { useRevokeCalendarAccess } from "../../../../hooks/mutation/useRevokeCalendarAccess";
import { useListCalendars } from "../../../../hooks/query/useListCalendars";
import { Button } from "../../button";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api/v1";

interface Props {
    shortId: string;
    /** Called with the busy slot strings once the user confirms their selection. */
    onBusySlotsLoaded: (slots: string[]) => void;
}

type Step = "idle" | "picking" | "loading";

export const CalendarImport = ({ shortId, onBusySlotsLoaded }: Props) => {
    const [step, setStep] = useState<Step>("idle");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Only fetch calendar list once the user has clicked "Import" (and is connected)
    const {
        data: calendarList,
        isLoading: calendarsLoading,
        isError: notConnected,
    } = useListCalendars(step === "picking");

    const { mutate: getBusySlots, isPending: busyLoading } = useGetBusySlots();
    const { mutate: revokeAccess, isPending: revoking } = useRevokeCalendarAccess();

    const handleConnectClick = () => {
        // Browser navigation — the backend will redirect to Google consent screen.
        // The JWT is sent via the Authorization header that axios attaches automatically,
        // but since this is a full page navigation we can't set headers.
        // Solution: open the OAuth URL returned from a preflight fetch instead.
        const token = localStorage.getItem("token"); // adjust to wherever you store it
        window.location.href = `${API_BASE}/auth/google/calendar?token=${token}`;
    };

    const handleImportClick = () => {
        setStep("picking");
        setSelectedIds(new Set());
    };

    const toggleCalendar = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleConfirm = () => {
        if (selectedIds.size === 0) return;
        setStep("loading");
        getBusySlots(
            { shortId, calendarIds: [...selectedIds] },
            {
                onSuccess: ({ busySlots }) => {
                    onBusySlotsLoaded(busySlots ?? []);
                    setStep("idle");
                },
                onError: () => setStep("picking"),
            },
        );
    };

    // After OAuth redirect back, the calendar list will load.
    // If the user is not connected yet, notConnected will be true (403).
    const isConnected = !notConnected && calendarList !== undefined;

    if (step === "idle") {
        return (
            <Button
                size="sm"
                className="flex items-center gap-2"
                onClick={handleImportClick}
            >
                <CalendarDaysIcon className="size-4" />
                Import from Google Calendar
            </Button>
        );
    }

    if (step === "picking" && calendarsLoading) {
        return (
            <div className="flex items-center gap-2 text-sm text-info">
                <Loader2Icon className="size-4 animate-spin" />
                Loading your calendars...
            </div>
        );
    }

    if (step === "picking" && notConnected) {
        return (
            <div className="flex flex-col gap-3 p-4 bg-canvas rounded-xl">
                <p className="text-sm">Connect your Google Calendar to import busy times.</p>
                <Button
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={handleConnectClick}
                >
                    <PlugZapIcon className="size-4" />
                    Connect Google Calendar
                </Button>
                <button
                    type="button"
                    className="text-xs text-info underline"
                    onClick={() => setStep("idle")}
                >
                    Cancel
                </button>
            </div>
        );
    }

    if (step === "picking" && isConnected) {
        const calendars = calendarList?.calendars ?? [];
        return (
            <div className="flex flex-col gap-3 p-4 bg-canvas rounded-xl">
                <p className="text-sm font-semibold">Select calendars to import from:</p>

                {calendars.length === 0 ? (
                    <p className="text-sm text-info">No calendars found in your Google account.</p>
                ) : (
                    <ul className="flex flex-col gap-2">
                        {calendars.map(cal => (
                            <li key={cal.id}>
                                <label className="flex items-center gap-2 cursor-pointer text-sm">
                                    <input
                                        type="checkbox"
                                        className="accent-primary"
                                        checked={selectedIds.has(cal.id ?? "")}
                                        onChange={() => toggleCalendar(cal.id ?? "")}
                                    />
                                    {cal.summary ?? cal.id}
                                </label>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="flex gap-2 mt-1">
                    <Button
                        size="sm"
                        disabled={selectedIds.size === 0}
                        onClick={handleConfirm}
                    >
                        Import busy times
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => setStep("idle")}
                    >
                        Cancel
                    </Button>
                </div>

                <button
                    type="button"
                    className="flex items-center gap-1 text-xs text-red-400 mt-1 cursor-pointer"
                    onClick={() => revokeAccess()}
                    disabled={revoking}
                >
                    <Trash2Icon className="size-3" />
                    Disconnect Google Calendar
                </button>
            </div>
        );
    }

    if (step === "loading" || busyLoading) {
        return (
            <div className="flex items-center gap-2 text-sm text-info">
                <Loader2Icon className="size-4 animate-spin" />
                Fetching busy times...
            </div>
        );
    }

    return null;
};