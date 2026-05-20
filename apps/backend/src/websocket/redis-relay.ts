import { redisSubscriber } from "../redis/subscriber";
import { broadcastToSession } from "./session-relay";

const subscribedSessions = new Set<string>();
const TIMELINE_PREFIX = "timeline:";

let isListening = false;
function ensureMessageListener(): void {
  if (isListening) {
    return;
  }

  redisSubscriber.on("message", (channel, message) => {
    if (!channel.startsWith(TIMELINE_PREFIX)) {
      return;
    }

    const sessionId = channel.slice(TIMELINE_PREFIX.length);
    broadcastToSession(sessionId, message);
  });

  isListening = true;
}

export async function subscribeSessionTimeline(sessionId: string): Promise<void> {
  ensureMessageListener();
  if (subscribedSessions.has(sessionId)) {
    return;
  }

  await redisSubscriber.subscribe(`${TIMELINE_PREFIX}${sessionId}`);
  subscribedSessions.add(sessionId);
}

export async function unsubscribeSessionTimeline(sessionId: string): Promise<void> {
  if (!subscribedSessions.has(sessionId)) {
    return;
  }

  await redisSubscriber.unsubscribe(`${TIMELINE_PREFIX}${sessionId}`);
  subscribedSessions.delete(sessionId);
}
