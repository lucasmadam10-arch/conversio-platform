import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, createTrpcClient } from "./api/trpc-client";
import { AppRouter } from "./router";
import { useAuthStore } from "./stores/auth.store";
import { initDashboardWs } from "./api/ws-client";

function App() {
  // If the user is already logged in (persisted token), connect WS immediately
  useEffect(() => {
    const token = useAuthStore.getState().accessToken;
    if (token) initDashboardWs(() => useAuthStore.getState().accessToken);
  }, []);

  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
      },
    },
  }));
  const [trpcClient] = useState(() => createTrpcClient());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(<App />);
