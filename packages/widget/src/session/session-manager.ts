const VISITOR_ID_KEY = "conversio_visitor_id";
const CONVERSATION_ID_KEY = "conversio_conversation_id";

// Widget token is kept in memory only (security — not persisted)
let widgetToken: string | null = null;
let apiBaseUrl: string = "";

export type SessionData = {
  sessionId: string;
  conversationId: string;
  visitorId: string;
  widgetToken: string;
};

export function configureSession(apiUrl: string): void {
  apiBaseUrl = apiUrl;
}

export function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

export function getConversationId(): string | null {
  return sessionStorage.getItem(CONVERSATION_ID_KEY);
}

export function setConversationId(id: string): void {
  sessionStorage.setItem(CONVERSATION_ID_KEY, id);
}

export function getWidgetToken(): string | null {
  return widgetToken;
}

export async function initSession(tenantSlug: string): Promise<SessionData> {
  const visitorId = getVisitorId();

  const resp = await fetch(`${apiBaseUrl}/widget/${tenantSlug}/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      visitorId,
      pageUrl: location.href,
      deviceInfo: navigator.userAgent,
    }),
  });

  if (!resp.ok) {
    throw new Error(`Session init failed: ${resp.status}`);
  }

  const data: SessionData = await resp.json();
  widgetToken = data.widgetToken;
  setConversationId(data.conversationId);
  return data;
}

export async function refreshSession(tenantSlug: string): Promise<void> {
  const data = await initSession(tenantSlug);
  widgetToken = data.widgetToken;
}

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
  tenantSlug: string,
  retried = false,
): Promise<Response> {
  const token = getWidgetToken();
  const resp = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (resp.status === 401 && !retried) {
    await refreshSession(tenantSlug);
    return fetchWithAuth(url, options, tenantSlug, true);
  }

  return resp;
}
