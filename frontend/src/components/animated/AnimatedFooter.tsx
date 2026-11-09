"use client";

import React from "react";
import Link from "next/link";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";
import { useLanguage } from "@/context/LanguageContext";

export default function AnimatedFooter({ isDark = false }: { isDark?: boolean }) {
  const { t } = useLanguage();
  const f = t.footerSection;

  return (
    <footer
      className="relative z-10 rounded-t-[40px] sm:rounded-t-[48px] overflow-hidden text-white select-none border-t border-white/10"
      style={{
        background: "linear-gradient(180deg, #070B14 0%, #0d1013 40%, #00223d 100%)",
      }}
    >
      {/* Top Ambient Glow Line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#00ffc8] to-transparent opacity-80" />

      <div className="max-w-[1240px] mx-auto px-6 sm:px-8 pt-16 pb-12">
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-white/10">
          
          {/* Column 1: Brand & Mission (4 cols) */}
          <div className="md:col-span-4 flex flex-col items-start gap-4">
            <Link href="/" className="inline-flex items-center transition-transform hover:scale-[1.02]">
              <ZaminFlowLogo mode="dark" size="md" />
            </Link>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-sm">
              {f.mission}
            </p>
          </div>

          {/* Column 2: Kompaniya (2 cols) */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <div className="text-xs font-black tracking-wider uppercase text-[#00d3e0] mb-1">
              {f.companyCol}
            </div>
            <a href="#benefits" className="text-xs sm:text-sm text-white/70 hover:text-white transition-colors">
              {f.benefits}
            </a>
            <a href="#team" className="text-xs sm:text-sm text-white/70 hover:text-white transition-colors">
              {f.team}
            </a>
            <a href="#stats" className="text-xs sm:text-sm text-white/70 hover:text-white transition-colors">
              {f.liveStats}
            </a>
          </div>

          {/* Column 3: Ekotizim & Rollar (3 cols) */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <div className="text-xs font-black tracking-wider uppercase text-[#00d3e0] mb-1">
              {f.ecosystemCol}
            </div>
            <Link href="/sign-up" className="text-xs sm:text-sm text-white/70 hover:text-white transition-colors">
              {f.forFarmers}
            </Link>
            <Link href="/sign-up" className="text-xs sm:text-sm text-white/70 hover:text-white transition-colors">
              {f.forDairies}
            </Link>
            <Link href="/sign-up" className="text-xs sm:text-sm text-white/70 hover:text-white transition-colors">
              {f.forLogistics}
            </Link>
            <Link href="/sign-up" className="text-xs sm:text-sm text-white/70 hover:text-white transition-colors">
              {f.forBanks}
            </Link>
          </div>

          {/* Column 4: Huquqiy & Aloqa (3 cols) */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <div className="text-xs font-black tracking-wider uppercase text-[#00d3e0] mb-1">
              {f.legalCol}
            </div>
            <div className="text-xs text-white/80 font-bold">
              {f.stir}
            </div>
            <div className="text-xs text-white/60">
              {f.legalText}
            </div>
            <a
              href="mailto:support@zaminflow.uz"
              className="text-xs sm:text-sm text-[#00ffc8] font-semibold hover:underline flex items-center gap-1.5 mt-1"
            >
              <span>support@zaminflow.uz</span>
            </a>
          </div>

        </div>

        {/* Bottom Sub-Footer: Copyright & Legal Badges */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <div>© {new Date().getFullYear()} ZaminFlow Technologies LLC. {f.allRightsReserved}</div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">
              {f.privacyPolicy}
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              {f.termsOfUse}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
