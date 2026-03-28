import { useState } from "react";
import type { FormEvent, CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { trpc } from "../../api/trpc-client";
import { useAuthStore } from "../../stores/auth.store";
import { initDashboardWs } from "../../api/ws-client";

export function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", tenantSlug: "" });
  const [error, setError] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      useAuthStore.getState().setTokens(data);
      initDashboardWs(() => useAuthStore.getState().accessToken);
      void navigate("/inbox");
    },
    onError: (err) => setError(err.message),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    loginMutation.mutate(form);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f9fafb",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "40px",
          width: "400px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ margin: "0 0 8px", fontSize: "24px", fontWeight: 700 }}>
          Conversio
        </h1>
        <p style={{ color: "#6b7280", margin: "0 0 24px", fontSize: "14px" }}>
          Sign in to your workspace
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px" }}>
              Workspace slug
            </label>
            <input
              type="text"
              value={form.tenantSlug}
              onChange={(e) => setForm((f) => ({ ...f, tenantSlug: e.target.value }))}
              placeholder="your-company"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px" }}>
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="admin@company.com"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px" }}>
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
              required
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{ color: "#ef4444", fontSize: "13px", marginBottom: "16px" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            style={{
              width: "100%",
              padding: "10px",
              background: "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              opacity: loginMutation.isPending ? 0.7 : 1,
            }}
          >
            {loginMutation.isPending ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};
