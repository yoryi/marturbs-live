import type { PeerOptions } from "peerjs";

/** Opciones del servidor de señalización PeerJS (self-hosted o cloud) */
export function getPeerOptions(_peerId?: string): PeerOptions {
  const host = process.env.NEXT_PUBLIC_PEER_HOST;
  const port = process.env.NEXT_PUBLIC_PEER_PORT;
  const path = process.env.NEXT_PUBLIC_PEER_PATH || "/marturbs";
  const secure = process.env.NEXT_PUBLIC_PEER_SECURE === "true";

  if (!host) {
    // Cloud PeerJS (desarrollo rápido)
    return { debug: 2 };
  }

  return {
    host,
    port: port ? Number(port) : secure ? 443 : 9000,
    path,
    secure,
    config: {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:global.stun.twilio.com:3478" },
      ],
    },
    debug: 1,
  };
}
