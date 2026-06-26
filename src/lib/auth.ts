export interface AuthSession {
  token: string;
  userId: string;
  role: string;
  name?: string;
  email?: string;
}

export interface RegisterPayload {
  name?: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim();
const SESSION_STORAGE_KEY = "mrsushi.auth.session";

async function api<T>(path: string, method: "POST", body: unknown): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("Configura VITE_API_BASE_URL para conectar el auth del backend.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || `HTTP ${response.status}`);
  }

  return data as T;
}

export async function registerCustomer(payload: RegisterPayload) {
  return api<{ userId: string }>("/auth/register", "POST", payload);
}

export async function loginCustomer(payload: LoginPayload) {
  return api<{ token: string; userId: string; role: string }>("/auth/login", "POST", payload);
}

export function loadSession(): AuthSession | null {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

export function saveSession(session: AuthSession) {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  localStorage.setItem("token", session.token);
  localStorage.setItem("userId", session.userId);
}

export function clearSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
}
