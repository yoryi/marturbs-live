"use client";

import Image from "next/image";
import Link from "next/link";
import { Radio } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/context";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=1000&fit=crop";

export function HeroSection() {
  const { t } = useI18n();

  return (
    <section className="relative z-10 px-4 sm:px-6 lg:px-8 pt-6 pb-4">
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-bg-card min-h-[300px] md:min-h-[340px] grid lg:grid-cols-2">
          {/* Fondo general */}
          <div className="absolute inset-0 bg-gradient-to-br from-bg-main via-bg-card to-bg-main" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,#bd00ff18,transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,#ff2d8e12,transparent_50%)]" />

          {/* Texto */}
          <div className="relative z-10 flex flex-col justify-center px-8 md:px-12 py-10 md:py-12">
            <span className="inline-flex w-fit items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Radio className="w-3 h-3 animate-pulse" />
              {t("hero.liveBadge")}
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-[family-name:var(--font-syne)] text-soft-white leading-[1.1] mb-4">
              {t("hero.title1")}
              <br />
              <span className="text-soft-white/90">{t("hero.title2")}</span>
            </h1>

            <p className="text-soft-white/50 text-base md:text-lg mb-8 max-w-md leading-relaxed">
              {t("hero.subtitle")}
            </p>

            <Link href="/models" className="w-fit">
              <Button
                size="lg"
                className="uppercase tracking-wide font-bold px-10 shadow-[0_0_32px_#ff2d8e60]"
              >
                {t("hero.cta")}
              </Button>
            </Link>
          </div>

          {/* Visual derecha — llena el espacio vacío */}
          <div className="relative hidden lg:block min-h-[340px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-l from-bg-card via-bg-card/40 to-transparent z-10" />
            <Image
              src={HERO_IMAGE}
              alt=""
              fill
              className="object-cover object-top"
              sizes="(max-width: 1024px) 0vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-transparent z-10" />
            {/* Anillos neón decorativos */}
            <div className="absolute top-1/2 right-8 -translate-y-1/2 w-48 h-48 rounded-full border border-neon-pink/30 shadow-[0_0_60px_#ff2d8e40] z-20 pointer-events-none" />
            <div className="absolute top-1/2 right-16 -translate-y-1/2 w-64 h-64 rounded-full border border-neon-purple/20 pointer-events-none" />
            <div className="absolute bottom-8 right-8 z-20 px-4 py-2 rounded-full glass border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {t("models.onlineBadge")}
            </div>
          </div>

          {/* Móvil: franja visual inferior */}
          <div className="relative lg:hidden h-40 overflow-hidden col-span-1">
            <Image
              src={HERO_IMAGE}
              alt=""
              fill
              className="object-cover object-top opacity-60"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-card to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
