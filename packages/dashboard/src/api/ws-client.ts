type EventHandler = (payload: unknown) => void;
const MAX_RETRIES = 10;

class DashboardWsClient {
  private socket: WebSocket | null = null;
  private retryCount = 0;
  private handlers = new Map<string, Set<EventHandler>>();

  connect(token: string) {
    const runtimeWsUrl = (window as unknown as { __WS_URL__?: string }).__WS_URL__;
    const wsUrl = `${runtimeWsUrl ?? import.meta.env["VITE_WS_URL"] ?? "ws://localhost:3001"}/ws?token=${token}`;
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      this.retryCount = 0;
    };

    this.socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as { type: string };
        this._emit(msg.type, msg);
      } catch {
        // ignore
      }
    };

    this.socket.onclose = (event) => {
      if (event.code !== 1000 && this.retryCount < MAX_RETRIES) {
        const delay = Math.min(1000 * Math.pow(2, this.retryCount), 30000);
        this.retryCount++;
        const currentToken = useTokenFn?.();
        if (currentToken) {
          setTimeout(() => this.connect(currentToken), delay);
        }
      }
    };
  }

  send(type: string, payload: Record<string, unknown> = {}) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, ...payload }));
    }
  }

  joinConversation(conversationId: string, lastEventId?: string) {
    this.send("join_conversation", { conversationId, lastEventId });
  }

  sendTyping(conversationId: string, typing: boolean) {
    this.send(typing ? "typing_start" : "typing_stop", { conversationId });
  }

  on(type: string, handler: EventHandler): () => void {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type)!.add(handler);
    return () => this.handlers.get(type)?.delete(handler);
  }

  disconnect() {
    this.retryCount = MAX_RETRIES;
    this.socket?.close(1000);
  }

  private _emit(type: string, payload: unknown) {
    for (const h of this.handlers.get(type) ?? []) {
      try { h(payload); } catch { /* ignore */ }
    }
  }
}

let useTokenFn: (() => string | null) | null = null;

export const dashboardWs = new DashboardWsClient();

export function initDashboardWs(getToken: () => string | null) {
  useTokenFn = getToken;
  const token = getToken();
  if (token) dashboardWs.connect(token);
}
