import { createContext, useContext, useState, type ReactNode } from "react";

interface AuthUser {
  name: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DUMMY_USERNAME = "admin";
const DUMMY_PASSWORD = "admin123";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("simatkul_token") === "dummy-token",
  );
  const [user, setUser] = useState<AuthUser | null>(() => {
    const savedName = localStorage.getItem("simatkul_user");
    return savedName ? { name: savedName } : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(username: string, password: string) {
    setIsLoading(true);
    setError(null);

    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (username === "servererror") {
            reject(new Error("SERVER_ERROR"));
            return;
          }
          resolve(null);
        }, 800);
      });

      if (username !== DUMMY_USERNAME || password !== DUMMY_PASSWORD) {
        setError("Username atau password salah.");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("simatkul_token", "dummy-token");
      localStorage.setItem("simatkul_user", username);
      setUser({ name: username });
      setIsAuthenticated(true);
    } catch {
      setError(
        "Login gagal, sepertinya ada masalah koneksi atau server. Coba lagi.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("simatkul_token");
    localStorage.removeItem("simatkul_user");
    setUser(null);
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, isLoading, error, login, logout }}
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
