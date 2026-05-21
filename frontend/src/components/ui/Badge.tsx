import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "pink" | "purple" | "gold" | "online" | "default";
  className?: string;
}

const variantStyles = {
  pink: "bg-neon-pink/20 text-neon-pink border-neon-pink/30",
  purple: "bg-neon-purple/20 text-neon-purple border-neon-purple/30",
  gold: "bg-gold/20 text-gold border-gold/30",
  online: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  default: "bg-white/5 text-soft-white/70 border-white/10",
};

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
