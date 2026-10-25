"use client";

import { useEffect, useState } from "react";

const KEY = "voted-agents";

function readVoted(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function UpvoteButton({ slug, initial }: { slug: string; initial: number }) {
  const [count, setCount] = useState(initial);
  const [voted, setVoted] = useState(false);

  useEffect(() => setVoted(readVoted().includes(slug)), [slug]);

  async function vote(e: React.MouseEvent) {
    // The button sits inside agent rows that are links.
    e.preventDefault();
    e.stopPropagation();
    if (voted) return;
    setVoted(true);
    setCount((c) => c + 1);
    try {
      localStorage.setItem(KEY, JSON.stringify([...readVoted(), slug]));
    } catch {}
    const res = await fetch(`/api/agents/${slug}/upvote`, { method: "POST" });
    if (res.ok) setCount((await res.json()).upvotes);
  }

  return (
    <button
      onClick={vote}
      aria-pressed={voted}
      aria-label={`Upvote (${count})`}
      className={`flex w-14 shrink-0 flex-col items-center rounded-lg border py-1.5 text-sm font-semibold transition ${
        voted ? "border-accent bg-accent text-white" : "border-line bg-surface hover:border-accent"
      }`}
    >
      <span aria-hidden>▲</span>
      {count}
    </button>
  );
}
