"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MOCK_MODELS } from "@/data/mock";
import { VideoCallRoom } from "@/components/call/VideoCallRoom";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/Button";

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

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/login?next=/call/${modelId}`);
    }
  }, [isLoading, user, router, modelId]);

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

  return <VideoCallRoom model={model} />;
}
