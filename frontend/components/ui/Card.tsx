import React from "react";
import { clsx } from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  noPadding?: boolean;
}

export default function Card({
  title,
  description,
  footer,
  noPadding = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={clsx(
        "rounded-xl border border-gray-200 bg-white shadow-sm",
        className
      )}
    >
      {(title || description) && (
        <div className="border-b border-gray-100 px-5 py-4">
          {title && (
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          )}
          {description && (
            <p className="mt-0.5 text-xs text-gray-500">{description}</p>
          )}
        </div>
      )}
      <div className={clsx(!noPadding && "px-5 py-4")}>{children}</div>
      {footer && (
        <div className="border-t border-gray-100 px-5 py-3">{footer}</div>
      )}
    </div>
  );
}
