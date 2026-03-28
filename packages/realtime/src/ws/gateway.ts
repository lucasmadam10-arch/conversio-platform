import type { FastifyInstance } from "fastify";
import type { WebSocket } from "ws";
import type { SocketStream } from "@fastify/websocket";
import { WsEventType } from "@conversio/shared";
import { verifyWsToken } from "./auth";
import { joinRoom, leaveAllRooms } from "./rooms";
import { unsubscribeFromConversation } from "../redis/pubsub";
import { setPresence, removePresence } from "../redis/presence";
import { handleMessage } from "./handler";
import { config } from "../config";

export async function registerGateway(app: FastifyInstance) {
  app.get(
    "/ws",
    { websocket: true },
    async (connection: SocketStream, req) => {
      const socket: WebSocket = connection.socket;

      // Extract token from query string
      const url = new URL(req.url, `http://localhost`);
      const token = url.searchParams.get("token");

      if (!token) {
        socket.send(
          JSON.stringify({ type: WsEventType.ERROR, code: "UNAUTHENTICATED" }),
        );
        socket.close(4001, "Unauthenticated");
        return;
      }

      const auth = verifyWsToken(token);
      if (!auth) {
        socket.send(
          JSON.stringify({ type: WsEventType.ERROR, code: "UNAUTHENTICATED" }),
        );
        socket.close(4001, "Invalid token");
        return;
      }

      // Track presence
      await setPresence(auth.tenantId, auth.userId);

      // Widget: auto-join their conversation room
      if (auth.role === "VISITOR" && auth.conversationId) {
        joinRoom(auth.conversationId, socket);
      }

      // Heartbeat: refresh presence every 30s
      const heartbeatInterval = setInterval(() => {
        if (socket.readyState === 1 /* WebSocket.OPEN */) {
          void setPresence(auth.tenantId, auth.userId);
        } else {
          clearInterval(heartbeatInterval);
        }
      }, config.WS_HEARTBEAT_INTERVAL);

      socket.on("message", (raw: Buffer | string) => {
        let parsed: unknown;
        try {
          parsed = JSON.parse(raw.toString());
        } catch {
          socket.send(
            JSON.stringify({ type: WsEventType.ERROR, message: "Invalid JSON" }),
          );
          return;
        }

        void handleMessage(socket, auth, parsed);
      });

      socket.on("close", () => {
        clearInterval(heartbeatInterval);

        // Leave all rooms and clean up pub/sub ref counts
        const leftRooms = leaveAllRooms(socket);
        for (const convId of leftRooms) {
          void unsubscribeFromConversation(convId);
        }

        void removePresence(auth.tenantId, auth.userId);

        app.log.info(
          { userId: auth.userId, rooms: leftRooms },
          "WebSocket disconnected",
        );
      });

      socket.on("error", (err: Error) => {
        app.log.error({ userId: auth.userId, err }, "WebSocket error");
      });

      app.log.info({ userId: auth.userId, role: auth.role }, "WebSocket connected");
    },
  );
}
