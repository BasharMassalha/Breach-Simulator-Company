import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../api/http";
import type { HttpError } from "../../api/http";

export type User = {
  id: string;
  email: string;
  role: "admin" | "employee";
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

type AuthState = {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

const TOKEN_KEY = "bsc_jwt";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refreshMe() {
    if (!token) {
      setUser(null);
      return;
    }
    const res = await apiFetch<{ user: User }>("/api/auth/me", { token });
    setUser(res.user);
  }

  async function login(email: string, password: string) {
    const res = await apiFetch<{ token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });
    localStorage.setItem(TOKEN_KEY, res.token);
    setToken(res.token);
    setUser(res.user);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  useEffect(() => {
    (async () => {
      try {
        await refreshMe();
      } catch (e) {
        // Token invalid/expired: clear it.
        const err = e as HttpError;
        if (err?.status === 401) {
          logout();
        }
      } finally {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<AuthState>(
    () => ({ token, user, isLoading, login, logout, refreshMe }),
    [token, user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

