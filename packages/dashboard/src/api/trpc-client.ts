import { createTRPCReact } from "@trpc/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@conversio/api";
import { useAuthStore } from "../stores/auth.store";

export const trpc = createTRPCReact<AppRouter>();

export function createTrpcClient() {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${import.meta.env["VITE_API_URL"] ?? "http://localhost:4000"}/trpc`,
        headers() {
          const token = useAuthStore.getState().accessToken;
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    ],
  });
}
