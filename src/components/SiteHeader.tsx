"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/agents", label: "Agents" },
  { href: "/rankings", label: "Rankings" },
  { href: "/launches", label: "Launches" },
  { href: "/playground", label: "Playground" },
  { href: "/docs", label: "Docs" },
];

export function SelectMark() {
  return (
    <svg
      viewBox="0 0 32 36"
      fill="none"
      aria-hidden="true"
      className="select-mark"
    >
      <rect x="1" y="3" width="30" height="30" rx="9" fill="currentColor" />
      <path
        d="m9 21 6-6m-1 0h8v8m-7-2 7-6"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SiteHeader({ preview }: { preview: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("select-theme") === "dark";
      setDark(saved);
      document.documentElement.dataset.theme = saved ? "dark" : "light";
    } catch {}
  }, []);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);
  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try {
      localStorage.setItem("select-theme", next ? "dark" : "light");
    } catch {}
  }
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="wordmark" aria-label="Select AI Agents home">
          <SelectMark />
          <span>
            Select<span className="wordmark-divider"> </span>
            <span className="wordmark-product">Agents</span>
          </span>
        </Link>
        <nav aria-label="Main navigation" className="desktop-nav">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname.startsWith(link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <button
            type="button"
            className="icon-button theme-button"
            onClick={toggleTheme}
            aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
          >
            {dark ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                aria-hidden="true"
              >
                <path d="M20 14.1A8.3 8.3 0 0 1 9.9 4a8.5 8.5 0 1 0 10.2 10.2Z" />
              </svg>
            )}
          </button>
          <Link href="/account" className="account-link">
            Account
          </Link>
          <Link href="/submit" className="button button-dark header-launch">
            Submit agent <span aria-hidden="true">↗</span>
          </Link>
          <button
            className="icon-button menu-toggle"
            type="button"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen(!open)}
          >
            <span>{open ? "×" : "☰"}</span>
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="mobile-nav"
        >
          {links.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
            >
              <span className="eyebrow">0{i + 1}</span>
              {link.label}
              <span aria-hidden="true">↗</span>
            </Link>
          ))}
          <Link href="/account" onClick={() => setOpen(false)}>
            <span className="eyebrow">06</span>Account
            <span aria-hidden="true">↗</span>
          </Link>
          <Link href="/submit" onClick={() => setOpen(false)}>
            <span className="eyebrow">07</span>Submit agent
            <span aria-hidden="true">↗</span>
          </Link>
        </nav>
      )}
      {preview && (
        <span className="sr-only">
          Preview catalog. Demo listings cannot receive calls or votes.
        </span>
      )}
    </header>
  );
}
