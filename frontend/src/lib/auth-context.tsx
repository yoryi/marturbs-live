"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { UserRole } from "@/data/mock";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  credits: number;
  avatar?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser | null>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateCredits: (credits: number) => void;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: "client" | "model";
}

const DEMO_USERS: Record<string, { password: string; user: AuthUser }> = {
  "demo@marturbs.live": {
    password: "demo1234",
    user: {
      id: "u1",
      email: "demo@marturbs.live",
      name: "Alex Premium",
      role: "client",
      credits: 450,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
  },
  "model@marturbs.live": {
    password: "demo1234",
    user: {
      id: "m1",
      email: "model@marturbs.live",
      name: "Valentina Noir",
      role: "model",
      credits: 0,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    },
  },
  "admin@marturbs.live": {
    password: "admin1234",
    user: {
      id: "a1",
      email: "admin@marturbs.live",
      name: "Admin",
      role: "admin",
      credits: 0,
    },
  },
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("marturbs_auth");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("marturbs_auth");
      }
    }
    setIsLoading(false);
  }, []);

  const persist = useCallback((u: AuthUser | null) => {
    if (u) localStorage.setItem("marturbs_auth", JSON.stringify(u));
    else localStorage.removeItem("marturbs_auth");
    setUser(u);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const demo = DEMO_USERS[email.toLowerCase()];
      if (demo && demo.password === password) {
        persist(demo.user);
        return demo.user;
      }
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          },
        );
        if (res.ok) {
          const data = await res.json();
          persist(data.user);
          localStorage.setItem("marturbs_token", data.accessToken);
          return data.user as AuthUser;
        }
      } catch {
        /* API offline — demo only */
      }
      return null;
    },
    [persist],
  );

  const register = useCallback(
    async (data: RegisterData) => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/register`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          },
        );
        if (res.ok) {
          const result = await res.json();
          persist(result.user);
          localStorage.setItem("marturbs_token", result.accessToken);
          return true;
        }
      } catch {
        /* fallback mock */
      }
      const newUser: AuthUser = {
        id: `u-${Date.now()}`,
        email: data.email,
        name: data.name,
        role: data.role,
        credits: data.role === "client" ? 50 : 0,
      };
      persist(newUser);
      return true;
    },
    [persist],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("marturbs_token");
    persist(null);
  }, [persist]);

  const updateCredits = useCallback(
    (credits: number) => {
      if (user) persist({ ...user, credits });
    },
    [user, persist],
  );

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, updateCredits }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
