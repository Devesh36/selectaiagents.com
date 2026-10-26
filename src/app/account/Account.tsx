"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/client-api";
import { CopyButton } from "@/components/CopyButton";

const input =
  "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm";
const button =
  "rounded-md bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50";
interface Data {
  wallet: { balanceUsd: number; reservedUsd: number; availableUsd: number };
  keys: {
    id: string;
    name: string;
    prefix: string;
    revoked_at: string | null;
  }[];
  ledger: { amount_micros: string; kind: string; created_at: string }[];
  calls: {
    id: string;
    status: string;
    charged_micros: string;
    created_at: string;
  }[];
  agents: { slug: string; name: string }[];
  paymentsEnabled: boolean;
}
export function Account() {
  const { data: session, isPending } = authClient.useSession();
  const [signup, setSignup] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<Data>();
  const [secret, setSecret] = useState("");
  const refresh = async () => setData(await api<Data>("/api/account"));
  useEffect(() => {
    if (session) refresh().catch((e) => setMessage(e.message));
    else {
      setData(undefined);
      setSecret("");
    }
  }, [session?.user.id]); // eslint-disable-line
  async function action(fn: () => Promise<void>) {
    setMessage("");
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }
  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await action(async () => {
      const credentials = {
        email: String(form.get("email")),
        password: String(form.get("password")),
      };
      const result = signup
        ? await authClient.signUp.email({
            ...credentials,
            name: String(form.get("name")),
          })
        : await authClient.signIn.email(credentials);
      if (result.error) throw new Error(result.error.message);
      if (signup && !result.data?.token)
        setMessage(
          "Check your email to verify your account before signing in.",
        );
    });
  }
  if (isPending) return <p>Loading account…</p>;
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">
          {session ? "Your account" : signup ? "Create an account" : "Sign in"}
        </h1>
        <p className="mt-2 text-muted">
          Launch agents, vote, manage API keys, and pay for the calls you make.
        </p>
      </header>
      {message && (
        <p role="status" className="rounded-lg border border-line p-3 text-sm">
          {message}
        </p>
      )}
      {!session ? (
        <form onSubmit={login} className="max-w-sm space-y-4">
          {signup && (
            <label className="block">
              Name
              <input
                name="name"
                autoComplete="name"
                required
                maxLength={60}
                className={input}
              />
            </label>
          )}
          <label className="block">
            Email
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              className={input}
            />
          </label>
          <label className="block">
            Password
            <input
              type="password"
              name="password"
              autoComplete={signup ? "new-password" : "current-password"}
              minLength={12}
              required
              className={input}
            />
          </label>
          <p className="text-xs text-muted">Use at least 12 characters.</p>
          <button disabled={busy} className={button}>
            {busy ? "Please wait…" : signup ? "Create account" : "Sign in"}
          </button>
          <button
            type="button"
            className="block text-sm text-accent"
            onClick={() => {
              setSignup(!signup);
              setMessage("");
            }}
          >
            {signup
              ? "Already have an account? Sign in"
              : "New here? Create an account"}
          </button>
        </form>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p>
              Signed in as <b>{session.user.name}</b> · {session.user.email}
            </p>
            <button
              className="text-sm text-muted"
              onClick={() =>
                action(async () => {
                  await authClient.signOut();
                })
              }
            >
              Sign out
            </button>
          </div>
          {!data ? (
            <p>Loading usage…</p>
          ) : (
            <>
              <section className="rounded-xl border border-line bg-surface p-5 space-y-4">
                <h2 className="text-xl font-semibold">Prepaid credits</h2>
                <div className="flex flex-wrap gap-8">
                  <div>
                    <p className="text-3xl font-bold">
                      ${data.wallet.availableUsd.toFixed(4)}
                    </p>
                    <p className="text-sm text-muted">Available</p>
                  </div>
                  <div>
                    <p className="text-xl">
                      ${data.wallet.reservedUsd.toFixed(4)}
                    </p>
                    <p className="text-sm text-muted">
                      Reserved for in-flight calls
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted">
                  Discovery is free. Only successful executions are charged. A
                  reservation covers the most expensive eligible fallback and
                  unused credit is released.
                </p>
                {data.paymentsEnabled ? (
                  <div className="flex gap-2">
                    {[10, 25, 50].map((amount) => (
                      <button
                        className={button}
                        disabled={busy}
                        key={amount}
                        onClick={() =>
                          action(async () => {
                            const result = await api<{ url: string }>(
                              "/api/billing/checkout",
                              "POST",
                              { amountUsd: amount },
                            );
                            window.location.assign(result.url);
                          })
                        }
                      >
                        Add ${amount}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted">
                    Card top-ups are not configured on this installation yet.
                  </p>
                )}
                <button
                  className="text-sm text-accent"
                  onClick={() => action(refresh)}
                >
                  Refresh balance
                </button>
              </section>
              <section className="space-y-4">
                <h2 className="text-xl font-semibold">API keys</h2>
                <p className="text-sm text-muted">
                  Keys can spend your available balance. Store them securely;
                  you can revoke them at any time.
                </p>
                <form
                  className="flex max-w-md gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const name = String(new FormData(form).get("name"));
                    action(async () => {
                      const result = await api<{ key: string }>(
                        "/api/account",
                        "POST",
                        { name },
                      );
                      setSecret(result.key);
                      form.reset();
                      await refresh();
                    });
                  }}
                >
                  <input
                    aria-label="Key name"
                    name="name"
                    placeholder="Key name"
                    maxLength={60}
                    required
                    className={input}
                  />
                  <button disabled={busy} className={button}>
                    Create
                  </button>
                </form>
                {secret && (
                  <div className="rounded-xl border border-accent p-4">
                    <p className="mb-2 text-sm font-medium">
                      Copy this key now. It will only be shown once.
                    </p>
                    <code className="break-all text-sm">{secret}</code>{" "}
                    <CopyButton text={secret} />
                    <button
                      className="ml-3 text-sm"
                      onClick={() => setSecret("")}
                    >
                      Hide
                    </button>
                  </div>
                )}
                <ul className="divide-y divide-line">
                  {data.keys.map((k) => (
                    <li
                      key={k.id}
                      className="flex flex-wrap justify-between gap-2 py-3"
                    >
                      <span>
                        {k.name}{" "}
                        <code className="text-xs text-muted">{k.prefix}…</code>
                      </span>
                      {k.revoked_at ? (
                        <span className="text-sm text-muted">Revoked</span>
                      ) : (
                        <button
                          disabled={busy}
                          className="text-sm text-down"
                          onClick={() =>
                            action(async () => {
                              await api("/api/account", "DELETE", { id: k.id });
                              await refresh();
                            })
                          }
                        >
                          Revoke
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">Your agents</h2>
                {data.agents.length === 0 ? (
                  <p className="text-muted">
                    You haven’t launched an agent yet.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {data.agents.map((a) => (
                      <li key={a.slug} className="flex justify-between gap-3">
                        <Link href={`/agents/${a.slug}`}>{a.name}</Link>
                        <Link
                          className="text-accent text-sm"
                          href={`/agents/${a.slug}/manage`}
                        >
                          Configure endpoints →
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  className="inline-block text-accent text-sm"
                  href="/submit"
                >
                  Launch an agent →
                </Link>
              </section>
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">Recent calls</h2>
                {!data.calls.length && (
                  <p className="text-muted">
                    No calls yet. Configure an endpoint, then try the
                    playground.
                  </p>
                )}
                <ul className="divide-y divide-line">
                  {data.calls.map((c) => (
                    <li
                      className="flex flex-wrap justify-between gap-2 py-3 text-sm"
                      key={c.id}
                    >
                      <span>
                        {new Date(c.created_at).toLocaleString()} · {c.status}
                      </span>
                      <span>
                        ${(Number(c.charged_micros) / 1e6).toFixed(6)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">Credit ledger</h2>
                <ul className="divide-y divide-line">
                  {data.ledger.map((l, i) => (
                    <li
                      className="flex justify-between gap-2 py-2 text-sm"
                      key={i}
                    >
                      <span>
                        {new Date(l.created_at).toLocaleDateString()} · {l.kind}
                      </span>
                      <span>${(Number(l.amount_micros) / 1e6).toFixed(6)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}
