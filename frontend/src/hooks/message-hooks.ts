import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import type { MessagesResponse, FilterState } from "../types";
import { apiClient } from "../lib/api-client";

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
  const queryClient = useQueryClient();

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
