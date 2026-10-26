"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/client-api";
import { authClient } from "@/lib/auth-client";
interface Comment {
  id: string;
  body: string;
  name: string;
  user_id: string;
  created_at: string;
}
export function Comments({ slug }: { slug: string }) {
  const { data: session } = authClient.useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const path = `/api/agents/${slug}/comments`;
  async function load() {
    setComments((await api<{ comments: Comment[] }>(path)).comments);
  }
  useEffect(() => {
    load().catch((e) => setMessage(e.message));
  }, [slug]);
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Discussion</h2>
      {session ? (
        <form
          className="space-y-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            setPending(true);
            try {
              await api(path, "POST", {
                body: String(new FormData(form).get("body")),
              });
              form.reset();
              await load();
              setMessage("");
            } catch (error) {
              setMessage((error as Error).message);
            } finally {
              setPending(false);
            }
          }}
        >
          <textarea
            aria-label="Comment"
            name="body"
            required
            maxLength={2000}
            rows={3}
            placeholder="Ask a question or share feedback"
            className="w-full rounded-lg border border-line bg-surface p-3 text-sm"
          />
          <button
            disabled={pending}
            className="rounded-md bg-accent px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            Post comment
          </button>
        </form>
      ) : (
        <Link className="text-sm text-accent" href="/account">
          Sign in to join the discussion →
        </Link>
      )}
      {message && (
        <p role="status" className="text-sm text-down">
          {message}
        </p>
      )}
      {!comments.length && (
        <p className="text-sm text-muted">No comments yet.</p>
      )}
      <ul className="divide-y divide-line">
        {comments.map((c) => (
          <li className="py-4 space-y-2" key={c.id}>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Link className="font-semibold" href={`/makers/${c.user_id}`}>
                {c.name}
              </Link>
              <span className="text-xs text-muted">
                {new Date(c.created_at).toLocaleDateString()}
              </span>
              {c.user_id === session?.user.id && (
                <button
                  className="ml-auto text-xs text-muted"
                  onClick={async () => {
                    try {
                      await api(path, "DELETE", { id: c.id });
                      await load();
                    } catch (error) {
                      setMessage((error as Error).message);
                    }
                  }}
                >
                  Delete
                </button>
              )}
            </div>
            <p className="whitespace-pre-wrap break-words text-sm">{c.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
