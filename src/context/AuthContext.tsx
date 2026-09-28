import { createContext, useContext, useState, type ReactNode } from "react";

import { ApiError } from "../lib/axios";
import { loginApi, type AuthUser } from "../services/api";

interface StoredUser extends AuthUser {
  name: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: StoredUser | null;
  isLoading: boolean;
  error: string | null;

  login: (username: string, password: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_SESSION_KEY = "simatkul_guest";

function getStoredUser(): StoredUser | null {
  const savedUser = localStorage.getItem("simatkul_user");

  if (!savedUser) {
    return null;
  }

  try {
    const parsed = JSON.parse(savedUser) as Partial<StoredUser>;

    if (!parsed.username || !parsed.role) {
      localStorage.removeItem("simatkul_user");
      return null;
    }

    return {
      username: parsed.username,
      role: parsed.role,
      name: parsed.name ?? parsed.username,
    };
  } catch {
    localStorage.removeItem("simatkul_user");
    return null;
  }
}

function getStoredToken(): string | null {
  const token = localStorage.getItem("simatkul_token");

  if (!token || token === "dummy-token") {
    if (token === "dummy-token") {
      localStorage.removeItem("simatkul_token");
    }

    return null;
  }

  return token;
}

function getGuestSession(): boolean {
  return localStorage.getItem(GUEST_SESSION_KEY) === "true";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(getStoredUser);

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(getStoredToken()) || getGuestSession();
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(username: string, password: string) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await loginApi({
        username: username.trim(),
        password,
      });

      const storedUser: StoredUser = {
        username: response.user.username,
        role: response.user.role,
        name: response.user.username,
      };

      localStorage.removeItem(GUEST_SESSION_KEY);

      localStorage.setItem("simatkul_token", response.token);
      localStorage.setItem("simatkul_user", JSON.stringify(storedUser));

      setUser(storedUser);
      setIsAuthenticated(true);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          "Login gagal, sepertinya ada masalah koneksi atau server. Coba lagi.",
        );
      }

      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Guest sementara dibuat sebagai session lokal FE.
   *
   * Tidak memakai JWT admin.
   */
  function loginAsGuest() {
    const guestUser: StoredUser = {
      username: "guest",
      role: "guest",
      name: "Guest",
    };

    localStorage.removeItem("simatkul_token");

    localStorage.setItem("simatkul_user", JSON.stringify(guestUser));

    localStorage.setItem(GUEST_SESSION_KEY, "true");

    setUser(guestUser);
    setIsAuthenticated(true);
    setError(null);
  }

  function logout() {
    localStorage.removeItem("simatkul_token");
    localStorage.removeItem("simatkul_user");
    localStorage.removeItem(GUEST_SESSION_KEY);

    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        error,
        login,
        loginAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  }

  return context;
}
