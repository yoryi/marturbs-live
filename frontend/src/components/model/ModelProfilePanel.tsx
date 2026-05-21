"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Clock,
  FileImage,
  FileText,
  Languages,
  LogOut,
  Mail,
  ShieldAlert,
  User,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

type VerificationStatus = "verified" | "pending" | "rejected";
type DocStatus = "approved" | "pending" | "missing";

interface ModelVerification {
  status: VerificationStatus;
  documents: {
    idFront: DocStatus;
    idBack: DocStatus;
    selfie: DocStatus;
  };
}

const DEMO_VERIFICATION: Record<string, ModelVerification> = {
  "model@marturbs.live": {
    status: "verified",
    documents: { idFront: "approved", idBack: "approved", selfie: "approved" },
  },
};

function getVerification(email: string): ModelVerification {
  return (
    DEMO_VERIFICATION[email.toLowerCase()] ?? {
      status: "pending",
      documents: { idFront: "pending", idBack: "missing", selfie: "missing" },
    }
  );
}

interface ModelProfilePanelProps {
  onGoToEarnings?: () => void;
}

export function ModelProfilePanel({ onGoToEarnings }: ModelProfilePanelProps) {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [bio, setBio] = useState(
    "Modelo premium · Español e inglés · Disponible en horario nocturno",
  );
  const [username, setUsername] = useState("valentina-noir");

  const verification = useMemo(
    () => (user ? getVerification(user.email) : null),
    [user],
  );

  if (!user) return null;

  const statusConfig = {
    verified: {
      icon: BadgeCheck,
      label: t("modelPanel.profileVerified"),
      desc: t("modelPanel.profileVerifiedDesc"),
      className: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
    },
    pending: {
      icon: Clock,
      label: t("modelPanel.profilePending"),
      desc: t("modelPanel.profilePendingDesc"),
      className: "text-amber-400 bg-amber-500/15 border-amber-500/30",
    },
    rejected: {
      icon: ShieldAlert,
      label: t("modelPanel.profileRejected"),
      desc: t("modelPanel.profileRejectedDesc"),
      className: "text-red-400 bg-red-500/15 border-red-500/30",
    },
  };

  const v = verification ? statusConfig[verification.status] : statusConfig.pending;
  const StatusIcon = v.icon;

  const docItems = [
    { key: "idFront" as const, label: t("modelPanel.docIdFront"), icon: FileText },
    { key: "idBack" as const, label: t("modelPanel.docIdBack"), icon: FileText },
    { key: "selfie" as const, label: t("modelPanel.docSelfie"), icon: FileImage },
  ];

  const docStatusLabel = (s: DocStatus) => {
    if (s === "approved") return t("modelPanel.docApproved");
    if (s === "pending") return t("modelPanel.docPending");
    return t("modelPanel.docMissing");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="glass rounded-2xl p-8 border border-white/5 text-center">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt=""
            className="w-28 h-28 rounded-full mx-auto object-cover ring-4 ring-neon-pink/50"
          />
        ) : (
          <div className="w-28 h-28 rounded-full mx-auto bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center">
            <User className="w-12 h-12 text-white" />
          </div>
        )}
        <h1 className="text-2xl font-bold mt-5 text-soft-white">{user.name}</h1>
        <p className="text-soft-white/50 flex items-center justify-center gap-2 mt-1">
          <Mail className="w-4 h-4" />
          {user.email}
        </p>
      </div>

      {verification && (
        <div className={cn("glass rounded-2xl p-6 border", v.className)}>
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                v.className,
              )}
            >
              <StatusIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">{v.label}</h2>
              <p className="text-sm opacity-80 mt-1">{v.desc}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="text-sm font-medium text-soft-white/70 mb-3">
              {t("modelPanel.documentsTitle")}
            </h3>
            <ul className="space-y-3">
              {docItems.map(({ key, label, icon: Icon }) => {
                const docStatus = verification.documents[key];
                return (
                  <li
                    key={key}
                    className="flex items-center justify-between p-3 rounded-xl bg-bg-main/50"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-soft-white/40" />
                      <span className="text-sm">{label}</span>
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium px-2.5 py-1 rounded-full",
                        docStatus === "approved" && "bg-emerald-500/20 text-emerald-400",
                        docStatus === "pending" && "bg-amber-500/20 text-amber-400",
                        docStatus === "missing" && "bg-white/10 text-soft-white/40",
                      )}
                    >
                      {docStatusLabel(docStatus)}
                    </span>
                  </li>
                );
              })}
            </ul>
            {verification.status !== "verified" && (
              <Button className="w-full mt-4" size="sm" variant="secondary">
                {t("modelPanel.uploadDocuments")}
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
        <h3 className="font-semibold">{t("modelPanel.profileOptions")}</h3>
        <Input
          label={t("modelPanel.publicUsername")}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="@usuario"
        />
        <div>
          <label className="block text-sm font-medium text-soft-white/70 mb-2">
            {t("modelPanel.bio")}
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl glass text-soft-white border border-white/5 focus:border-neon-pink/50 outline-none resize-none"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-soft-white/50">
          <Languages className="w-4 h-4" />
          {t("modelPanel.languagesHint")}
        </div>
        <Button className="w-full" size="sm">
          {t("modelPanel.saveProfile")}
        </Button>
      </div>

      <div className="glass rounded-2xl p-6 border border-white/5 space-y-3">
        <Button
          variant="secondary"
          className="w-full"
          type="button"
          onClick={onGoToEarnings}
        >
          {t("modelPanel.goToPayout")}
        </Button>
        <p className="text-xs text-soft-white/40 text-center">
          {t("modelPanel.payoutHint")}
        </p>
      </div>

      <Button
        variant="danger"
        className="w-full"
        onClick={() => {
          logout();
          router.push("/login");
        }}
      >
        <LogOut className="w-4 h-4" />
        {t("profile.logout")}
      </Button>
    </div>
  );
}
