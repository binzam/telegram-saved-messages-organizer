import {
  useInfiniteQuery,
  useMutation,
  type InfiniteData,
} from "@tanstack/react-query";
import type { MessagesResponse, FilterState } from "../types";
import { apiClient } from "../lib/api-client";
import { queryClient } from "../lib/query-client";

// Infinite Messages Hook
export const useMessages = (filters: FilterState) => {
  return useInfiniteQuery<MessagesResponse>({
    queryKey: ["messages", filters],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        limit: "20",
        ...(filters.filter && { tag: filters.filter }),
        ...(filters.mediaType !== "all" && { type: filters.mediaType }),
        ...(filters.sortOrder && { sort: filters.sortOrder }),
      });
      const { data } = await apiClient.get(`/messages?${params}`);
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
  });
};

// Tag Mutation Hook
export const useTagMessage = () => {
  return useMutation({
    mutationFn: async ({
      messageId,
      tags,
    }: {
      messageId: string;
      tags: string[];
    }) => {
      await apiClient.post("/messages/tag", { messageId, tags });
    },
    onMutate: async ({ messageId, tags }) => {
      await queryClient.cancelQueries({ queryKey: ["messages"] });

      // Optimistic Update
      queryClient.setQueriesData(
        { queryKey: ["messages"] },
        (oldData: InfiniteData<MessagesResponse, number> | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: MessagesResponse) => ({
              ...page,
              messages: page.messages.map((msg) =>
                msg.messageId === messageId
                  ? {
                      ...msg,
                      userTags: [
                        ...new Set([...(msg.userTags || []), ...tags]),
                      ],
                    }
                  : msg,
              ),
            })),
          };
        },
      );
    },
  });
};

export const useDeleteMessage = () => {
  return useMutation({
    mutationFn: async (messageId: string) => {
      await apiClient.delete(`/messages/${messageId}`);
    },
    onMutate: async (messageId) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["messages"] });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(["messages"]);

      // Optimistically remove the message from the cached pages
      queryClient.setQueriesData(
        { queryKey: ["messages"] },
        (oldData: InfiniteData<MessagesResponse, number> | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: MessagesResponse) => ({
              ...page,
              messages: page.messages.filter(
                (msg) => msg.messageId !== messageId,
              ),
            })),
          };
        },
      );

      return { previousMessages };
    },
    onError: (_err, _messageId, context) => {
      // If the mutation fails, roll back to the previous snapshot
      if (context?.previousMessages) {
        queryClient.setQueryData(["messages"], context.previousMessages);
      }
      alert("Failed to delete the message.");
    },
    onSettled: () => {
      // Always refetch after error or success to ensure db sync
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
};
