import { render, h } from "preact";
import { Launcher } from "./components/Launcher";
import { ChatWindow } from "./components/ChatWindow";
import {
  configureSession,
  initSession,
  getWidgetToken,
} from "./session/session-manager";
import {
  addMessage,
  conversationId as conversationIdSignal,
  tenantName,
  connectionState,
  setTypingUser,
} from "./store/widget.store";
import { WsClient } from "./api/ws-client";
import { WsEventType } from "./constants";
import { widgetSdk, processQueue } from "./sdk/widget-sdk";

declare global {
  interface Window {
    Conversio: typeof widgetSdk & {
      q?: [string, ...unknown[]][];
      _tenantSlug?: string;
    };
  }
}

// Read tenant slug from the script tag's data attribute
function getTenantSlug(): string {
  const scripts = document.querySelectorAll("script[data-tenant]");
  for (const s of scripts) {
    const slug = s.getAttribute("data-tenant");
    if (slug) return slug;
  }
  // Fallback: check window
  return window.Conversio?._tenantSlug ?? "demo";
}

async function init() {
  const tenantSlug = getTenantSlug();
  const apiBaseUrl = (import.meta as unknown as { env: Record<string, string> }).env?.["VITE_API_URL"] ?? "http://localhost:4000";
  const wsBaseUrl = (import.meta as unknown as { env: Record<string, string> }).env?.["VITE_WS_URL"] ?? "ws://localhost:3001";

  configureSession(apiBaseUrl);

  // Fetch tenant config
  try {
    const configResp = await fetch(`${apiBaseUrl}/widget/${tenantSlug}/config`);
    if (configResp.ok) {
      const cfg = await configResp.json() as { name?: string };
      if (cfg.name) tenantName.value = cfg.name;
    }
  } catch {
    // proceed without config
  }

  // Init session
  let session: Awaited<ReturnType<typeof initSession>> | null = null;
  try {
    session = await initSession(tenantSlug);
    conversationIdSignal.value = session.conversationId;
  } catch (err) {
    console.error("[Conversio] Session init failed:", err);
  }

  // Connect WebSocket
  const wsClient = new WsClient(`${wsBaseUrl}/ws`, getWidgetToken);
  wsClient.connect();

  // Join conversation room on connect
  wsClient.on("_state", (payload) => {
    const state = (payload as { state: string }).state;
    if (state === "CONNECTED" && conversationIdSignal.value) {
      wsClient.send(WsEventType.JOIN_CONVERSATION, {
        conversationId: conversationIdSignal.value,
      });
      connectionState.value = "connected";
    } else if (state === "RECONNECTING") {
      connectionState.value = "reconnecting";
    } else if (state === "DISCONNECTED") {
      const data = payload as { offline?: boolean };
      if (data.offline) connectionState.value = "offline";
    }
  });

  // Handle new messages from server
  wsClient.on(WsEventType.NEW_MESSAGE, (payload) => {
    const data = payload as { message: { id: string; senderType: string; payload: unknown; createdAt: string } };
    const msg = data.message;
    addMessage({
      id: msg.id,
      senderType: msg.senderType,
      payload: msg.payload as Parameters<typeof addMessage>[0]["payload"],
      createdAt: msg.createdAt,
    });
    widgetSdk._emitMessage(msg);
  });

  wsClient.on(WsEventType.TYPING_INDICATOR, (payload) => {
    const data = payload as { userId: string; isTyping: boolean };
    setTypingUser(data.userId, data.isTyping);
  });

  // Mount into Shadow DOM for CSS isolation
  const host = document.createElement("div");
  host.id = "conversio-widget-host";
  document.body.appendChild(host);
  const shadowRoot = host.attachShadow({ mode: "closed" });

  const container = document.createElement("div");
  shadowRoot.appendChild(container);

  function App() {
    return h("div", null, [
      h(Launcher, null),
      h(ChatWindow, { wsClient, tenantSlug, apiBaseUrl }),
    ]);
  }

  render(h(App, null), container);

  // Expose public SDK
  const existingQueue = window.Conversio?.q ?? [];
  Object.assign(window.Conversio ?? {}, widgetSdk);
  window.Conversio = { ...widgetSdk, q: [] };
  processQueue(existingQueue as [string, ...unknown[]][]);
}

// Start
init().catch((err) => console.error("[Conversio] Init failed:", err));
