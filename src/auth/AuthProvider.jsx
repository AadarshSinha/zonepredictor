import { useCallback, useEffect, useMemo, useState } from "react";

import * as api from "../api/client";
import { AuthContext } from "./auth-context";

/**
 * Holds the signed-in user for the whole app.
 *
 * Accounts are optional — predictions work signed out — so nothing here blocks
 * rendering. The stored token is only discarded when the server actively
 * rejects it; a backend that is merely unreachable must not sign anyone out.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(() =>
    api.readToken() ? "loading" : "anonymous"
  );

  useEffect(() => {
    if (!api.readToken()) return;

    let cancelled = false;
    (async () => {
      try {
        const data = await api.getMe();
        if (cancelled) return;
        setUser(data?.user ?? null);
        setStatus("authenticated");
      } catch (err) {
        if (cancelled) return;
        const rejected = !err.isOffline && err.status >= 400 && err.status < 500;
        if (rejected) api.writeToken(null);
        setStatus("anonymous");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const accept = useCallback((data) => {
    api.writeToken(data?.token ?? null);
    setUser(data?.user ?? null);
    setStatus("authenticated");
    return data?.user ?? null;
  }, []);

  // Both throw ApiError on failure so the form can render the server's wording.
  const signIn = useCallback(
    async (email, password) => accept(await api.login(email, password)),
    [accept]
  );

  const signUp = useCallback(
    async (email, password, name) =>
      accept(await api.signup(email, password, name)),
    [accept]
  );

  const signOut = useCallback(() => {
    api.writeToken(null);
    setUser(null);
    setStatus("anonymous");
  }, []);

  const value = useMemo(
    () => ({ user, status, signIn, signUp, signOut }),
    [user, status, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
