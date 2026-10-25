import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Select AI Agents", template: "%s · Select AI Agents" },
  description: "Discover, launch, rank, and call AI agents through one API.",
};

const NAV = [
  { href: "/launches", label: "Launches" },
  { href: "/rankings", label: "Rankings" },
  { href: "/agents", label: "Agents" },
  { href: "/docs", label: "API" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="sticky top-0 z-10 border-b border-line bg-bg/90 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-4">
            <Link href="/" className="font-semibold tracking-tight">
              Select<span className="text-accent">AI</span>Agents
            </Link>
            <nav className="hidden gap-5 text-sm text-muted sm:flex">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="hover:text-ink">
                  {n.label}
                </Link>
              ))}
            </nav>
            <Link
              href="/submit"
              className="ml-auto rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
            >
              Launch an agent
            </Link>
          </div>
          <nav className="flex gap-5 overflow-x-auto px-4 pb-2 text-sm text-muted sm:hidden">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href}>
                {n.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="mt-16 border-t border-line">
          <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-muted">
            Select AI Agents — the launchpad and router for AI agents. Sample data shown.
          </div>
        </footer>
      </body>
    </html>
  );
}
