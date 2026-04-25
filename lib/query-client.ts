import { fetch } from "expo/fetch";
import { Platform } from "react-native";
import { QueryClient, QueryFunction } from "@tanstack/react-query";

const NETLIFY_PRODUCTION_HOST = "appriqf2026.netlify.app";
const RAILWAY_PRODUCTION_API_URL = "https://regatariqf-production.up.railway.app/";

export function getApiUrl(): string {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    const loc = window.location;
    if (loc.hostname === "localhost" || loc.hostname === "127.0.0.1") {
      return "http://localhost:5000/";
    }

    const explicitApiUrl = process.env.EXPO_PUBLIC_API_URL;
    if (explicitApiUrl) {
      return new URL(explicitApiUrl).href;
    }

    if (loc.hostname === NETLIFY_PRODUCTION_HOST) {
      return RAILWAY_PRODUCTION_API_URL;
    }

    return new URL(loc.origin).href;
  }

  const explicitApiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (explicitApiUrl) {
    return new URL(explicitApiUrl).href;
  }

  const host = process.env.EXPO_PUBLIC_DOMAIN;
  if (!host) {
    throw new Error("EXPO_PUBLIC_API_URL or EXPO_PUBLIC_DOMAIN must be set");
  }

  return new URL(`https://${host}`).href;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  route: string,
  data?: unknown | undefined,
  extraHeaders?: Record<string, string>,
): Promise<Response> {
  const baseUrl = getApiUrl();
  const url = new URL(route, baseUrl);

  const headers: Record<string, string> = { ...extraHeaders };
  if (data) headers["Content-Type"] = "application/json";

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const baseUrl = getApiUrl();
    const url = new URL(queryKey.join("/") as string, baseUrl);

    const res = await fetch(url.toString(), {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
