"use client";

import { Suspense, useRef, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Wifi,
  MessageCircle,
} from "lucide-react";
import { CallChatPanel } from "@/components/call/CallChatPanel";
import { useCallChat } from "@/lib/useCallChat";
import {
  emitSessionEnded,
  joinCallRoom,
  leaveCallRoom,
  subscribeSessionEnded,
} from "@/lib/socket";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import {
  getLocalhostCallUrl,
  resolveMediaErrorMessage,
} from "@/lib/media";
import { usePeerCall } from "@/lib/peer/usePeerCall";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn, formatDuration } from "@/lib/utils";

function ModelCallContent() {
  const { user } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomFromQuery = searchParams.get("room");

  const [roomInput, setRoomInput] = useState(roomFromQuery ?? "");
  const [activeRoom, setActiveRoom] = useState(roomFromQuery ?? "");
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState("");

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const endingRef = useRef(false);
  const joinedAtRef = useRef(0);

  const roomId = activeRoom.trim();

  const {
    localStream,
    remoteStream,
    status,
    error,
    toggleAudio,
    toggleVideo,
    hangUp,
  } = usePeerCall({
    roomId,
    userId: user?.id ?? "model",
    role: "model",
    enabled: !!user && user.role === "model" && !!roomId,
  });

  useEffect(() => {
    if (roomFromQuery) setActiveRoom(roomFromQuery);
  }, [roomFromQuery]);

  useEffect(() => {
    if (roomId) {
      joinedAtRef.current = Date.now();
      endingRef.current = false;
    }
  }, [roomId]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    toggleAudio(muted);
  }, [muted, toggleAudio]);

  useEffect(() => {
    toggleVideo(videoOff);
  }, [videoOff, toggleVideo]);

  useEffect(() => {
    if (status !== "connected") return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  const isConnected = status === "connected" && !!remoteStream;

  const chatEnabled = !!user && user.role === "model" && !!roomId;
  const { messages, sendMessage } = useCallChat(
    roomId,
    user?.id ?? "model",
    chatEnabled,
  );

  useEffect(() => {
    if (!chatEnabled || !roomId || !user?.id) return;
    joinCallRoom(roomId, user.id);
  }, [chatEnabled, roomId, user?.id]);

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    sendMessage(chatInput, "model");
    setChatInput("");
  };

  const leaveCall = useCallback(
    (notifyRoom: boolean) => {
      if (endingRef.current) return;
      endingRef.current = true;
      if (roomId) leaveCallRoom(roomId);
      if (notifyRoom && roomId) emitSessionEnded(roomId);
      hangUp();
      router.replace("/model/dashboard");
    },
    [roomId, hangUp, router],
  );

  useEffect(() => {
    if (!roomId) return;
    return subscribeSessionEnded((data) => {
      if (data.roomId !== roomId) return;
      if (Date.now() - joinedAtRef.current < 3000) return;
      leaveCall(false);
    });
  }, [roomId, leaveCall]);

  if (!user || user.role !== "model") {
    return (
      <div className="text-center py-20">
        <p className="text-soft-white/50 mb-4">{t("modelPanel.clientsOnly")}</p>
        <Link href="/login">
          <Button>{t("auth.signIn")}</Button>
        </Link>
      </div>
    );
  }

  if (!roomId) {
    return (
      <div className="max-w-md mx-auto py-20 px-4">
        <h1 className="text-2xl font-bold mb-2">{t("call.modelCallTitle")}</h1>
        <p className="text-soft-white/50 text-sm mb-6">{t("call.modelCallSubtitle")}</p>
        <Input
          placeholder={t("modelPanel.roomPlaceholder")}
          value={roomInput}
          onChange={(e) => setRoomInput(e.target.value)}
        />
        <Button
          className="w-full mt-4"
          onClick={() => setActiveRoom(roomInput.trim())}
          disabled={!roomInput.trim()}
        >
          {t("modelPanel.joinCall")}
        </Button>
        <Link href="/model/dashboard" className="block text-center text-sm text-soft-white/40 mt-6">
          {t("call.back")}
        </Link>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="relative flex-1 flex overflow-hidden">
        <div className="relative flex-1 min-w-0">
        {isConnected ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-main px-6 text-center">
            <Wifi className="w-12 h-12 text-neon-purple mb-4 animate-pulse" />
            <p className="text-lg font-semibold">{t("call.modelCallTitle")}</p>
            <p className="text-soft-white/50 text-sm mt-2">{t("call.waitingHint")}</p>
            <p className="text-xs text-soft-white/30 mt-4 font-mono">
              {t("call.roomCode")}: {roomId}
            </p>
          </div>
        )}

        <div className="absolute top-4 left-4 right-4 flex justify-between z-20">
          <span className="px-4 py-2 rounded-full glass font-mono text-sm">
            {formatDuration(seconds)}
          </span>
          <button
            type="button"
            onClick={() => leaveCall(true)}
            className="px-5 py-2.5 rounded-full bg-neon-pink text-white flex items-center gap-2"
          >
            <PhoneOff className="w-4 h-4" />
            {t("call.endCall")}
          </button>
        </div>

        <div className="absolute bottom-8 right-8 w-40 h-52 rounded-2xl overflow-hidden border-2 border-neon-pink/30 z-20">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className={cn("w-full h-full object-cover", videoOff && "opacity-30")}
            style={{ transform: "scaleX(-1)" }}
          />
        </div>

        <div
          className={cn(
            "absolute bottom-8 z-20 flex gap-3",
            chatOpen ? "left-8" : "left-1/2 -translate-x-1/2",
          )}
        >
          <button
            type="button"
            onClick={() => setMuted(!muted)}
            className="w-12 h-12 rounded-full glass flex items-center justify-center"
          >
            {muted ? <MicOff /> : <Mic />}
          </button>
          <button
            type="button"
            onClick={() => setVideoOff(!videoOff)}
            className="w-12 h-12 rounded-full glass flex items-center justify-center"
          >
            {videoOff ? <VideoOff /> : <Video />}
          </button>
          <button
            type="button"
            onClick={() => setChatOpen((o) => !o)}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              chatOpen
                ? "bg-neon-pink/30 text-neon-pink"
                : "glass text-white",
            )}
            aria-label={t("call.chatFromClient")}
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="absolute top-20 left-4 right-4 text-center text-red-400 text-sm z-20 px-4 space-y-2">
            <p>
              {error === "insecure_context" || error === "media_devices_unavailable"
                ? resolveMediaErrorMessage(error, t)
                : error}
            </p>
            {error === "insecure_context" && (
              <a
                href={getLocalhostCallUrl()}
                className="inline-block px-4 py-2 rounded-full bg-neon-pink text-white font-semibold text-xs"
              >
                {t("call.openLocalhost")}
              </a>
            )}
          </div>
        )}
        </div>

        {chatOpen && (
          <CallChatPanel
            messages={messages}
            chatInput={chatInput}
            onChatInputChange={setChatInput}
            onSend={handleSendChat}
            perspective="model"
            onClose={() => setChatOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

export default function ModelCallPage() {
  const { t } = useI18n();
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-soft-white/50">{t("common.loading")}</div>
      }
    >
      <ModelCallContent />
    </Suspense>
  );
}
