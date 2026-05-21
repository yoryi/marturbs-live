"use client";

import { ModelGrid } from "@/components/models/ModelGrid";
import { ClientOnlyGuard } from "@/components/auth/ClientOnlyGuard";
import { useI18n } from "@/lib/i18n/context";
import { MOCK_MODELS } from "@/data/mock";

export default function ModelsPage() {
  const { t } = useI18n();

  return (
    <ClientOnlyGuard>
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <h1 className="text-3xl font-bold font-[family-name:var(--font-syne)]">
            {t("models.all")}
          </h1>
          <p className="text-soft-white/50 mt-1">{t("models.allSubtitle")}</p>
        </div>
        <ModelGrid models={MOCK_MODELS} showOnlineOnly={false} />
      </div>
    </ClientOnlyGuard>
  );
}
