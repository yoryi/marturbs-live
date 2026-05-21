"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageCircle,
  Volume2,
  Settings,
  Coins,
  Clock,
  Zap,
  Wifi,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { Model } from "@/data/mock";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import {
  getLocalhostCallUrl,
  resolveMediaErrorMessage,
} from "@/lib/media";
import { CallChatPanel } from "@/components/call/CallChatPanel";
import { usePeerCall } from "@/lib/peer/usePeerCall";
import {
  emitSessionEnded,
  leaveCallRoom,
  subscribeSessionEnded,
} from "@/lib/socket";
import { Button } from "@/components/ui/Button";
import { useCallChat } from "@/lib/useCallChat";
import { cn, formatCredits, formatDuration } from "@/lib/utils";

interface VideoCallRoomProps {
  model: Model;
}

export function VideoCallRoom({ model }: VideoCallRoomProps) {
  const router = useRouter();
  const { user, updateCredits } = useAuth();
  const { t } = useI18n();
  const [seconds, setSeconds] = useState(0);
  const [credits, setCredits] = useState(() => user?.credits ?? 0);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [ending, setEnding] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endingRef = useRef(false);
  const joinedAtRef = useRef(0);

  const canStartCall = (user?.credits ?? 0) > 0;

  const roomId = useMemo(
    () => (user?.id ? `call-${model.id}-${user.id}` : ""),
    [model.id, user?.id],
  );

  const {
    localStream,
    remoteStream,
    peerId,
    status: peerStatus,
    error: peerError,
    toggleAudio,
    toggleVideo,
    hangUp,
  } = usePeerCall({
    roomId,
    userId: user?.id ?? "",
    role: "client",
    enabled: !ending && !!user?.id && !!roomId && canStartCall,
  });

  const { messages, sendMessage, addMessage } = useCallChat(
    roomId,
    user?.id ?? "",
    !ending && !!roomId && canStartCall,
  );

  useEffect(() => {
    if (user?.credits != null) setCredits(user.credits);
  }, [user?.id, user?.credits]);

  useEffect(() => {
    joinedAtRef.current = Date.now();
    endingRef.current = false;
    setEnding(false);
  }, [roomId]);

  const welcomeAddedRef = useRef(false);
  useEffect(() => {
    if (!roomId || welcomeAddedRef.current) return;
    welcomeAddedRef.current = true;
    addMessage({
      id: "welcome",
      sender: "model",
      text: t("call.chatWelcome"),
      time: "00:00",
    });
  }, [roomId, t, addMessage]);

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

  const leaveCall = useCallback(
    (notifyRoom: boolean) => {
      if (endingRef.current) return;
      endingRef.current = true;
      setEnding(true);
      if (roomId) leaveCallRoom(roomId);
      if (notifyRoom && roomId) emitSessionEnded(roomId);
      hangUp();
      if (intervalRef.current) clearInterval(intervalRef.current);
      router.replace("/");
    },
    [router, roomId, hangUp],
  );

  const handleEndCall = useCallback(() => leaveCall(true), [leaveCall]);

  useEffect(() => {
    if (!roomId || ending || !canStartCall) return;
    return subscribeSessionEnded((data) => {
      if (data.roomId !== roomId) return;
      if (Date.now() - joinedAtRef.current < 3000) return;
      leaveCall(false);
    });
  }, [roomId, ending, leaveCall, canStartCall]);

  useEffect(() => {
    if (ending || !roomId || !canStartCall) return;
    intervalRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
      setCredits((c) => {
        if (c <= 0) return 0;
        const next = Math.max(0, c - model.pricePerMinute / 60);
        if (next <= 0) leaveCall(true);
        return next;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [model.pricePerMinute, leaveCall, ending, roomId, canStartCall]);

  useEffect(() => {
    if (!ending && canStartCall) {
      updateCredits(Math.floor(credits));
    }
  }, [credits, updateCredits, ending, canStartCall]);

  const spent = (user?.credits ?? 0) - credits;
  const isConnected = peerStatus === "connected" && !!remoteStream;

  if (!canStartCall) {
    return (
      <div className="fixed inset-0 z-50 bg-bg-main flex flex-col items-center justify-center px-6 text-center">
        <p className="text-lg text-soft-white mb-2">{t("call.insufficientCredits")}</p>
        <p className="text-sm text-soft-white/50 mb-8">
          {formatCredits(user?.credits ?? 0)} {t("call.remaining").replace(":", "")}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/credits">
            <Button>{t("call.rechargeToCall")}</Button>
          </Link>
          <Link href="/">
            <Button variant="secondary">{t("call.backToHome")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    sendMessage(chatInput, "user");
    setChatInput("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="relative flex-1 overflow-hidden flex">
        <div className="relative flex-1 min-w-0">
          {/* Remoto (modelo) — PeerJS */}
          {isConnected ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center scale-105"
                style={{ backgroundImage: `url(${model.cover})` }}
              />
              <div className="absolute inset-0 bg-black/50" />
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6 text-center">
                <div className="w-16 h-16 rounded-full border-2 border-neon-pink/50 flex items-center justify-center mb-4 animate-pulse">
                  <Wifi className="w-8 h-8 text-neon-pink" />
                </div>
                <p className="text-lg font-semibold text-soft-white">
                  {t("call.waiting", { name: model.name })}
                </p>
                <p className="text-sm text-soft-white/50 mt-2 max-w-sm">
                  {t("call.connectingVideo")}
                </p>
              </div>
            </>
          )}

          <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
                <Clock className="w-4 h-4 text-soft-white/80" />
                <span className="font-mono font-bold text-soft-white text-lg">
                  {formatDuration(seconds)}
                </span>
                <span className="text-neon-pink text-sm font-medium">
                  {t("call.creditsRate", { n: model.pricePerMinute })}
                </span>
              </div>
              {isConnected && (
                <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/30">
                  {t("call.connected")}
                </span>
              )}
            </div>

            <button
              onClick={handleEndCall}
              className="px-5 py-2.5 rounded-full bg-neon-pink font-semibold text-white shadow-[0_0_24px_#ff2d8e80] hover:brightness-110 transition-all flex items-center gap-2"
            >
              <PhoneOff className="w-4 h-4" />
              {t("call.endCall")}
            </button>
          </div>

          {peerError && (
            <div className="absolute top-20 left-4 right-4 z-20 px-4 py-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-sm text-center max-w-md mx-auto space-y-2">
              <p>
                {peerError === "insecure_context" || peerError === "media_devices_unavailable"
                  ? resolveMediaErrorMessage(peerError, t)
                  : `${t("call.peerError")}: ${peerError}`}
              </p>
              {peerError === "insecure_context" && (
                <a
                  href={getLocalhostCallUrl()}
                  className="inline-block px-4 py-2 rounded-full bg-neon-pink text-white font-semibold text-xs hover:brightness-110"
                >
                  {t("call.openLocalhost")}
                </a>
              )}
            </div>
          )}

          {/* Local PiP */}
          <div className="absolute bottom-28 right-4 w-32 h-44 sm:w-40 sm:h-52 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-20 bg-bg-card">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className={cn("w-full h-full object-cover", videoOff && "opacity-20")}
              style={{ transform: "scaleX(-1)" }}
            />
            {videoOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <VideoOff className="w-8 h-8 text-white/50" />
              </div>
            )}
          </div>

          <div
            className={cn(
              "absolute bottom-24 z-20",
              chatOpen ? "left-4" : "left-1/2 -translate-x-1/2",
            )}
          >
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10">
              {[
                {
                  on: !muted,
                  toggle: () => setMuted(!muted),
                  onIcon: Mic,
                  offIcon: MicOff,
                },
                {
                  on: !videoOff,
                  toggle: () => setVideoOff(!videoOff),
                  onIcon: Video,
                  offIcon: VideoOff,
                },
              ].map((ctrl, i) => (
                <button
                  key={i}
                  onClick={ctrl.toggle}
                  className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center transition-colors",
                    ctrl.on
                      ? "bg-white/10 text-white hover:bg-white/20"
                      : "bg-red-500/30 text-red-300",
                  )}
                >
                  {ctrl.on ? (
                    <ctrl.onIcon className="w-5 h-5" />
                  ) : (
                    <ctrl.offIcon className="w-5 h-5" />
                  )}
                </button>
              ))}
              <button className="w-11 h-11 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center">
                <Volume2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setChatOpen((o) => !o)}
                className={cn(
                  "w-11 h-11 rounded-full flex items-center justify-center transition-colors",
                  chatOpen
                    ? "bg-neon-pink/30 text-neon-pink"
                    : "bg-white/10 text-white hover:bg-white/20",
                )}
                aria-label={t("call.chatTitle")}
              >
                <MessageCircle className="w-5 h-5" />
              </button>
              <button className="w-11 h-11 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="h-full shrink-0"
            >
              <CallChatPanel
                messages={messages}
                chatInput={chatInput}
                onChatInputChange={setChatInput}
                onSend={handleSendChat}
                perspective="client"
                onClose={() => setChatOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative z-20 flex items-center justify-between px-4 sm:px-6 py-3 bg-bg-main/95 border-t border-white/5">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-gold" />
          <span className="text-soft-white/60 text-sm">{t("call.remaining")}</span>
          <span className="font-bold text-gold text-lg">
            {formatCredits(Math.floor(credits))}
          </span>
          <span className="text-xs text-soft-white/40 hidden sm:inline">
            {t("call.sessionSpent", { n: Math.floor(spent) })}
          </span>
        </div>
        <Link
          href="/credits"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-neon-pink/20 text-neon-pink text-sm font-semibold hover:bg-neon-pink/30 transition-colors"
        >
          <Zap className="w-4 h-4" />
          {t("nav.recharge")}
        </Link>
      </div>

      <AnimatePresence>
        {ending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center gap-6 z-50 px-6"
          >
            <p className="text-2xl font-bold text-neon-pink">{t("call.ended")}</p>
            <Link href="/">
              <Button onClick={() => router.replace("/")}>
                {t("call.backToHome")}
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
