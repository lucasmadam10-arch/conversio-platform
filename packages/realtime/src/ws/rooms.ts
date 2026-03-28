import type { WebSocket } from "ws";

// In-memory room registry: conversationId → set of connected sockets
const rooms = new Map<string, Set<WebSocket>>();

export function joinRoom(conversationId: string, socket: WebSocket): void {
  if (!rooms.has(conversationId)) {
    rooms.set(conversationId, new Set());
  }
  rooms.get(conversationId)!.add(socket);
}

export function leaveRoom(conversationId: string, socket: WebSocket): void {
  const room = rooms.get(conversationId);
  if (!room) return;
  room.delete(socket);
  if (room.size === 0) {
    rooms.delete(conversationId);
  }
}

export function leaveAllRooms(socket: WebSocket): string[] {
  const left: string[] = [];
  for (const [convId, members] of rooms.entries()) {
    if (members.has(socket)) {
      members.delete(socket);
      left.push(convId);
      if (members.size === 0) {
        rooms.delete(convId);
      }
    }
  }
  return left;
}

export function broadcast(
  conversationId: string,
  message: unknown,
  excludeSocket?: WebSocket,
): void {
  const room = rooms.get(conversationId);
  if (!room) return;

  const serialized = JSON.stringify(message);
  const dead: WebSocket[] = [];

  for (const socket of room) {
    if (socket === excludeSocket) continue;
    if (socket.readyState === 1 /* OPEN */) {
      socket.send(serialized);
    } else {
      dead.push(socket);
    }
  }

  // Clean up dead sockets
  for (const socket of dead) {
    room.delete(socket);
  }
}

export function getRoomSize(conversationId: string): number {
  return rooms.get(conversationId)?.size ?? 0;
}
