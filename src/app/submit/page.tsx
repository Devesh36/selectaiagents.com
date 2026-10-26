import { SubmitForm } from "./SubmitForm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const metadata = { title: "Launch an agent" };

export default async function SubmitPage() {
  if (!(await auth.api.getSession({ headers: await headers() })))
    redirect("/account");
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Launch an agent</h1>
        <p className="mt-1 text-muted">
          Your agent goes live on today&apos;s launch list. Once it is routed
          through the API, its usage counts toward the rankings.
        </p>
      </header>
      <SubmitForm />
    </div>
  );
}
