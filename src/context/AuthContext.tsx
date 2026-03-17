"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  location?: string;
  createdAt: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  isLoading: boolean;
  user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let refreshIntervalId: ReturnType<typeof setInterval> | null = null;

    const startRefreshTimer = () => {
      if (refreshIntervalId) {
        clearInterval(refreshIntervalId);
      }

      // Refresh a bit before the 1-hour access token expires.
      refreshIntervalId = setInterval(async () => {
        try {
          await fetch("/api/marketplace/auth/refresh", {
            method: "POST",
            credentials: "include",
          });
        } catch (error) {
          console.error("Periodic token refresh failed:", error);
        }
      }, 50 * 60 * 1000);
    };

    const checkAuth = async () => {
      try {
        const response = await fetch("/api/marketplace/auth/verify", {
          credentials: "include",
        });

        if (response.ok) {
          setIsAuthenticated(true);

          const userResponse = await fetch("/api/marketplace/user", {
            credentials: "include",
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUser(userData.user);
            startRefreshTimer();
          } else {
            setUser(null);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    return () => {
      if (refreshIntervalId) {
        clearInterval(refreshIntervalId);
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, isLoading, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

