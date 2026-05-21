"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MediaConnection } from "peerjs";
import { buildPeerId } from "./buildPeerId";
import { getPeerOptions } from "./config";
import { getLocalMediaStream } from "@/lib/media";
import { getSocket, joinCallRoom } from "@/lib/socket";

export type PeerCallStatus =
  | "idle"
  | "connecting"
  | "waiting"
  | "connected"
  | "error";

interface UsePeerCallOptions {
  roomId: string;
  userId: string;
  role: "client" | "model";
  enabled?: boolean;
}

export function usePeerCall({
  roomId,
  userId,
  role,
  enabled = true,
}: UsePeerCallOptions) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerId, setPeerId] = useState<string | null>(null);
  const [status, setStatus] = useState<PeerCallStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const peerRef = useRef<import("peerjs").default | null>(null);
  const activeCallRef = useRef<MediaConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remotePeerIdRef = useRef<string | null>(null);
  const calledRef = useRef(false);

  const attachRemoteStream = useCallback((stream: MediaStream) => {
    setRemoteStream(stream);
    setStatus("connected");
  }, []);

  const placeCall = useCallback(
    (targetPeerId: string) => {
      const peer = peerRef.current;
      const stream = localStreamRef.current;
      if (!peer || !stream || calledRef.current) return;

      calledRef.current = true;
      try {
        const call = peer.call(targetPeerId, stream);
        activeCallRef.current = call;

        call.on("stream", attachRemoteStream);
        call.on("close", () => {
          setRemoteStream(null);
          setStatus("waiting");
          calledRef.current = false;
        });
        call.on("error", () => {
          setError("Call failed");
          calledRef.current = false;
        });
      } catch {
        calledRef.current = false;
      }
    },
    [attachRemoteStream],
  );

  const destroy = useCallback(() => {
    activeCallRef.current?.close();
    activeCallRef.current = null;
    peerRef.current?.destroy();
    peerRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    calledRef.current = false;
    remotePeerIdRef.current = null;
  }, []);

  useEffect(() => {
    if (!enabled || !roomId || !userId) return;

    let cancelled = false;
    const socket = getSocket();
    const customPeerId = buildPeerId(role, userId, roomId);

    const setup = async () => {
      setStatus("connecting");
      setError(null);

      try {
        const stream = await getLocalMediaStream();
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        localStreamRef.current = stream;
        setLocalStream(stream);

        const { default: Peer } = await import("peerjs");
        const peer = new Peer(customPeerId, getPeerOptions(customPeerId));
        peerRef.current = peer;

        peer.on("open", (id) => {
          if (cancelled) return;
          setPeerId(id);
          socket.emit("peerReady", { roomId, peerId: id, role, userId });
          setStatus("waiting");
          if (role === "client" && remotePeerIdRef.current) {
            placeCall(remotePeerIdRef.current);
          }
        });

        peer.on("call", (call) => {
          const local = localStreamRef.current;
          if (!local) return;
          activeCallRef.current = call;
          call.answer(local);
          call.on("stream", attachRemoteStream);
          call.on("close", () => {
            setRemoteStream(null);
            setStatus("waiting");
          });
        });

        peer.on("error", (err) => {
          console.error("[PeerJS]", err);
          setError(err.message);
          setStatus("error");
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Media error");
        setStatus("error");
      }
    };

    const tryConnectToRemote = (remotePeerId: string, remoteRole: string) => {
      if (remoteRole === role) return;
      remotePeerIdRef.current = remotePeerId;
      if (role === "client" && peerRef.current?.id) {
        placeCall(remotePeerId);
      }
    };

    const onPeerReady = (data: {
      roomId: string;
      peerId: string;
      role: string;
      userId: string;
    }) => {
      if (data.roomId !== roomId || data.userId === userId) return;
      tryConnectToRemote(data.peerId, data.role);
    };

    const onPeersInRoom = (data: {
      roomId: string;
      peers: { peerId: string; role: string; userId: string }[];
    }) => {
      if (data.roomId !== roomId) return;
      for (const p of data.peers) {
        if (p.userId === userId || p.role === role) continue;
        tryConnectToRemote(p.peerId, p.role);
        break;
      }
    };

    socket.on("peerReady", onPeerReady);
    socket.on("peersInRoom", onPeersInRoom);
    joinCallRoom(roomId, userId);

    setup();

    return () => {
      cancelled = true;
      socket.off("peerReady", onPeerReady);
      socket.off("peersInRoom", onPeersInRoom);
      destroy();
      setStatus("idle");
    };
  }, [
    enabled,
    roomId,
    userId,
    role,
    destroy,
    placeCall,
    attachRemoteStream,
  ]);

  const toggleAudio = useCallback((muted: boolean) => {
    localStreamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = !muted;
    });
  }, []);

  const toggleVideo = useCallback((off: boolean) => {
    localStreamRef.current?.getVideoTracks().forEach((t) => {
      t.enabled = !off;
    });
  }, []);

  return {
    localStream,
    remoteStream,
    peerId,
    status,
    error,
    toggleAudio,
    toggleVideo,
    hangUp: destroy,
  };
}
