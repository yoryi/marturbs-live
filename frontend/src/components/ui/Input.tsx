"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="space-y-2 w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-soft-white/70"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          "w-full px-4 py-3 rounded-xl glass text-soft-white placeholder:text-soft-white/30",
          "border border-white/5 focus:border-neon-pink/50 focus:outline-none focus:ring-2 focus:ring-neon-pink/20",
          "transition-all duration-300",
          error && "border-red-500/50",
          className,
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  ),
);

Input.displayName = "Input";
