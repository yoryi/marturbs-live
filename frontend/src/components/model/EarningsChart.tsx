"use client";

import { useI18n } from "@/lib/i18n/context";

const data = [40, 65, 45, 80, 55, 90, 70];

export function EarningsChart() {
  const { t } = useI18n();

  const labels = [
    t("chart.mon"),
    t("chart.tue"),
    t("chart.wed"),
    t("chart.thu"),
    t("chart.fri"),
    t("chart.sat"),
    t("chart.sun"),
  ];

  const max = Math.max(...data);
  const w = 100;
  const h = 50;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - (v / max) * h;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="glass rounded-2xl p-6 border border-white/5">
      <h3 className="font-semibold text-soft-white mb-1">
        {t("modelPanel.weeklyEarnings")}
      </h3>
      <p className="text-xs text-soft-white/40 mb-6">
        {t("modelPanel.last7days")}
      </p>
      <div className="relative h-48">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF2D8E" />
              <stop offset="100%" stopColor="#BD00FF" />
            </linearGradient>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF2D8E" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#FF2D8E" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon
            points={`0,${h} ${points} ${w},${h}`}
            fill="url(#areaGrad)"
          />
          <polyline
            points={points}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            style={{ filter: "drop-shadow(0 0 8px #FF2D8E)" }}
          />
        </svg>
        <div className="flex justify-between mt-3 text-xs text-soft-white/40">
          {labels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
