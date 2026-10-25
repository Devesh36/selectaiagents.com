import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Select AI Agents — Find what’s next.",
    template: "%s · Select AI Agents",
  },
  description:
    "Discover exceptional AI agents. Launch what you’ve built. Connect to them all through one API.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const preview = process.env.SHOW_DEMO_AGENTS === "true";
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteHeader preview={preview} />
        <main id="main" className="site-main">
          {children}
        </main>
        <footer className="site-footer">
          <div className="footer-top">
            <div>
              <Link className="footer-wordmark" href="/">
                Select<span> / Agents</span>
              </Link>
              <p>
                Discover what’s possible.
                <br />
                Build what comes next.
              </p>
            </div>
            <div className="footer-links">
              <div>
                <span className="eyebrow">Explore</span>
                <Link href="/agents">Agent directory ↗</Link>
                <Link href="/rankings">Usage rankings ↗</Link>
                <Link href="/launches">Latest launches ↗</Link>
              </div>
              <div>
                <span className="eyebrow">Build</span>
                <Link href="/maker">Maker studio ↗</Link>
                <Link href="/playground">Playground ↗</Link>
                <Link href="/docs">API documentation ↗</Link>
                <Link href="/submit">Launch your agent ↗</Link>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Select AI Agents</span>
            <span className="footer-status">
              <span className="status-dot" /> One API. An open world of agents.
            </span>
            <Link href="/account">Your account ↗</Link>
          </div>
          {preview && (
            <p className="demo-disclosure">
              DEVELOPMENT PREVIEW · Listings marked Demo are fictional examples.
              They cannot receive calls or votes and are excluded from usage
              rankings.
            </p>
          )}
        </footer>
      </body>
    </html>
  );
}
