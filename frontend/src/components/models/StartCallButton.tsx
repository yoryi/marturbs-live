"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Video } from "lucide-react";
import type { Model } from "@/data/mock";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import { InsufficientCreditsDialog } from "@/components/call/InsufficientCreditsDialog";
import { cn } from "@/lib/utils";

interface StartCallButtonProps {
  model: Model;
  className?: string;
}

export function StartCallButton({ model, className }: StartCallButtonProps) {
  const { t } = useI18n();
  const router = useRouter();
  const { user } = useAuth();
  const [showNoCredits, setShowNoCredits] = useState(false);

  const handleClick = () => {
    if (!model.isOnline) return;

    if (!user) {
      router.push(`/login?next=/call/${model.id}`);
      return;
    }

    if (user.role !== "client") {
      return;
    }

    if ((user.credits ?? 0) <= 0) {
      setShowNoCredits(true);
      return;
    }

    router.push(`/call/${model.id}`);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={!model.isOnline}
        className={cn(
          "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all",
          model.isOnline
            ? "bg-neon-pink text-white shadow-[0_0_20px_#ff2d8e80] hover:scale-105"
            : "bg-white/10 text-soft-white/30 cursor-not-allowed",
          className,
        )}
        aria-label={`${t("models.call")} ${model.name}`}
      >
        <Video className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <InsufficientCreditsDialog
        open={showNoCredits}
        onClose={() => setShowNoCredits(false)}
        credits={user?.credits ?? 0}
        modelName={model.name}
      />
    </>
  );
}
