import { createContext } from "react";

/**
 * Split from the provider so this module exports no components — that keeps
 * React Fast Refresh (and eslint-plugin-react-refresh) happy.
 */
export const AuthContext = createContext({
  user: null,
  status: "loading", // loading | anonymous | authenticated
  signIn: async () => {},
  signUp: async () => {},
  signOut: () => {},
});
