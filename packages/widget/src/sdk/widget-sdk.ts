import { isOpen } from "../store/widget.store";

type SdkEventName = "open" | "close" | "message";
type SdkEventHandler = (...args: unknown[]) => void;

const eventHandlers = new Map<SdkEventName, Set<SdkEventHandler>>();
let identifyFn: ((data: { name?: string; email?: string; userId?: string }) => void) | null = null;

export const widgetSdk = {
  open() {
    isOpen.value = true;
    _emit("open");
  },

  close() {
    isOpen.value = false;
    _emit("close");
  },

  identify(data: { name?: string; email?: string; userId?: string }) {
    identifyFn?.(data);
  },

  on(event: SdkEventName, handler: SdkEventHandler) {
    if (!eventHandlers.has(event)) {
      eventHandlers.set(event, new Set());
    }
    eventHandlers.get(event)!.add(handler);
  },

  off(event: SdkEventName, handler: SdkEventHandler) {
    eventHandlers.get(event)?.delete(handler);
  },

  _setIdentifyFn(fn: typeof identifyFn) {
    identifyFn = fn;
  },

  _emitMessage(payload: unknown) {
    _emit("message", payload);
  },
};

function _emit(event: SdkEventName, ...args: unknown[]) {
  const handlers = eventHandlers.get(event);
  if (handlers) {
    for (const h of handlers) {
      try {
        h(...args);
      } catch (e) {
        console.error(`[Conversio SDK] Handler error for event "${event}":`, e);
      }
    }
  }
}

// Process pre-load queue (calls made before widget.js loaded)
export function processQueue(queue: [string, ...unknown[]][]) {
  for (const [method, ...args] of queue) {
    const fn = widgetSdk[method as keyof typeof widgetSdk];
    if (typeof fn === "function") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (fn as (...a: any[]) => void)(...args);
    }
  }
}
