import api from "./api";
import type {
  LoginRequest,
  TokenResponse,
  User,
  UserCreate,
  PasswordChangeRequest,
  SuccessResponse,
} from "@/types";
import { AxiosError } from "axios";

export const TOKEN_KEY = "helix_token";
const MOCK_USER_KEY = "helix_mock_user";

// Always use mock when backend is unavailable; set to false once backend is up.
const USE_MOCK_AUTH = process.env.NEXT_PUBLIC_AUTH_MODE !== "real";

function hasMockToken(): boolean {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem(TOKEN_KEY);
  return token?.startsWith("mock-token-") ?? false;
}

function shouldUseMockNow(): boolean {
  return USE_MOCK_AUTH || hasMockToken();
}

function buildMockUser(role: User["role"], email: string, name: string): User {
  const now = new Date().toISOString();
  return {
    id: `mock-${role.toLowerCase()}-id`,
    name,
    email,
    role,
    academic_interests: null,
    created_at: now,
  };
}

/** Seed accounts available in mock mode */
function getSeedMockUsers(): Record<string, { password: string; user: User }> {
  return {
    "student@helix.dev": {
      password: "password123",
      user: buildMockUser("STUDENT", "student@helix.dev", "Demo Student"),
    },
    "faculty@helix.dev": {
      password: "password123",
      user: buildMockUser("FACULTY", "faculty@helix.dev", "Dr. Demo Faculty"),
    },
    "admin@helix.dev": {
      password: "password123",
      user: buildMockUser("ADMIN", "admin@helix.dev", "Demo Admin"),
    },
  };
}

function loginWithMock(payload: LoginRequest): TokenResponse {
  const email = payload.email.trim().toLowerCase();
  const seedUsers = getSeedMockUsers();
  const matched = seedUsers[email];

  if (!matched || matched.password !== payload.password) {
    throw new Error("Invalid mock credentials");
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(matched.user));
  }

  return {
    access_token: `mock-token-${matched.user.role.toLowerCase()}`,
    token_type: "bearer",
    expires_in: 3600,
    user: matched.user,
  };
}

// ─── Auth endpoints ───────────────────────────────────────────────────────────

/** POST /auth/login – sends JSON body, response contains embedded user */
export async function login(payload: LoginRequest): Promise<TokenResponse> {
  if (shouldUseMockNow()) {
    return loginWithMock(payload);
  }

  try {
    const { data } = await api.post<TokenResponse>("/auth/login", payload);
    return data;
  } catch (error) {
    // Fall back to mock if backend is unreachable (no response at all)
    if (error instanceof AxiosError && !error.response) {
      return loginWithMock(payload);
    }
    throw error;
  }
}

/** POST /auth/register */
export async function register(payload: UserCreate): Promise<User> {
  if (USE_MOCK_AUTH) {
    return buildMockUser(payload.role, payload.email, payload.name);
  }

  const { data } = await api.post<User>("/auth/register", payload);
  return data;
}

/** GET /users/me – used on re-hydration when only token is persisted */
export async function fetchCurrentUser(): Promise<User> {
  if (shouldUseMockNow()) {
    if (typeof window === "undefined") {
      throw new Error("Mock auth user is only available in browser context");
    }
    const rawUser = localStorage.getItem(MOCK_USER_KEY);
    if (!rawUser) throw new Error("No mock user found");
    return JSON.parse(rawUser) as User;
  }

  const { data } = await api.get<User>("/users/me");
  return data;
}

/** POST /auth/logout */
export async function logoutApi(): Promise<SuccessResponse> {
  if (shouldUseMockNow()) return { message: "Logged out" };
  const { data } = await api.post<SuccessResponse>("/auth/logout");
  return data;
}

/** POST /auth/change-password */
export async function changePassword(
  payload: PasswordChangeRequest
): Promise<SuccessResponse> {
  const { data } = await api.post<SuccessResponse>(
    "/auth/change-password",
    payload
  );
  return data;
}

// ─── Token helpers ────────────────────────────────────────────────────────────

export function saveToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(MOCK_USER_KEY);
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
