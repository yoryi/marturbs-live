"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "gold" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: Variant;
  size?: Size;
  glow?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-neon-pink to-neon-purple text-white font-semibold glow-pink",
  secondary:
    "glass text-soft-white border border-white/10 hover:border-neon-pink/50",
  ghost: "bg-transparent text-soft-white/80 hover:text-neon-pink",
  gold: "bg-gradient-to-r from-gold/90 to-amber-500 text-bg-main font-bold glow-gold",
  danger:
    "bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm rounded-lg",
  md: "px-6 py-3 text-base rounded-xl",
  lg: "px-8 py-4 text-lg rounded-2xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      glow = true,
      children,
      ...props
    },
    ref,
  ) => (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        glow && variant === "primary" && "hover:shadow-[0_0_30px_#ff2d8e60]",
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  ),
);

Button.displayName = "Button";
