import { apiRequest } from "../lib/axios";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthUser {
  username: string;
  role: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: AuthUser;
}

/**
 * Login ke backend SIMATKUL.
 *
 * POST /api/auth/login
 */
export async function loginApi(payload: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/api/auth/login", {
    method: "POST",

    // Login belum memiliki token.
    auth: false,

    body: JSON.stringify(payload),
  });
}
