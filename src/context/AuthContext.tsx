import { createContext, useContext, useState, type ReactNode } from "react";

import { ApiError } from "../lib/axios";
import { loginApi, type AuthUser } from "../services/api";

interface StoredUser extends AuthUser {
  /**
   * DashboardLayout kamu menggunakan `name`.
   * Kita isi dengan username dari backend.
   */
  name: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: StoredUser | null;
  isLoading: boolean;
  error: string | null;

  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Ambil user yang tersimpan dari localStorage.
 *
 * Format baru:
 * {
 *   username: "admin",
 *   role: "admin",
 *   name: "admin"
 * }
 */
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
    /**
     * Format lama dari dummy auth:
     * simatkul_user = "admin"
     *
     * Karena bukan JSON, hapus supaya tidak mengganggu
     * autentikasi baru.
     */
    localStorage.removeItem("simatkul_user");
    return null;
  }
}

/**
 * Ambil token yang valid dari localStorage.
 *
 * Token lama "dummy-token" langsung dibersihkan.
 */
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(getStoredUser);

  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(getStoredToken()),
  );

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /**
   * Login menggunakan endpoint backend.
   */
  async function login(username: string, password: string) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await loginApi({
        username: username.trim(),
        password,
      });

      /**
       * Data user dari backend:
       * {
       *   username: "...",
       *   role: "admin"
       * }
       *
       * DashboardLayout yang sudah ada membutuhkan `name`,
       * jadi kita tambahkan name = username.
       */
      const storedUser: StoredUser = {
        username: response.user.username,
        role: response.user.role,
        name: response.user.username,
      };

      /**
       * Simpan JWT dari backend.
       */
      localStorage.setItem("simatkul_token", response.token);

      /**
       * Simpan data user sebagai JSON.
       */
      localStorage.setItem("simatkul_user", JSON.stringify(storedUser));

      /**
       * Update state React.
       */
      setUser(storedUser);
      setIsAuthenticated(true);
      setError(null);
    } catch (err) {
      /**
       * Error dari backend:
       *
       * 400:
       * Field Username Cannot Be Empty
       *
       * 401:
       * Invalid username or password
       *
       * dsb.
       */
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          "Login gagal, sepertinya ada masalah koneksi atau server. Coba lagi.",
        );
      }

      /**
       * Pastikan state login tetap false kalau request gagal.
       */
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Logout lokal.
   *
   * Backend tidak menyediakan endpoint logout karena JWT
   * cukup dihapus dari client.
   */
  function logout() {
    localStorage.removeItem("simatkul_token");
    localStorage.removeItem("simatkul_user");

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
