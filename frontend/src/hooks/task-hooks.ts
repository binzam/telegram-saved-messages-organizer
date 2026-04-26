import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "../lib/query-client";
import type { CreateTaskInput,  TasksResponse } from "../types";
import { apiClient } from "../lib/api-client";

export const useCreateTask = () => {
  return useMutation({
    mutationFn: async (task: CreateTaskInput) => {
      const { data } = await apiClient.post("/task/new", task);
      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },

    // onError: () => {
    //   alert("Failed to create task.");
    // },
  });
};

export const useTasks = (messageId: string) => {
  return useQuery({
    queryKey: ["tasks", messageId],
    queryFn: async () => {
      const { data } = await apiClient.get<TasksResponse>(`/task/${messageId}`);
      return data;
    },
    enabled: !!messageId,
  });
};
