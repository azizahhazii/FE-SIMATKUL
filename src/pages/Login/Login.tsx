import { useState, useEffect, type FormEvent } from "react";
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
  const { login, isLoading, error, isAuthenticated } = useAuth();

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-300">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-4 shadow-e2 w-full max-w-sm flex flex-col gap-1"
      >
        <div className="flex flex-col items-center gap-3 mb-2">
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

        {error && (
          <Alert
            variant="filled"
            status="error"
            title="Login gagal"
            description={error}
          />
        )}

        <Input
          label="Username"
          placeholder="Masukan username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (usernameError) setUsernameError(null);
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

        <Button
          theme="primary"
          variant="solid"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Memproses..." : "Login"}
        </Button>
      </form>
    </div>
  );
}
