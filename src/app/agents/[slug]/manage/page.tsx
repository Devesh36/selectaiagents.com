import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAgent } from "@/lib/store";
import { EndpointEditor } from "./EndpointEditor";
export const dynamic = "force-dynamic";
export default async function ManagePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/account");
  const agent = await getAgent((await params).slug);
  if (!agent || agent.ownerId !== session.user.id) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Configure {agent.name}</h1>
      <p className="text-muted">
        Your listing is public. Configure a working endpoint here, then an
        operator can approve its host and attach credentials securely.
      </p>
      <EndpointEditor slug={agent.slug} />
    </div>
  );
}
