// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = "STUDENT" | "FACULTY" | "ADMIN";

/** 0=Sunday, 1=Monday, …, 6=Saturday */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type ProjectStatus = "PROPOSED" | "APPROVED" | "COMPLETED";

export type ProjectPhase = "SYNOPSIS" | "MID_TERM" | "FINAL_EVALUATION" | null;

export type AppointmentStatus = "PENDING" | "REJECTED" | "ACCEPTED";

export type AvailabilityStatus = "PENDING_REVIEW" | "DISABLED" | "ACTIVE";

export type AvailabilitySource = "MANUAL" | "OCR";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

/** The backend returns the user object embedded in the login response */
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  academic_interests: string | null;
  created_at: string;
}

export interface UserCreate {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  academic_interests?: string | null;
}

export interface UserUpdate {
  name?: string;
  academic_interests?: string | null;
}

// ─── Project ──────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  title: string;
  description: string | null;
  mentor_id: string | null;
  status: ProjectStatus;
  current_phase: ProjectPhase;
  created_at: string;
}

export interface ProjectCreate {
  title: string;
  description?: string | null;
  mentor_id?: string | null;
}

export interface ProjectUpdate {
  title?: string;
  description?: string | null;
  mentor_id?: string | null;
  status?: ProjectStatus;
  current_phase?: ProjectPhase;
}

// ─── Team ─────────────────────────────────────────────────────────────────────

export interface Team {
  id: string;
  name: string;
  project_id: string;
  join_code: string;
}

export interface TeamCreate {
  name: string;
  project_id: string;
}

export interface TeamMember {
  member_id: string;
  team_id: string;
  is_leader: boolean;
  member: User;
}

export interface TeamWithMembers extends Team {
  members: TeamMember[];
}

export interface JoinTeamRequest {
  join_code: string;
}

// ─── Faculty Availability ─────────────────────────────────────────────────────

export interface FacultyAvailability {
  id: string;
  faculty_id: string;
  start_time: string;    // "HH:MM:SS"
  end_time: string;      // "HH:MM:SS"
  day_of_week: DayOfWeek;
  slot_duration: number; // minutes
  status: AvailabilityStatus;
  source: AvailabilitySource;
  created_at: string;
}

export interface FacultyAvailabilityCreate {
  start_time: string;
  end_time: string;
  day_of_week: DayOfWeek;
}

export interface FacultyAvailabilityUpdate {
  start_time?: string;
  end_time?: string;
  day_of_week?: DayOfWeek;
  status?: AvailabilityStatus;
}

// ─── Appointment ──────────────────────────────────────────────────────────────

export interface Appointment {
  id: string;
  slot_id: string;
  student_id: string;
  faculty_id: string;
  team_id: string | null;
  date: string;         // "YYYY-MM-DD"
  start_time: string;   // "HH:MM:SS"
  end_time: string;     // "HH:MM:SS"
  purpose: string | null;
  status: AppointmentStatus;
}

export interface AppointmentCreate {
  slot_id: string;
  date: string;
  start_time: string;
  end_time: string;
  faculty_id: string;
  purpose?: string | null;
  team_id?: string | null;
}

export interface AppointmentUpdate {
  status?: AppointmentStatus;
  purpose?: string | null;
}

export interface AppointmentWithDetails extends Appointment {
  student: User;
  faculty: User;
  team: Team | null;
}

// ─── Common ───────────────────────────────────────────────────────────────────

export interface ApiError {
  detail: string;
  error_code?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface SuccessResponse {
  message: string;
}
