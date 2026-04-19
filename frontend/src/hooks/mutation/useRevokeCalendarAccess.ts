import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GatherrApiClient } from "../../lib/axios";

const mutationFn = async (): Promise<void> => {
    await GatherrApiClient.delete("/users/me/calendars");
};

export const useRevokeCalendarAccess = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn,
        onSuccess: () => queryClient.removeQueries({ queryKey: ["calendars"] }),
    });
};
