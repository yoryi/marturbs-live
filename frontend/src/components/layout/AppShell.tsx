"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCallPage = pathname?.startsWith("/call/");

  return (
    <>
      {!isCallPage && <Header />}
      <main className="flex-1">{children}</main>
    </>
  );
}
