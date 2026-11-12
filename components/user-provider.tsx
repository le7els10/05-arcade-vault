"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import {
  appendScore,
  getServerUserSnapshot,
  getUserSnapshot,
  subscribeUser,
  writeUser,
  type SavedScore,
  type User,
} from "@/lib/storage";

interface UserContextValue {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  saveScore: (entry: Omit<SavedScore, "at">) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  // Server snapshot is null, so the first client render matches the HTML;
  // the stored user is applied right after hydration.
  const user = useSyncExternalStore(subscribeUser, getUserSnapshot, getServerUserSnapshot);

  const login = useCallback((u: User) => writeUser(u), []);
  const logout = useCallback(() => writeUser(null), []);
  const saveScore = useCallback((entry: Omit<SavedScore, "at">) => appendScore(entry), []);

  const value = useMemo(() => ({ user, login, logout, saveScore }), [user, login, logout, saveScore]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside <UserProvider>");
  return ctx;
}
