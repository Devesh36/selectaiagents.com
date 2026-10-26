import { createHash } from "node:crypto";
import { z } from "zod";
import { auth } from "./auth";
import { db } from "./db";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public code = "request_error",
  ) {
    super(message);
  }
}
export function errorResponse(error: unknown) {
  if (error instanceof z.ZodError)
    return Response.json(
      {
        error: {
          message: "Invalid request",
          code: "invalid_request",
          details: error.issues.map((i) => ({
            path: i.path,
            message: i.message,
          })),
        },
      },
      { status: 400 },
    );
  const e =
    error instanceof HttpError
      ? error
      : new HttpError(500, "An internal error occurred");
  // Never log bodies, credentials, or upstream responses.
  if (!(error instanceof HttpError))
    console.error(
      "Request failed",
      error instanceof Error ? error.name : "UnknownError",
    );
  return Response.json(
    { error: { message: e.message, code: e.code } },
    { status: e.status },
  );
}
export async function handle(fn: () => Promise<Response>) {
  try {
    return await fn();
  } catch (error) {
    return errorResponse(error);
  }
}
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const expected = new URL(process.env.BETTER_AUTH_URL || req.url).origin;
  if (origin !== expected)
    throw new HttpError(403, "A same-origin request is required");
}
export async function sessionUser(req: Request, mutation = true) {
  if (mutation) sameOrigin(req);
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) throw new HttpError(401, "Sign in to continue", "unauthorized");
  return session.user;
}
export async function caller(req: Request) {
  const header = req.headers.get("authorization");
  if (!header) return (await sessionUser(req)).id;
  const match = /^Bearer (saa_[a-f0-9]{64})$/.exec(header);
  if (!match) throw new HttpError(401, "Invalid API key", "unauthorized");
  const hash = createHash("sha256").update(match[1]).digest("hex");
  const { rows } = await db.query(
    "UPDATE api_keys SET last_used_at=now() WHERE hash=$1 AND revoked_at IS NULL RETURNING user_id",
    [hash],
  );
  if (!rows[0])
    throw new HttpError(401, "Invalid or revoked API key", "unauthorized");
  return rows[0].user_id as string;
}
export async function limit(bucket: string, max: number, seconds = 60) {
  const { rows } = await db.query(
    `INSERT INTO rate_limits(bucket,count,expires_at) VALUES($1,1,now()+$2*interval '1 second')
    ON CONFLICT(bucket) DO UPDATE SET count=CASE WHEN rate_limits.expires_at<=now() THEN 1 ELSE rate_limits.count+1 END,
    expires_at=CASE WHEN rate_limits.expires_at<=now() THEN excluded.expires_at ELSE rate_limits.expires_at END RETURNING count`,
    [bucket, seconds],
  );
  if (rows[0].count > max)
    throw new HttpError(
      429,
      "Too many requests. Please try again later",
      "rate_limit",
    );
}
export async function textBody(req: Request, max = 65536): Promise<string> {
  if (Number(req.headers.get("content-length")) > max)
    throw new HttpError(413, "Request is too large");
  const reader = req.body?.getReader();
  if (!reader) throw new HttpError(400, "JSON body required");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > max) {
        await reader.cancel();
        throw new HttpError(413, "Request is too large");
      }
      chunks.push(value);
    }
    return Buffer.concat(chunks).toString("utf8");
  } catch (e) {
    if (e instanceof HttpError) throw e;
    throw new HttpError(400, "Could not read request body");
  }
}
export async function jsonBody(req: Request, max = 65536): Promise<unknown> {
  const text = await textBody(req, max);
  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, "Invalid JSON");
  }
}
