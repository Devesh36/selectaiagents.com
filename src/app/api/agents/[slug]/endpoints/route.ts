import { db } from "@/lib/db";
import { reviewedEndpoint } from "@/lib/maker";
import { handle, HttpError, jsonBody, sessionUser, limit } from "@/lib/http";
async function owner(req: Request, slug: string, mutation: boolean) {
  const user = await sessionUser(req, mutation);
  if (
    !(
      await db.query(
        "SELECT slug FROM agents WHERE slug=$1 AND owner_id=$2 AND NOT demo",
        [slug, user.id],
      )
    ).rowCount
  )
    throw new HttpError(404, "Your agent was not found");
  return user;
}
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  return handle(async () => {
    const { slug } = await params;
    await owner(req, slug, false);
    const { rows } = await db.query(
      "SELECT id,approved,review_status,review_version,config-'credentialEnv' AS config FROM endpoints WHERE agent_slug=$1 ORDER BY id",
      [slug],
    );
    const reviews = await db.query(
      `SELECT id,endpoint_id,reviewed_version,action,actor_name,actor_type,note,created_at FROM (
        SELECT *,row_number() OVER(PARTITION BY endpoint_id ORDER BY created_at DESC,id DESC) AS position
        FROM endpoint_reviews WHERE agent_slug=$1
      ) recent WHERE position<=20 ORDER BY created_at DESC,id DESC`,
      [slug],
    );
    return Response.json({ endpoints: rows, reviews: reviews.rows });
  });
}
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  return handle(async () => {
    const { slug } = await params;
    const user = await owner(req, slug, true);
    await limit(`configure:${user.id}`, 20);
    const config = reviewedEndpoint(await jsonBody(req));
    await db.query(
      `INSERT INTO endpoints(agent_slug,id,config) VALUES($1,$2,$3)
      ON CONFLICT(agent_slug,id) DO UPDATE SET config=excluded.config,approved=false,review_status='pending',review_version=endpoints.review_version+1,updated_at=now()`,
      [slug, config.id, config],
    );
    return Response.json({
      status: "pending_review",
      message:
        "Saved. An operator must approve this endpoint before it receives calls.",
    });
  });
}
