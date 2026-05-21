import type { AuthUser } from "@/lib/auth-context";

/** ID de catálogo (mock) asociado al usuario modelo demo */
export function getModelCatalogId(user: AuthUser | null): string {
  if (!user || user.role !== "model") return "";
  if (user.email === "model@marturbs.live") return "1";
  return user.id;
}
