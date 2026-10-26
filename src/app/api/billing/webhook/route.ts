import Stripe from "stripe";
import { credit } from "@/lib/billing";
import { handle, HttpError, textBody } from "@/lib/http";
export async function POST(req: Request) {
  return handle(async () => {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET)
      throw new HttpError(503, "Payments not configured");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    let event: Stripe.Event;
    const payload = await textBody(req, 1_000_000);
    try {
      event = stripe.webhooks.constructEvent(
        payload,
        req.headers.get("stripe-signature") ?? "",
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch {
      throw new HttpError(400, "Invalid webhook signature");
    }
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const amount = Number(session.metadata?.amountMicros);
      if (
        session.payment_status === "paid" &&
        session.currency === "usd" &&
        userId &&
        session.client_reference_id === userId &&
        Number.isSafeInteger(amount) &&
        amount === (session.amount_total ?? 0) * 10000 &&
        [10e6, 25e6, 50e6].includes(amount)
      ) {
        await credit(userId, amount, `stripe:${session.id}`);
      } else throw new HttpError(400, "Payment metadata did not match");
    }
    return Response.json({ received: true });
  });
}
