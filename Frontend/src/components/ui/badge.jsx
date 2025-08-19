import React from "react";
import { cn } from "../../lib/utils";

const badgeVariants = {
  default: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  secondary: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  destructive: "bg-red-100 text-red-800 hover:bg-red-100",
  outline: "border border-gray-200 text-gray-700",
};

export function Badge({ className, variant = "default", ...props }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}