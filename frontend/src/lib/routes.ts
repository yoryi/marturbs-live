import type { UserRole } from "@/data/mock";

/** Ruta principal según rol tras login */
export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case "model":
      return "/model/dashboard";
    case "admin":
      return "/admin";
    default:
      return "/";
  }
}

/** Páginas solo para clientes (catálogo / compras) */
export const CLIENT_ONLY_PATHS = ["/", "/models", "/credits"];
