import { AuthenticationService, UsersService } from "@/src/api";
import { UserRole } from "@/src/api";
import type {
  LoginRequest,
  TokenResponse,
  User,
  UserCreate,
  PasswordChangeRequest,
  SuccessResponse,
} from "@/src/api";
import { ApiError as OpenApiError } from "@/src/api/core/ApiError";

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

function buildMockUser(role: UserRole, email: string, name: string): User {
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
  return {};
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
    access_token: `mock-token-${(matched.user.role || "student").toLowerCase()}`,
    token_type: "bearer",
    expires_in: 3600,
    user: matched.user,
  };
}

// ─── Auth endpoints ───────────────────────────────────────────────────────────

export async function login(payload: LoginRequest): Promise<TokenResponse> {
  if (shouldUseMockNow()) {
    return loginWithMock(payload);
  }

  try {
    const data = await AuthenticationService.login(payload);
    return data;
  } catch (error) {
    // Fall back to mock if backend is unreachable 
    if (!(error instanceof OpenApiError)) {
      return loginWithMock(payload);
    }
    throw error;
  }
}

export async function register(payload: UserCreate): Promise<User> {
  if (USE_MOCK_AUTH) {
    return buildMockUser(payload.role || UserRole.STUDENT, payload.email ?? "", payload.name ?? "");
  }

  return AuthenticationService.register(payload);
}

export async function fetchCurrentUser(): Promise<User> {
  if (shouldUseMockNow()) {
    if (typeof window === "undefined") {
      throw new Error("Mock auth user is only available in browser context");
    }
    const rawUser = localStorage.getItem(MOCK_USER_KEY);
    if (!rawUser) throw new Error("No mock user found");
    return JSON.parse(rawUser) as User;
  }

  return UsersService.getCurrentUser();
}

export async function logoutApi(): Promise<SuccessResponse> {
  if (shouldUseMockNow()) return { message: "Logged out" };
  return AuthenticationService.logout();
}

export async function changePassword(
  payload: PasswordChangeRequest
): Promise<SuccessResponse> {
  return AuthenticationService.changePassword(payload);
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
