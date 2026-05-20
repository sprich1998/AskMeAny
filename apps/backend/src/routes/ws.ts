import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import { subscribeSessionTimeline, unsubscribeSessionTimeline } from "../websocket/redis-relay";
import { addClient, removeClient } from "../websocket/session-relay";

const SubscribeMessageSchema = z.object({
  type: z.literal("subscribe"),
  sessionId: z.string().uuid()
});

export const websocketRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/ws", { websocket: true }, (socket) => {
    let subscribedSessionId: string | null = null;

    socket.on("message", async (raw: Buffer) => {
      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(raw.toString());
      } catch {
        socket.send(
          JSON.stringify({
            type: "error",
            code: "INVALID_MESSAGE",
            message: "Message must be valid JSON."
          })
        );
        return;
      }

      const parsed = SubscribeMessageSchema.safeParse(parsedJson);
      if (!parsed.success) {
        socket.send(
          JSON.stringify({
            type: "error",
            code: "INVALID_MESSAGE",
            message: "Expected { type: \"subscribe\", sessionId: \"uuid\" }."
          })
        );
        return;
      }

      if (subscribedSessionId) {
        const previous = removeClient(subscribedSessionId, socket);
        if (previous.isEmpty) {
          await unsubscribeSessionTimeline(subscribedSessionId);
        }
      }

      subscribedSessionId = parsed.data.sessionId;
      const isFirstClient = addClient(subscribedSessionId, socket);
      if (isFirstClient) {
        await subscribeSessionTimeline(subscribedSessionId);
      }

      socket.send(JSON.stringify({ type: "subscribed", sessionId: subscribedSessionId }));
    });

    socket.on("close", async () => {
      if (!subscribedSessionId) {
        return;
      }

      const removed = removeClient(subscribedSessionId, socket);
      if (removed.isEmpty) {
        await unsubscribeSessionTimeline(subscribedSessionId);
      }
    });
  });
};
