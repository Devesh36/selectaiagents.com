import { z } from "zod";
export const reviewDecisionSchema = z
  .object({
    action: z.enum(["approve", "request_changes", "disable"]),
    version: z.number().int().positive(),
    note: z.string().trim().max(2000).default(""),
    credentialEnv: z
      .string()
      .regex(/^MAKER_[A-Z0-9_]+$/)
      .optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.action !== "approve" && value.note.length < 5)
      ctx.addIssue({
        code: "custom",
        path: ["note"],
        message: "Explain the decision for the maker (at least 5 characters).",
      });
    if (value.action !== "approve" && value.credentialEnv)
      ctx.addIssue({
        code: "custom",
        path: ["credentialEnv"],
        message: "Credentials can only be attached during approval.",
      });
  });
export type ReviewDecision = z.infer<typeof reviewDecisionSchema>;
