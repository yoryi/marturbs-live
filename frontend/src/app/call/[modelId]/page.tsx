"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MOCK_MODELS } from "@/data/mock";
import { VideoCallRoom } from "@/components/call/VideoCallRoom";
import { CallWaitingScreen } from "@/components/call/CallWaitingScreen";
import { CallRejectedDialog } from "@/components/call/CallRejectedDialog";
import { InsufficientCreditsDialog } from "@/components/call/InsufficientCreditsDialog";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/Button";
import {
  cancelCallRequest,
  requestCall,
  subscribeCallQueue,
} from "@/lib/call-queue";
import { getSocket, joinCallRoom, leaveCallRoom } from "@/lib/socket";

type CallPhase = "waiting" | "active" | "rejected";

export default function CallPage({
  params,
}: {
  params: Promise<{ modelId: string }>;
}) {
  const { modelId } = use(params);
  const { t } = useI18n();
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const model = MOCK_MODELS.find((m) => m.id === modelId);

  const [phase, setPhase] = useState<CallPhase>("waiting");
  const [requestId, setRequestId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [queuePosition, setQueuePosition] = useState(1);
  const [rejectReason, setRejectReason] = useState<string | null>(null);
  const [showRejectedAlert, setShowRejectedAlert] = useState(false);
  const [showNoCreditsAlert, setShowNoCreditsAlert] = useState(false);
  const callRequestedRef = useRef(false);
  const roomIdRef = useRef("");

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/login?next=/call/${modelId}`);
    }
  }, [isLoading, user, router, modelId]);

  const handleRejected = useCallback((data: { requestId: string; reason?: string }) => {
    if (data.reason === "cancelled") return;
    setRejectReason(data.reason ?? "rejected");
    setShowRejectedAlert(true);
    setPhase("rejected");
    if (roomIdRef.current) leaveCallRoom(roomIdRef.current);
  }, []);

  const handleAccepted = useCallback(() => {
    setShowRejectedAlert(false);
    setPhase("active");
  }, []);

  useEffect(() => {
    if (!user?.id || !model?.id) return;

    const socket = getSocket();
    const onRejected = (data: { requestId: string; reason?: string }) =>
      handleRejected(data);
    const onAccepted = () => handleAccepted();

    socket.on("callRejected", onRejected);
    socket.on("callAccepted", onAccepted);

    return () => {
      socket.off("callRejected", onRejected);
      socket.off("callAccepted", onAccepted);
    };
  }, [user?.id, model?.id, handleRejected, handleAccepted]);

  useEffect(() => {
    if (!user || !model || callRequestedRef.current) return;

    if ((user.credits ?? 0) <= 0) {
      setShowNoCreditsAlert(true);
      setPhase("rejected");
      return;
    }

    callRequestedRef.current = true;
    const room = requestCall({
      modelId: model.id,
      clientId: user.id,
      clientName: user.name,
      clientAvatar: user.avatar,
    });
    roomIdRef.current = room;
    setRoomId(room);
    setPhase("waiting");

    return subscribeCallQueue({
      onQueued: (data) => {
        setRequestId(data.requestId);
        setRoomId(data.roomId);
        roomIdRef.current = data.roomId;
        setQueuePosition(data.position);
        joinCallRoom(data.roomId, user.id);
      },
    });
  }, [user, model]);

  const handleCancel = useCallback(() => {
    if (requestId && roomIdRef.current) {
      cancelCallRequest(requestId, roomIdRef.current);
    } else if (roomIdRef.current) {
      leaveCallRoom(roomIdRef.current);
    }
    router.replace("/");
  }, [requestId, router]);

  const handleRejectedClose = useCallback(() => {
    setShowRejectedAlert(false);
    router.replace("/");
  }, [router]);

  if (!isLoading && !user) {
    return (
      <div className="text-center py-20 text-soft-white/50">{t("common.loading")}</div>
    );
  }

  if (!model) {
    return (
      <div className="text-center py-20">
        <p>{t("call.notFound")}</p>
        <Link href="/">
          <Button className="mt-4">{t("call.back")}</Button>
        </Link>
      </div>
    );
  }

  if (phase === "active") {
    return <VideoCallRoom model={model} />;
  }

  if (showRejectedAlert || phase === "rejected") {
    return (
      <CallRejectedDialog
        open
        modelName={model.name}
        reason={rejectReason}
        onClose={handleRejectedClose}
      />
    );
  }

  return (
    <>
      <CallWaitingScreen
        model={model}
        position={queuePosition}
        onCancel={handleCancel}
      />

      <InsufficientCreditsDialog
        open={showNoCreditsAlert}
        onClose={() => router.replace("/")}
        credits={user?.credits ?? 0}
        modelName={model.name}
      />
    </>
  );
}
