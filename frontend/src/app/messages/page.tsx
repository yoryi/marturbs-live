"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Mensajes solo en el chat lateral de la videollamada — redirige al inicio */
export default function MessagesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return null;
}
