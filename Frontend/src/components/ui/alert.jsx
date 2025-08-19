import React from "react";
import { cn } from "../../lib/utils";

const alertVariants = {
  default: "border-gray-200 text-gray-900",
  destructive: "border-red-500/50 text-red-900 bg-red-50",
};

export function Alert({ className, variant = "default", ...props }) {
  return (
    <div
      className={cn(
        "relative w-full rounded-lg border p-4",
        alertVariants[variant],
        className
      )}
      {...props}
    />
  );
}

export function AlertDescription({ className, ...props }) {
  return (
    <div
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  );
}