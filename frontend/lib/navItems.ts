import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  FolderKanban,
  UsersRound,
  CalendarClock,
  Search,
  ClipboardList,
  BookOpen,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/types";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  STUDENT: [
    { label: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard },
    { label: "Find Faculty", href: "/dashboard/student/find-faculty", icon: Search },
    { label: "My Projects", href: "/dashboard/student/projects", icon: FolderKanban },
    { label: "My Teams", href: "/dashboard/student/teams", icon: UsersRound },
    { label: "Appointments", href: "/dashboard/student/appointments", icon: CalendarCheck },
  ],
  FACULTY: [
    { label: "Dashboard", href: "/dashboard/faculty", icon: LayoutDashboard },
    { label: "Schedule / Availability", href: "/dashboard/faculty/availability", icon: CalendarClock },
    { label: "Manage Requests", href: "/dashboard/faculty/requests", icon: ClipboardList },
    { label: "Mentored Projects", href: "/dashboard/faculty/projects", icon: BookOpen },
  ],
  ADMIN: [
    { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Manage Users", href: "/dashboard/admin/users", icon: Users },
    { label: "System Stats", href: "/dashboard/admin/stats", icon: BarChart3 },
  ],
};
