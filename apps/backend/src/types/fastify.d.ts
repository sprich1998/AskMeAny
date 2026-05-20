import type { Redis } from "ioredis";
import type { Sql } from "postgres";

declare module "fastify" {
  interface FastifyInstance {
    db: Sql;
    redis: Redis;
  }
}
