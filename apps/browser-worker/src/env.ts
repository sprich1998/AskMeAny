import { z } from "zod";

const EnvSchema = z.object({
  BACKEND_URL: z.string().url().default("http://localhost:4000"),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),
  VNC_PUBLIC_HOST: z.string().default("localhost"),
  VNC_PUBLIC_PORT: z.coerce.number().int().positive().default(6080),
  DISPLAY: z.string().default(":99"),
  HEADLESS: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  SESSION_POLL_INTERVAL_MS: z.coerce.number().int().positive().default(1000)
});

export const env = EnvSchema.parse(process.env);
