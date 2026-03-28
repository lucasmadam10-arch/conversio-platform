type WsState = "DISCONNECTED" | "CONNECTING" | "CONNECTED" | "RECONNECTING";
type EventHandler = (payload: unknown) => void;

const MAX_RETRIES = 10;
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 30_000;

export class WsClient {
  private socket: WebSocket | null = null;
  private state: WsState = "DISCONNECTED";
  private retryCount = 0;
  private handlers = new Map<string, Set<EventHandler>>();
  private lastEventId: string | null = null;

  constructor(
    private readonly url: string,
    private readonly getToken: () => string | null,
  ) {}

  connect(): void {
    if (this.state === "CONNECTED" || this.state === "CONNECTING") return;
    this._connect();
  }

  disconnect(): void {
    this.retryCount = MAX_RETRIES; // prevent reconnect
    this.socket?.close(1000, "Client disconnecting");
    this.state = "DISCONNECTED";
  }

  send(type: string, payload: Record<string, unknown> = {}): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, ...payload }));
    }
  }

  on(type: string, handler: EventHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
    return () => this.handlers.get(type)?.delete(handler);
  }

  setLastEventId(id: string): void {
    this.lastEventId = id;
  }

  private _connect(): void {
    const token = this.getToken();
    if (!token) {
      console.warn("[WsClient] No token available, cannot connect");
      return;
    }

    this.state = this.retryCount > 0 ? "RECONNECTING" : "CONNECTING";
    this._emit("_state", { state: this.state });

    const wsUrl = new URL(this.url);
    wsUrl.searchParams.set("token", token);
    if (this.lastEventId) {
      wsUrl.searchParams.set("lastEventId", this.lastEventId);
    }

    try {
      this.socket = new WebSocket(wsUrl.toString());
    } catch (err) {
      this._scheduleRetry();
      return;
    }

    this.socket.onopen = () => {
      this.state = "CONNECTED";
      this.retryCount = 0;
      this._emit("_state", { state: "CONNECTED" });
    };

    this.socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as { type: string; message?: { id: string } };
        if (msg.message?.id) {
          this.lastEventId = msg.message.id;
        }
        this._emit(msg.type, msg);
      } catch {
        // ignore parse errors
      }
    };

    this.socket.onclose = (event) => {
      if (event.code === 1000 || this.retryCount >= MAX_RETRIES) {
        this.state = "DISCONNECTED";
        this._emit("_state", { state: "DISCONNECTED" });
        return;
      }
      this._scheduleRetry();
    };

    this.socket.onerror = () => {
      // onclose will handle retry
    };
  }

  private _scheduleRetry(): void {
    if (this.retryCount >= MAX_RETRIES) {
      this.state = "DISCONNECTED";
      this._emit("_state", { state: "DISCONNECTED", offline: true });
      return;
    }

    const delay = Math.min(BASE_DELAY_MS * Math.pow(2, this.retryCount), MAX_DELAY_MS);
    this.retryCount++;
    this.state = "RECONNECTING";
    this._emit("_state", { state: "RECONNECTING", retryIn: delay });

    setTimeout(() => this._connect(), delay);
  }

  private _emit(type: string, payload: unknown): void {
    const handlers = this.handlers.get(type);
    if (handlers) {
      for (const h of handlers) {
        try {
          h(payload);
        } catch (e) {
          console.error("[WsClient] Handler error:", e);
        }
      }
    }
  }
}
