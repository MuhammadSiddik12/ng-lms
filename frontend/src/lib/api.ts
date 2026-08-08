import axios, { AxiosError } from "axios";
import type { ApiResponse } from "../types/api";

const baseURL = import.meta.env.VITE_API_URL || "";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("nglms_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiResponse<unknown> | undefined;
    if (data?.message) return data.message;
    if (data?.errors?.length) {
      return data.errors.map((e) => e.message).join(", ");
    }
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export async function apiGet<T>(url: string) {
  const { data } = await api.get<ApiResponse<T>>(url);
  return data.data;
}

export async function apiPost<T>(url: string, body?: unknown) {
  const { data } = await api.post<ApiResponse<T>>(url, body);
  return data.data;
}

export async function apiPatch<T>(url: string, body?: unknown) {
  const { data } = await api.patch<ApiResponse<T>>(url, body);
  return data.data;
}
