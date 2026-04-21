import axios from "axios";

export const API_URL = import.meta.env.VITE_BASE_URL;

if (API_URL == null) {
  throw new Error("ENV VARIABLE NOT FOUND");
}

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
