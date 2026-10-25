import { z } from "zod";
import { CATEGORIES } from "./types";

const ref = z
  .string()
  .min(1)
  .max(180)
  .regex(/^[a-z0-9-]+(?:\/[a-z0-9-]+)?(?:#[a-z0-9-]+)?$/);
const routing = z
  .object({
    category: z.enum(CATEGORIES.map((c) => c.id)).optional(),
    sort: z.enum(["price", "latency", "uptime", "usage"]).optional(),
    contract: z.string().max(80).optional(),
    maxPriceUsd: z.number().min(0).max(10).default(10),
  })
  .strict();
export const runSchema = z
  .object({
    endpoint: ref,
    fallbacks: z.array(ref).max(8).optional(),
    route: routing.optional(),
    input: z.unknown().refine((v) => v !== undefined, "input is required"),
  })
  .strict();
export const chatSchema = z
  .object({
    model: ref,
    models: z.array(ref).max(8).optional(),
    route: routing.optional(),
    stream: z.literal(false).optional(),
    messages: z
      .array(
        z
          .object({
            role: z.enum(["system", "user", "assistant"]),
            content: z.string().max(30000),
          })
          .strict(),
      )
      .min(1)
      .max(100),
  })
  .strict();
export type RunBody = z.infer<typeof runSchema>;
export type ChatBody = z.infer<typeof chatSchema>;
