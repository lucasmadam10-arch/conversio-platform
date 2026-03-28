import type { ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/login/LoginPage";
import { InboxPage } from "./pages/inbox/InboxPage";
import { TicketsPage } from "./pages/tickets/TicketsPage";
import { useAuthStore } from "./stores/auth.store";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/inbox"
        element={
          <ProtectedRoute>
            <InboxPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inbox/:conversationId"
        element={
          <ProtectedRoute>
            <InboxPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets"
        element={
          <ProtectedRoute>
            <TicketsPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/inbox" replace />} />
    </Routes>
  );
}
