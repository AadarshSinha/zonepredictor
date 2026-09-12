import { useEffect, useState } from "react";

import logo from "../assets/logo.png";
import { useAuth } from "../auth/useAuth";

const LINKS = [
  { href: "#predict", label: "Predict" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#maps", label: "Maps" },
  { href: "#performance", label: "Performance" },
  { href: "#contact", label: "Contact" },
];

const STATUS_STYLES = {
  checking: { dot: "bg-zinc-500", label: "Checking server…" },
  online: { dot: "bg-green-400", label: "Server online" },
  offline: { dot: "bg-red-500", label: "Server offline" },
};

export function Navbar({ backendStatus, onSignIn }) {
  const { user, status, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const indicator = STATUS_STYLES[backendStatus] ?? STATUS_STYLES.checking;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled
          ? "border-b border-zinc-800/80 bg-black/80 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
        <a href="#top" className="flex shrink-0 items-center gap-2">
          <img src={logo} alt="" className="h-8 w-8 object-contain" />
          <span className="text-base font-semibold tracking-tight">
            Zone<span className="text-green-400">Predictor</span>
          </span>
        </a>

        <ul className="ml-auto hidden items-center gap-6 text-sm text-zinc-400 lg:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="transition hover:text-white">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <span
          title={indicator.label}
          className="ml-auto flex items-center gap-2 text-xs text-zinc-500 lg:ml-0"
        >
          <span
            aria-hidden="true"
            className={`h-2 w-2 rounded-full ${indicator.dot} ${
              backendStatus === "online" ? "animate-pulse" : ""
            }`}
          />
          <span className="sr-only">{indicator.label}</span>
          <span className="hidden md:inline">{indicator.label}</span>
        </span>

        {status === "authenticated" && user ? (
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm transition hover:border-zinc-700"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-green-500 text-xs font-bold text-black">
                {(user.name || user.email || "?").charAt(0).toUpperCase()}
              </span>
              <span className="hidden max-w-[10rem] truncate sm:inline">
                {user.name || user.email}
              </span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-800 bg-zinc-900 p-2 shadow-2xl">
                <div className="border-b border-zinc-800 px-3 pb-2 pt-1">
                  <p className="truncate text-sm text-zinc-300">{user.email}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-green-400">
                    {user.plan === "pro" ? "Pro plan" : "Starter plan"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    signOut();
                  }}
                  className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={onSignIn}
            className="shrink-0 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-green-400 hover:text-white"
          >
            Sign in
          </button>
        )}
      </nav>
    </header>
  );
}
