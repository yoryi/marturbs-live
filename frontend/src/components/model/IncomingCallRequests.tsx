"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, PhoneOff, Video } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import {
  acceptCallRequest,
  rejectCallRequest,
  subscribeCallQueue,
  type CallRequestPayload,
  joinModelQueue,
  leaveModelQueue,
} from "@/lib/call-queue";
import { getModelCatalogId } from "@/lib/model-profile";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface IncomingCallRequestsProps {
  isOnline: boolean;
}

export function IncomingCallRequests({ isOnline }: IncomingCallRequestsProps) {
  const { user } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const modelId = getModelCatalogId(user);
  const [requests, setRequests] = useState<CallRequestPayload[]>([]);

  useEffect(() => {
    if (!modelId || !user?.id || !isOnline) {
      setRequests([]);
      return;
    }

    joinModelQueue(modelId, user.id);

    return subscribeCallQueue({
      onSnapshot: ({ requests: list }) => setRequests(list),
      onIncoming: (req) => {
        setRequests((prev) => {
          if (prev.some((r) => r.requestId === req.requestId)) return prev;
          return [...prev, req];
        });
      },
      onCancelled: ({ requestId }) => {
        setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
      },
    });
  }, [modelId, user?.id, isOnline]);

  useEffect(() => {
    if (!isOnline && modelId) leaveModelQueue(modelId);
  }, [isOnline, modelId]);

  const handleAccept = useCallback(
    (req: CallRequestPayload) => {
      acceptCallRequest(req.requestId);
      setRequests((prev) => prev.filter((r) => r.requestId !== req.requestId));
      router.push(`/model/call?room=${encodeURIComponent(req.roomId)}`);
    },
    [router],
  );

  const handleReject = useCallback((req: CallRequestPayload) => {
    rejectCallRequest(req.requestId);
    setRequests((prev) => prev.filter((r) => r.requestId !== req.requestId));
  }, []);

  if (!isOnline) {
    return (
      <div className="glass rounded-2xl p-8 border border-white/5 text-center">
        <p className="text-soft-white/50">{t("modelPanel.goOnlineForRequests")}</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 border border-white/5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg">{t("modelPanel.incomingCalls")}</h3>
        {requests.length > 0 && (
          <span className="px-3 py-1 rounded-full bg-neon-pink/20 text-neon-pink text-xs font-bold">
            {requests.length}
          </span>
        )}
      </div>

      {requests.length === 0 ? (
        <div className="py-12 text-center">
          <Video className="w-12 h-12 text-soft-white/20 mx-auto mb-4" />
          <p className="text-soft-white/50">{t("modelPanel.noIncomingCalls")}</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {requests.map((req) => (
            <li
              key={req.requestId}
              className={cn(
                "flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl",
                "bg-bg-main/80 border border-neon-pink/30",
              )}
            >
              {req.clientAvatar ? (
                <img
                  src={req.clientAvatar}
                  alt=""
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-neon-pink/40"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-neon-pink/20 flex items-center justify-center text-neon-pink font-bold">
                  {req.clientName.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0 text-left">
                <p className="font-semibold text-soft-white">{req.clientName}</p>
                <p className="text-xs text-neon-pink mt-1">
                  {t("modelPanel.incomingCallHint")}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="danger"
                  className="gap-1.5"
                  onClick={() => handleReject(req)}
                >
                  <PhoneOff className="w-4 h-4" />
                  {t("modelPanel.rejectCall")}
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={() => handleAccept(req)}
                >
                  <Phone className="w-4 h-4" />
                  {t("modelPanel.acceptCall")}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
