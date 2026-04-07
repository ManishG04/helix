import React from "react";
import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: string;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  iconColor = "text-indigo-600",
  iconBg = "bg-indigo-50",
  trend,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="mt-1 text-xs text-gray-400">{trend}</p>
          )}
        </div>
        <div className={clsx("rounded-lg p-2.5", iconBg)}>
          <Icon size={20} className={iconColor} />
        </div>
      </div>
    </div>
  );
}
