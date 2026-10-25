import Stripe from "stripe";
import { z } from "zod";
import { handle, HttpError, jsonBody, sessionUser, limit } from "@/lib/http";
export async function POST(req: Request) {
  return handle(async () => {
    const user = await sessionUser(req);
    await limit(`checkout:${user.id}`, 5);
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET)
      throw new HttpError(503, "Payments are not configured yet");
    const { amountUsd } = z
      .object({
        amountUsd: z.union([z.literal(10), z.literal(25), z.literal(50)]),
      })
      .parse(await jsonBody(req));
    const base = process.env.BETTER_AUTH_URL!;
    const session = await new Stripe(
      process.env.STRIPE_SECRET_KEY,
    ).checkout.sessions.create({
      mode: "payment",
      allowed_payment_method_types: ["card"],
      client_reference_id: user.id,
      metadata: { userId: user.id, amountMicros: String(amountUsd * 1e6) },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amountUsd * 100,
            product_data: { name: "Select AI Agents prepaid credits" },
          },
        },
      ],
      success_url: `${base}/account?checkout=success`,
      cancel_url: `${base}/account?checkout=cancelled`,
    });
    return Response.json({ url: session.url });
  });
}
