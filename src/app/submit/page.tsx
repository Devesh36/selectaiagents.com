import { SubmitForm } from "./SubmitForm";

export const metadata = { title: "Launch an agent" };

export default function SubmitPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Launch an agent</h1>
        <p className="mt-1 text-muted">
          Your agent goes live on today&apos;s launch list. Once it is routed through the API, its usage counts toward
          the rankings.
        </p>
      </header>
      <SubmitForm />
    </div>
  );
}
