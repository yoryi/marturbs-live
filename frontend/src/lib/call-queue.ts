"use client";

import { getSocket, joinCallRoom, leaveCallRoom } from "@/lib/socket";

export interface CallRequestPayload {
  requestId: string;
  modelId: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  roomId: string;
  createdAt: number;
}

export function joinModelQueue(modelId: string, userId: string) {
  const socket = getSocket();
  socket.emit("joinModelQueue", { modelId, userId });
}

export function leaveModelQueue(modelId: string) {
  getSocket().emit("leaveModelQueue", { modelId });
}

export function requestCall(data: {
  modelId: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
}) {
  const socket = getSocket();
  const roomId = `call-${data.modelId}-${data.clientId}`;
  joinCallRoom(roomId, data.clientId);
  socket.emit("requestCall", { ...data, roomId });
  return roomId;
}

export function cancelCallRequest(requestId: string, roomId: string) {
  getSocket().emit("cancelCallRequest", { requestId, roomId });
  leaveCallRoom(roomId);
}

export function acceptCallRequest(requestId: string) {
  getSocket().emit("acceptCallRequest", { requestId });
}

export function rejectCallRequest(requestId: string) {
  getSocket().emit("rejectCallRequest", { requestId });
}

export function subscribeCallQueue(
  handlers: {
    onQueued?: (data: {
      requestId: string;
      roomId: string;
      position: number;
    }) => void;
    onAccepted?: (data: CallRequestPayload) => void;
    onRejected?: (data: { requestId: string; reason?: string }) => void;
    onIncoming?: (data: CallRequestPayload) => void;
    onCancelled?: (data: { requestId: string }) => void;
    onSnapshot?: (data: { requests: CallRequestPayload[] }) => void;
  },
) {
  const socket = getSocket();
  if (handlers.onQueued) socket.on("callQueued", handlers.onQueued);
  if (handlers.onAccepted) socket.on("callAccepted", handlers.onAccepted);
  if (handlers.onRejected) socket.on("callRejected", handlers.onRejected);
  if (handlers.onIncoming) socket.on("callRequestIncoming", handlers.onIncoming);
  if (handlers.onCancelled) socket.on("callRequestCancelled", handlers.onCancelled);
  if (handlers.onSnapshot) socket.on("callRequestsSnapshot", handlers.onSnapshot);

  return () => {
    if (handlers.onQueued) socket.off("callQueued", handlers.onQueued);
    if (handlers.onAccepted) socket.off("callAccepted", handlers.onAccepted);
    if (handlers.onRejected) socket.off("callRejected", handlers.onRejected);
    if (handlers.onIncoming) socket.off("callRequestIncoming", handlers.onIncoming);
    if (handlers.onCancelled) socket.off("callRequestCancelled", handlers.onCancelled);
    if (handlers.onSnapshot) socket.off("callRequestsSnapshot", handlers.onSnapshot);
  };
}
