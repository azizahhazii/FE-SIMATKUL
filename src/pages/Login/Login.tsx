import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Alert } from "assets-design-system";

import User from "@solar-icons/react/users/User";
import Lock from "@solar-icons/react/security/LockPassword";
import Eye from "@solar-icons/react/security/Eye";
import EyeClosed from "@solar-icons/react/security/EyeClosed";

import simatkulIcon from "../../assets/logo/simatkul-icon.svg";
import { useAuth } from "../../context/AuthContext";

export function Login() {
  const navigate = useNavigate();

  const { login, loginAsGuest, isLoading, error, isAuthenticated } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (username.trim() === "") {
      setUsernameError("Username wajib diisi.");
      return;
    }

    setUsernameError(null);

    await login(username, password);
  };

  const handleGuestLogin = () => {
    loginAsGuest();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-300">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-1 rounded-4 bg-white p-4 shadow-e2"
      >
        {/* ================= LOGO ================= */}
        <div className="mb-2 flex flex-col items-center gap-3">
          <div className="flex items-center gap-4">
            <img src={simatkulIcon} alt="" className="h-10 w-10" />

            <span className="text-h7 font-bold text-primary-500">SIMATKUL</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <h1 className="text-h7 font-bold text-primary-600">
              Selamat datang!
            </h1>

            <p className="text-b3 text-neutral-800">
              Login untuk melanjutkan ke SiMatkul
            </p>
          </div>
        </div>

        {/* ================= ERROR ================= */}
        {error && (
          <Alert
            variant="filled"
            status="error"
            title="Login gagal"
            description={error}
          />
        )}

        {/* ================= USERNAME ================= */}
        <Input
          label="Username"
          placeholder="Masukan username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);

            if (usernameError) {
              setUsernameError(null);
            }
          }}
          status={usernameError ? "error" : "default"}
          helperText={usernameError ?? undefined}
          leftIcon={
            <User
              size={14}
              weight="BoldDuotone"
              color="var(--color-neutral-700)"
            />
          }
        />

        {/* ================= PASSWORD ================= */}
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Masukan password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={
            <Lock
              size={14}
              weight="BoldDuotone"
              color="var(--color-neutral-700)"
            />
          }
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? (
                <Eye
                  size={20}
                  weight="BoldDuotone"
                  color="var(--color-neutral-700)"
                  className="translate-y-[3px]"
                />
              ) : (
                <EyeClosed
                  size={20}
                  weight="BoldDuotone"
                  color="var(--color-neutral-700)"
                  className="translate-y-[3px]"
                />
              )}
            </button>
          }
        />

        {/* ================= LOGIN ================= */}
        <Button
          theme="primary"
          variant="solid"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Memproses..." : "Login"}
        </Button>

        {/* ================= GUEST ================= */}
        <div className="mt-4 flex flex-col items-center gap-2">
          <p className="text-b4 text-neutral-700">
            Tidak punya akun? Login sebagai tamu
          </p>

          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={isLoading}
            className="cursor-pointer text-b3 font-semibold text-primary-400 transition hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Login as Guest <span className="ml-1">↗</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
