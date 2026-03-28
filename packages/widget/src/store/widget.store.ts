import { signal } from "@preact/signals";
import type { MessagePayload } from "../types";

export type MessageItem = {
  id: string;
  senderType: string;
  payload: MessagePayload;
  createdAt: string;
};

export type ConnectionState = "connected" | "reconnecting" | "offline";

export const isOpen = signal(false);
export const messages = signal<MessageItem[]>([]);
export const conversationId = signal<string | null>(null);
export const connectionState = signal<ConnectionState>("connected");
export const typingUsers = signal<string[]>([]);
export const tenantName = signal<string>("Support");

export function addMessage(msg: MessageItem): void {
  messages.value = [...messages.value, msg];
}

export function setTypingUser(userId: string, isTyping: boolean): void {
  if (isTyping) {
    if (!typingUsers.value.includes(userId)) {
      typingUsers.value = [...typingUsers.value, userId];
    }
  } else {
    typingUsers.value = typingUsers.value.filter((id) => id !== userId);
  }
}
