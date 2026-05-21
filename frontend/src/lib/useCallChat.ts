"use client";

import { useCallback, useEffect, useState } from "react";
import { getSocket, joinCallRoom, sendChatMessage } from "@/lib/socket";

export type ChatSender = "user" | "model";

export interface CallChatMessage {
  id: string;
  sender: ChatSender;
  text: string;
  time: string;
}

function formatChatTime(isoOrLabel: string): string {
  const d = new Date(isoOrLabel);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return isoOrLabel;
}

export function useCallChat(
  roomId: string,
  userId: string,
  enabled: boolean,
) {
  const [messages, setMessages] = useState<CallChatMessage[]>([]);

  useEffect(() => {
    if (!enabled || !roomId || !userId) return;

    joinCallRoom(roomId, userId);
    const socket = getSocket();

    const onChat = (payload: {
      sender: string;
      text: string;
      time: string;
    }) => {
      const sender: ChatSender = payload.sender === "model" ? "model" : "user";
      setMessages((prev) => [
        ...prev,
        {
          id: `${payload.time}-${prev.length}-${payload.sender}`,
          sender,
          text: payload.text,
          time: formatChatTime(payload.time),
        },
      ]);
    };

    socket.on("chatMessage", onChat);
    return () => {
      socket.off("chatMessage", onChat);
    };
  }, [roomId, userId, enabled]);

  const sendMessage = useCallback(
    (text: string, asSender: ChatSender) => {
      const trimmed = text.trim();
      if (!trimmed || !roomId) return;

      const time = formatChatTime(new Date().toISOString());
      setMessages((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          sender: asSender,
          text: trimmed,
          time,
        },
      ]);
      sendChatMessage(roomId, asSender, trimmed);
    },
    [roomId],
  );

  const addMessage = useCallback((msg: CallChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  return { messages, sendMessage, addMessage };
}
