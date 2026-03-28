import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { dashboardWs } from "../api/ws-client";

export function useRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubNew = dashboardWs.on("new_message", (payload) => {
      const data = payload as { conversationId?: string };
      if (data.conversationId) {
        // Invalidate all message.list queries (tRPC key prefix match)
        void queryClient.invalidateQueries({ queryKey: [["message", "list"]] });
        void queryClient.invalidateQueries({ queryKey: [["conversation", "list"]] });
      }
    });

    const unsubUpdate = dashboardWs.on("conversation_update", () => {
      void queryClient.invalidateQueries({
        queryKey: [["conversation", "list"]],
      });
    });

    const unsubAssign = dashboardWs.on("assignment_change", () => {
      void queryClient.invalidateQueries({
        queryKey: [["conversation", "list"]],
      });
    });

    return () => {
      unsubNew();
      unsubUpdate();
      unsubAssign();
    };
  }, [queryClient]);

  return {
    joinConversation: (id: string) => dashboardWs.joinConversation(id),
    sendTyping: (id: string, typing: boolean) => dashboardWs.sendTyping(id, typing),
  };
}
