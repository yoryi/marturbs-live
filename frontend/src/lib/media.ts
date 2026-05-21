/** Contexto seguro: localhost o HTTPS (requerido para cámara/micrófono) */
export function isSecureMediaContext(): boolean {
  if (typeof window === "undefined") return false;
  if (window.isSecureContext) return true;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
}

export function getMediaDevicesError(): string | null {
  if (typeof navigator === "undefined") return "Navigator no disponible";
  if (!navigator.mediaDevices?.getUserMedia) {
    if (!isSecureMediaContext()) {
      return "insecure_context";
    }
    return "media_devices_unavailable";
  }
  return null;
}

/** Misma ruta pero forzando localhost (cámara en Mac) */
export function getLocalhostCallUrl(): string {
  if (typeof window === "undefined") return "http://localhost:3000";
  const { port, pathname, search } = window.location;
  return `http://localhost${port ? `:${port}` : ""}${pathname}${search}`;
}

export function getPageHostname(): string {
  if (typeof window === "undefined") return "";
  return window.location.host;
}

export function resolveMediaErrorMessage(
  error: string,
  t: (
    key: "call.insecureContext" | "call.mediaUnavailable",
    params?: Record<string, string | number>,
  ) => string,
): string {
  if (error === "insecure_context") {
    return t("call.insecureContext", { host: getPageHostname() });
  }
  if (error === "media_devices_unavailable") return t("call.mediaUnavailable");
  return error;
}

export async function getLocalMediaStream(): Promise<MediaStream> {
  const precheck = getMediaDevicesError();
  if (precheck === "insecure_context") {
    throw new Error("insecure_context");
  }
  if (precheck) {
    throw new Error(precheck);
  }
  return navigator.mediaDevices.getUserMedia({ video: true, audio: true });
}
