"use client";

import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
      autoConnect: true,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

export function joinCallRoom(roomId: string, userId: string) {
  const s = getSocket();
  s.emit("joinRoom", { roomId, userId });
}

export function leaveCallRoom(roomId: string) {
  const s = getSocket();
  s.emit("leaveRoom", { roomId });
}

export function sendChatMessage(roomId: string, sender: string, text: string) {
  getSocket().emit("chatMessage", { roomId, sender, text });
}

export function emitCreditTick(
  roomId: string,
  credits: number,
  duration: number,
) {
  getSocket().emit("creditTick", { roomId, credits, duration });
}

export function emitSessionEnded(roomId: string) {
  getSocket().emit("sessionEnded", { roomId });
}

export function subscribeSessionEnded(
  handler: (data: { roomId: string }) => void,
): () => void {
  const socket = getSocket();
  socket.on("sessionEnded", handler);
  return () => {
    socket.off("sessionEnded", handler);
  };
}
