import { useEffect, type ReactNode } from "react";
import { type InfiniteData } from "@tanstack/react-query";
import { socket } from "../lib/socket";
import type { Message, MessagesResponse } from "../types";
import { queryClient } from "../lib/query-client";

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  useEffect(() => {
    const handleNewMessage = (newMessage: Message) => {
      queryClient.setQueriesData<InfiniteData<MessagesResponse>>(
        { queryKey: ["messages"] },
        (oldData) => {
          if (!oldData?.pages?.length) return oldData;

          // Prevent duplicates across all pages
          const exists = oldData.pages.some((page) =>
            page.messages.some((msg) => msg.messageId === newMessage.messageId),
          );

          if (exists) return oldData;

          // Prepend the new message to the first page of the infinite query
          const newPages = [...oldData.pages];
          const firstPage = newPages[0];
          if (!firstPage) return oldData;

          newPages[0] = {
            ...firstPage,
            messages: [newMessage, ...firstPage.messages],
            total: (firstPage.total ?? 0) + 1,
          };

          return { ...oldData, pages: newPages };
        },
      );
    };
    const handleTaskUpdate = (data: {
      messageId: string;
      taskId: string;
      updates: { status: string } | { isNotified: boolean };
    }) => {
      // 1. Invalidate the specific task list for the message
      // This ensures that if the user is looking at the TaskPage, it refetches
      queryClient.invalidateQueries({ queryKey: ["tasks", data.messageId] });

      // 2. Optional: If you want to update the "messages" list cache
      // (e.g., to update a "has pending tasks" icon on the dashboard)
      queryClient.setQueriesData<InfiniteData<MessagesResponse>>(
        { queryKey: ["messages"] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              messages: page.messages.map((msg) => {
                // Logic to update specific message flags if needed
                return msg.messageId === data.messageId
                  ? { ...msg, updatedAt: new Date() }
                  : msg;
              }),
            })),
          };
        },
      );
    };
    socket.on("new_saved_message", handleNewMessage);
    socket.on("task_updated", handleTaskUpdate);

    return () => {
      socket.off("new_saved_message", handleNewMessage);
    };
  }, []);

  return <>{children}</>;
}
