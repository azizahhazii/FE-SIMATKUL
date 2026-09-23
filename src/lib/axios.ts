const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://simatkul-be.vercel.app";

interface ApiRequestOptions extends RequestInit {
  /**
   * true  → otomatis kirim Bearer token
   * false → request tanpa token
   */
  auth?: boolean;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Generic API request.
 *
 * Contoh:
 * apiRequest<MyResponse>("/api/example")
 */
export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { auth = true, headers, body, ...requestOptions } = options;

  const requestHeaders = new Headers(headers);

  requestHeaders.set("Accept", "application/json");

  // Hanya set JSON content type kalau body bukan FormData.
  if (body && !(body instanceof FormData)) {
    requestHeaders.set("Content-Type", "application/json");
  }

  // Request yang membutuhkan autentikasi otomatis memakai token yang tersimpan.
  if (auth) {
    const token = localStorage.getItem("simatkul_token");

    if (token && token !== "dummy-token") {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...requestOptions,
      headers: requestHeaders,
      body,
    });
  } catch {
    throw new ApiError(
      "Tidak dapat terhubung ke server. Periksa koneksi internet atau server.",
      0,
    );
  }

  const responseText = await response.text();

  let data: unknown = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }
  }

  if (!response.ok) {
    let message = `Request gagal (${response.status})`;

    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
    ) {
      message = data.message;
    }

    throw new ApiError(message, response.status);
  }

  return data as T;
}
