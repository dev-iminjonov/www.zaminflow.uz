"use client";

import React, { useState, useEffect } from "react";

export default function OfflinePwaIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineToast, setShowOfflineToast] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [telegramConnected, setTelegramConnected] = useState(false);
  const [testNotificationSent, setTestNotificationSent] = useState(false);
  const [telegramHandle, setTelegramHandle] = useState("@sayxunobod_agro");

  // Alert preferences
  const [alertSettings, setAlertSettings] = useState({
    payouts: true,
    gateArrival: true,
    labResults: true,
    tempWarning: true,
  });

  useEffect(() => {
    // 1. Service Worker registration
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Resilient registration
      });
    }

    // 2. Online / Offline listeners
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineToast(true);
      setTimeout(() => setShowOfflineToast(false), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineToast(true);
    };

    setIsOnline(navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // 3. PWA install prompt capture
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setInstallPrompt(null);
    }
  };

  const handleSendTestTelegram = () => {
    setTestNotificationSent(true);
    setTelegramConnected(true);
    setTimeout(() => setTestNotificationSent(false), 5000);
  };

  return (
    <>
      {/* 1. FLOATING NETWORK STATUS / PWA / TELEGRAM DOCK (Bottom-Left) */}
      <aside aria-label="Tizim holati va bildirishnomalar" className="fixed bottom-4 left-4 z-50 flex flex-wrap items-center gap-2 pointer-events-auto">
        
        {/* Offline / Online Status Pill */}
        {!isOnline ? (
          <div className="px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-bold flex items-center gap-2 shadow-2xl backdrop-blur-xl animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Oflayn Rejim (Pasture Mode • Kesh Faol)</span>
          </div>
        ) : showOfflineToast ? (
          <div className="px-3.5 py-1.5 rounded-full bg-[#00ffc8]/20 border border-[#00ffc8]/50 text-[#00ffc8] text-xs font-bold flex items-center gap-2 shadow-2xl backdrop-blur-xl animate-in fade-in">
            <span className="w-2 h-2 rounded-full bg-[#00ffc8] animate-ping" />
            <span>Tarmoq Tiklandi (5G/4G Online)</span>
          </div>
        ) : null}

        {/* PWA Install Button (When installable) */}
        {installPrompt && (
          <button
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] font-black text-xs flex items-center gap-1.5 shadow-[0_4px_15px_rgba(0,255,200,0.4)] hover:opacity-95 active:scale-95 transition"
            title="ZaminFlow ilovasini smartfon yoki kompyuteringizga oʻrnating"
          >
            <span>📲</span>
            <span>Ilovani Oʻrnatish (PWA)</span>
          </button>
        )}

        {/* Telegram Instant Alerts Trigger Button */}
        <button
          onClick={() => setIsTelegramModalOpen(true)}
          className="px-3.5 py-1.5 rounded-full bg-[#14181d]/90 hover:bg-[#1a2027] border border-white/15 hover:border-[#00d3e0]/50 text-white text-xs font-bold flex items-center gap-1.5 shadow-xl backdrop-blur-xl transition active:scale-95"
          title="Telegram orqali lahzalik toʻlov va partiya bildirishnomalarini sozlash"
        >
          <span className="text-[#0099ff]">✈</span>
          <span>Telegram Xabarlar</span>
          {telegramConnected && <span className="w-1.5 h-1.5 rounded-full bg-[#00ffc8]" />}
        </button>
      </aside>

      {/* 2. TELEGRAM INSTANT ALERTS CONFIGURATION MODAL */}
      {isTelegramModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-[32px] bg-gradient-to-b from-[#14181d] via-[#10141a] to-[#0c0f13] border border-[#00d3e0]/40 p-6 sm:p-8 shadow-[0_25px_80px_rgba(0,153,255,0.25)] flex flex-col gap-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#0099ff]/20 text-[#0099ff] border border-[#0099ff]/30 flex items-center justify-center text-lg">
                  ✈
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Telegram Lahzalik Bildirishnomalari
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    @ZaminFlowBot rasmiy bot shlyuzi orqali 0-kechikishli xabarlar
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsTelegramModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition"
              >
                ✕
              </button>
            </div>

            {/* Telegram Handle Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-300 uppercase">
                Telegram Foydalanuvchi Nomi yoki Telefon:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={telegramHandle}
                  onChange={(e) => setTelegramHandle(e.target.value)}
                  placeholder="@foydalanuvchi_nomi"
                  className="w-full h-11 rounded-xl bg-black/40 border border-white/15 px-3.5 font-mono text-sm font-bold text-white focus:border-[#00d3e0] outline-hidden"
                />
                <span className="absolute right-3 top-2.5 text-xs text-[#00d3e0] font-bold">
                  {telegramConnected ? "✓ Ulangan" : "Ulanmagan"}
                </span>
              </div>
            </div>

            {/* Notification Checkboxes */}
            <div className="space-y-2.5 pt-2">
              <span className="text-[11px] font-black uppercase text-gray-400">
                Xabarnoma Turlari:
              </span>

              <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition">
                <div className="flex items-center gap-2">
                  <span>⚡</span>
                  <div>
                    <div className="text-xs font-bold text-white">AgroBank Eskrou Toʻlovlari</div>
                    <div className="text-[10px] text-gray-400">Pul hisobga tushishi bilan lahzalik chek</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={alertSettings.payouts}
                  onChange={(e) => setAlertSettings({ ...alertSettings, payouts: e.target.checked })}
                  className="w-4 h-4 accent-[#00ffc8]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition">
                <div className="flex items-center gap-2">
                  <span>🚛</span>
                  <div>
                    <div className="text-xs font-bold text-white">Tanker Yetib Kelishi & Qabul</div>
                    <div className="text-[10px] text-gray-400">Zavod darvozasiga yetganda GPS xabari</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={alertSettings.gateArrival}
                  onChange={(e) => setAlertSettings({ ...alertSettings, gateArrival: e.target.checked })}
                  className="w-4 h-4 accent-[#00ffc8]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition">
                <div className="flex items-center gap-2">
                  <span>🔬</span>
                  <div>
                    <div className="text-xs font-bold text-white">Laboratoriya Sifat Dalolatnomasi</div>
                    <div className="text-[10px] text-gray-400">Yogʻlik, zichlik va Oliy A+ xulosasi</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={alertSettings.labResults}
                  onChange={(e) => setAlertSettings({ ...alertSettings, labResults: e.target.checked })}
                  className="w-4 h-4 accent-[#00ffc8]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition">
                <div className="flex items-center gap-2">
                  <span>❄</span>
                  <div>
                    <div className="text-xs font-bold text-white">Harorat Buzilishi Xavfi (&gt; +4.0°C)</div>
                    <div className="text-[10px] text-gray-400">Tezkor kritik ogohlantirish</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={alertSettings.tempWarning}
                  onChange={(e) => setAlertSettings({ ...alertSettings, tempWarning: e.target.checked })}
                  className="w-4 h-4 accent-[#00ffc8]"
                />
              </label>
            </div>

            {/* Simulated Live Telegram Message Preview */}
            {testNotificationSent && (
              <div className="p-3.5 rounded-2xl bg-[#0099ff]/15 border border-[#0099ff]/40 text-xs text-white space-y-1 animate-in zoom-in-95">
                <div className="font-bold text-[#00d3e0] flex items-center justify-between">
                  <span>📨 @ZaminFlowBot Bildirishnomasi:</span>
                  <span className="text-[10px] text-gray-400">Hozir</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  ✅ <strong>AGROBANK TOʻLOV TASDIQLANDI!</strong><br />
                  💰 Summa: <strong>+22,250,000 UZS</strong><br />
                  🥛 Partiya: #ZF-9042 (5,000 L, Yogʻ: 4.18%)<br />
                  🏛 Kliring: ISO 20022 pacs.008 (Kafolatlangan)
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex gap-2.5 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={handleSendTestTelegram}
                className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] font-black text-xs hover:opacity-90 active:scale-95 transition shadow-md shadow-[#00ffc8]/20"
              >
                {testNotificationSent ? "✓ Test Xabari Yuborildi!" : "⚡ Test Bildirishnomasini Yuborish"}
              </button>

              <button
                type="button"
                onClick={() => setIsTelegramModalOpen(false)}
                className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition"
              >
                Yopish
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
