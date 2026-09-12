import { useEffect, useRef, useState } from "react";

import { useAuth } from "../auth/useAuth";

const MIN_PASSWORD_LENGTH = 8;

/**
 * Sign in / create account.
 *
 * Accounts are optional: nothing in the product is gated behind one yet. The
 * copy says so explicitly, because asking for a password without explaining why
 * is how you lose the visitor.
 */
export function AuthDialog({ open, onClose, initialMode = "login" }) {
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const emailRef = useRef(null);
  const isSignup = mode === "signup";

  useEffect(() => {
    if (!open) return;
    setMode(initialMode);
    setError(null);
    setBusy(false);
    emailRef.current?.focus();
  }, [open, initialMode]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const switchMode = () => {
    setMode(isSignup ? "login" : "signup");
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (isSignup) await signUp(email, password, name);
      else await signIn(email, password);
      onClose();
    } catch (err) {
      setError(err?.message || "Could not sign you in. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const field =
    "w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-600 focus:border-green-400 focus:outline-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop. Presentational — Escape and the close button do the work. */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-dialog-title"
        className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-7 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-zinc-500 transition hover:text-white"
        >
          ✕
        </button>

        <h2 id="auth-dialog-title" className="text-2xl font-bold">
          {isSignup ? "Create your account" : "Welcome back"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          {isSignup
            ? "Takes a second. An account keeps your prediction history across devices."
            : "Sign in to keep your prediction history across devices."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isSignup && (
            <div>
              <label htmlFor="auth-name" className="sr-only">
                Name
              </label>
              <input
                id="auth-name"
                type="text"
                autoComplete="name"
                placeholder="Name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={field}
              />
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="sr-only">
              Email
            </label>
            <input
              id="auth-email"
              ref={emailRef}
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={field}
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="sr-only">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              required
              minLength={isSignup ? MIN_PASSWORD_LENGTH : undefined}
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder={
                isSignup
                  ? `Password (${MIN_PASSWORD_LENGTH}+ characters)`
                  : "Password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={field}
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-green-500 px-6 py-3 font-semibold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:bg-green-500/50"
          >
            {busy
              ? "Please wait…"
              : isSignup
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-zinc-500">
          {isSignup ? "Already have an account?" : "New to ZonePredictor?"}{" "}
          <button
            type="button"
            onClick={switchMode}
            className="font-medium text-green-400 underline-offset-4 hover:underline"
          >
            {isSignup ? "Sign in" : "Create one"}
          </button>
        </p>
      </div>
    </div>
  );
}
