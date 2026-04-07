import http from "../../services/http";

export type LoginPayload = {
  username: string;
  password: string;
};

export type RegisterPayload = {
  email?: string;
  fullName: string;
  password: string;
  phone: string;
  username: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
  timestamp: string;
};

export type AuthSession = {
  message: string;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
};

const ACCESS_TOKEN_KEY = "flood_rescue_access_token";
const REFRESH_TOKEN_KEY = "flood_rescue_refresh_token";
const TOKEN_TYPE_KEY = "flood_rescue_token_type";

export async function login(payload: LoginPayload) {
  const response = await http.post<ApiResponse<AuthSession>>(
    "/api/auth/login",
    payload
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Dang nhap that bai.");
  }

  return {
    ...response.data.data,
    message: response.data.data.message || response.data.message,
  };
}

export async function register(payload: RegisterPayload) {
  const response = await http.post<ApiResponse<AuthSession>>(
    "/api/auth/register",
    payload
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Đăng ký thất bại.");
  }

  return {
    ...response.data.data,
    message: response.data.data.message || response.data.message,
  };
}

export function persistAuthSession(
  authSession: AuthSession,
  rememberSession: boolean
) {
  const primaryStorage = rememberSession
    ? window.localStorage
    : window.sessionStorage;
  const secondaryStorage = rememberSession
    ? window.sessionStorage
    : window.localStorage;

  secondaryStorage.removeItem(ACCESS_TOKEN_KEY);
  secondaryStorage.removeItem(REFRESH_TOKEN_KEY);
  secondaryStorage.removeItem(TOKEN_TYPE_KEY);

  primaryStorage.setItem(ACCESS_TOKEN_KEY, authSession.accessToken);
  primaryStorage.setItem(REFRESH_TOKEN_KEY, authSession.refreshToken);
  primaryStorage.setItem(TOKEN_TYPE_KEY, authSession.tokenType);
}
