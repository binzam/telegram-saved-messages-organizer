import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiClient } from "../lib/api-client";
import { queryClient } from "../lib/query-client";
import { socket } from "../lib/socket";

export const useAuth = () => {
  return useQuery({
    queryKey: ["auth"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ authed: boolean }>("/auth/status");
      return data.authed;
    },
    retry: false,
  });
};

export const useSendCode = () => {
  return useMutation<
    void,
    AxiosError<{
      error: string;
    }>,
    { phoneNumber: string }
  >({
    mutationFn: async (data) => {
      await apiClient.post("/auth/send-code", data);
    },
  });
};

export const useVerifyCode = () => {
  return useMutation<
    { mfa?: boolean },
    AxiosError<{
      error: string;
    }>,
    { phoneNumber: string; code: string }
  >({
    mutationFn: async (data) => {
      const { data: responseData } = await apiClient.post(
        "/auth/verify-code",
        data,
      );
      return responseData;
    },
  });
};

export const useVerifyPassword = () => {
  return useMutation<
    void,
    AxiosError<{
      error: string;
    }>,
    { phoneNumber: string; password: string }
  >({
    mutationFn: async (data) => {
      await apiClient.post("/auth/verify-password", data);
    },
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: async (wipe: boolean = false) => {
      const { data } = await apiClient.post(`/auth/logout?wipe=${wipe}`);
      return data;
    },
    onSuccess: () => {
      socket.disconnect();
      queryClient.setQueryData(["auth"], false);
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
};
