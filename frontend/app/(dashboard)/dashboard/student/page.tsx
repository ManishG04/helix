import React from "react";
import {
  CalendarCheck,
  FolderKanban,
  UsersRound,
  Clock,
} from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import { Card, Badge } from "@/components/ui";
import StudentDashboardClient from "./client";

export default function StudentDashboardPage() {
  return <StudentDashboardClient />;
}
