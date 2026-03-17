import React from "react";
import { clsx } from "clsx";
import type { ProjectStatus, AppointmentStatus } from "@/types";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "purple";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  /** Convenience prop: auto-maps ProjectStatus / AppointmentStatus to a variant */
  status?: ProjectStatus | AppointmentStatus;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
  purple: "bg-purple-100 text-purple-700",
};

const statusToVariant: Record<string, BadgeVariant> = {
  // ProjectStatus
  PROPOSED: "info",
  APPROVED: "success",
  COMPLETED: "success",
  // AppointmentStatus
  ACCEPTED: "success",
  REJECTED: "danger",
  PENDING: "warning",
  // AvailabilityStatus
  ACTIVE: "success",
  DISABLED: "default",
  PENDING_REVIEW: "warning",
  // ProjectPhase
  SYNOPSIS: "info",
  MID_TERM: "purple",
  FINAL_EVALUATION: "purple",
};

export default function Badge({
  variant,
  status,
  className,
  children,
  ...props
}: BadgeProps) {
  const resolvedVariant: BadgeVariant =
    variant ?? (status ? (statusToVariant[status] ?? "default") : "default");

  return (
    <span
      {...props}
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[resolvedVariant],
        className
      )}
    >
      {children ?? status}
    </span>
  );
}
