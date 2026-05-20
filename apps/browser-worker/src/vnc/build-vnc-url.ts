import { env } from "../env";

export function buildVncUrl(): string {
  return `ws://${env.VNC_PUBLIC_HOST}:${env.VNC_PUBLIC_PORT}`;
}
