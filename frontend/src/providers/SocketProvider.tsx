import { useEffect, type ReactNode } from "react";
import { type InfiniteData } from "@tanstack/react-query";
import { socket } from "../lib/socket";
import type { Message, MessagesResponse } from "../types";
import { queryClient } from "../lib/query-client";

interface SocketProviderProps {
  children: ReactNode;
  isAuthed: boolean;
}

export function SocketProvider({
  children,
  isAuthed = false,
}: SocketProviderProps) {
  useEffect(() => {
    if (!isAuthed) {
      socket.disconnect();
      return;
    }
    // Connect the socket
    if (!socket.connected) {
      socket.connect();
    }
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
    const handleTaskUpdate = (data: { messageId: string; taskId: string }) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", data.messageId] });
    };

    socket.on("new_saved_message", handleNewMessage);
    socket.on("task_updated", handleTaskUpdate);

    return () => {
      socket.off("new_saved_message", handleNewMessage);
      socket.off("task_updated", handleTaskUpdate);
    };
  }, [isAuthed]);

  return <>{children}</>;
}
