"use client";

import { motion } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import type { CallChatMessage, ChatSender } from "@/lib/useCallChat";
import { cn } from "@/lib/utils";

interface CallChatPanelProps {
  messages: CallChatMessage[];
  chatInput: string;
  onChatInputChange: (value: string) => void;
  onSend: () => void;
  perspective: "client" | "model";
  onClose?: () => void;
  className?: string;
}

function isOwnMessage(sender: ChatSender, perspective: "client" | "model") {
  return perspective === "client" ? sender === "user" : sender === "model";
}

export function CallChatPanel({
  messages,
  chatInput,
  onChatInputChange,
  onSend,
  perspective,
  onClose,
  className,
}: CallChatPanelProps) {
  const { t } = useI18n();

  return (
    <motion.aside
      initial={false}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "w-full max-w-[300px] sm:max-w-[320px] flex flex-col border-l border-white/10 bg-bg-main/95 backdrop-blur-xl z-30 shrink-0 h-full",
        className,
      )}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-neon-pink" />
          <span className="text-sm font-semibold">
            {perspective === "model" ? t("call.chatFromClient") : t("call.chatTitle")}
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-soft-white/40 hover:text-soft-white hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <p className="text-sm text-soft-white/40 text-center py-8">
            {t("call.chatEmpty")}
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "max-w-[90%] rounded-xl px-3 py-2 text-sm",
              isOwnMessage(msg.sender, perspective)
                ? "ml-auto bg-neon-pink/25 text-soft-white"
                : "bg-bg-card text-soft-white/90",
            )}
          >
            {msg.text}
            <p className="text-[10px] text-soft-white/30 mt-1">{msg.time}</p>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-white/10 flex gap-2">
        <input
          value={chatInput}
          onChange={(e) => onChatInputChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          placeholder={t("call.chatPlaceholder")}
          className="flex-1 px-3 py-2.5 rounded-xl bg-bg-card text-sm border border-white/5 focus:border-neon-pink/40 outline-none"
        />
        <button
          type="button"
          onClick={onSend}
          className="p-2.5 rounded-xl bg-neon-pink/20 text-neon-pink hover:bg-neon-pink/30 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </motion.aside>
  );
}
