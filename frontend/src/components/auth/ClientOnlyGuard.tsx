"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getDashboardPath } from "@/lib/routes";

interface ClientOnlyGuardProps {
  children: React.ReactNode;
}

/** Redirige modelo y admin a su panel; solo clientes (y invitados) ven el contenido */
export function ClientOnlyGuard({ children }: ClientOnlyGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const mustRedirect =
    !isLoading && (user?.role === "model" || user?.role === "admin");

  useEffect(() => {
    if (mustRedirect && user) {
      router.replace(getDashboardPath(user.role));
    }
  }, [mustRedirect, user, router]);

  if (isLoading || mustRedirect) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-neon-pink border-t-transparent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
