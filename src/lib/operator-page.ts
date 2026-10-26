import "server-only";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "./auth";
import { isOperator } from "./operator-access";
export async function operatorPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/account");
  if (!isOperator(session.user.id)) notFound();
  return session.user;
}
