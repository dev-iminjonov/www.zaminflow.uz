"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { getDairyShipments, DairyShipment } from "@/lib/dairyStore";

export default function DairyShipmentsPage() {
  const router = useRouter();
  const [shipments, setShipments] = useState<DairyShipment[]>([]);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    setShipments(getDairyShipments());
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push("/signin");
  };

  return (
    <div className="min-h-[940px] bg-[linear-gradient(160deg,#f6f9f8_0%,#e4f6ec_100%)] text-[#17352c] font-[family-name:var(--font-inter,sans-serif)]">
      <div className="max-w-[1180px] mx-auto px-6 pt-6 pb-14 flex flex-col gap-7">
        
        {/* Floating Top Pill Nav */}
        <nav className="bg-white rounded-[40px] px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-[0_10px_40px_rgba(20,80,60,0.08)]">
          <Link href="/dashboard/dairy" className="text-[26px] font-extrabold tracking-[-0.02em] text-[#12303a]">
            zamin<span className="text-[#0f9d8a]">flow</span>
          </Link>
          <div className="flex flex-wrap items-center gap-7 text-[15px] font-semibold">
            <Link href="/dashboard/dairy" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              Overview
            </Link>
            <Link href="/dashboard/dairy/orders" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              Orders
            </Link>
            <Link href="/dashboard/dairy/shipments" className="text-[#087a3c] border-b-2 border-[#22d36b] pb-0.5">
              Shipments
            </Link>
            <Link href="/dashboard/dairy/escrow" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              Escrow
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-1 whitespace-nowrap">
              Dairy Industry
            </span>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="bg-white text-[#12303a] border-[1.5px] border-[#12303a] rounded-full px-5 min-h-[44px] font-bold text-[15px] hover:bg-[#12303a] hover:text-white transition cursor-pointer"
            >
              {isSigningOut ? "..." : "Sign out"}
            </button>
          </div>
        </nav>

        {/* Header Row */}
        <header className="flex flex-wrap items-end justify-between gap-5 pt-4">
          <div>
            <h1 className="m-0 text-4xl sm:text-5xl font-extrabold tracking-[-0.03em] leading-[1.05] text-[#17352c]">
              Inbound Milk Tankers <span className="text-[#087a3c]">& Telemetry</span>
            </h1>
          </div>
          <Link
            href="/dashboard/dairy/regional-pricing"
            className="inline-flex items-center justify-center bg-white text-[#12303a] border-[1.5px] border-[#12303a] rounded-full px-5 min-h-[44px] font-bold text-sm hover:bg-[#12303a] hover:text-white transition"
          >
            Adjust Regional Spot Prices →
          </Link>
        </header>

        {/* Fleet KPI Telemetry Grid */}
        <section className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5">
          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              Active Inbound Tankers
            </div>
            <div className="flex items-baseline flex-wrap gap-2 mt-3">
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#17352c]">
                47
              </span>
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[13px] font-medium text-[#4d6a60]">
                trucks
              </span>
              <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-1">
                +3.2°C cold
              </span>
            </div>
          </div>

          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              Received at Plant Today
            </div>
            <div className="flex items-baseline flex-wrap gap-2 mt-3">
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#17352c]">
                186,400
              </span>
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[13px] font-medium text-[#4d6a60]">
                L
              </span>
              <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-1">
                +3.8%
              </span>
            </div>
          </div>

          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              Awaiting Gate Reception
            </div>
            <div className="flex items-baseline flex-wrap gap-2 mt-3">
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#b45309]">
                1
              </span>
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[13px] font-medium text-[#4d6a60]">
                tanker at gate
              </span>
              <span className="text-xs font-bold bg-[#fdf0d2] text-[#7a4b00] rounded-lg px-2 py-1">
                Titration ready
              </span>
            </div>
          </div>
        </section>

        {/* Fleet List */}
        <section className="flex flex-col gap-5">
          {shipments.map((shipment) => {
            const isTesting = shipment.status === "testing";
            const isReleased = shipment.status === "released";

            return (
              <div
                key={shipment.id}
                className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 sm:p-7 flex flex-wrap items-center justify-between gap-6"
              >
                <div className="flex-[1_1_280px]">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-lg text-[#12303a]">
                      {shipment.route}
                    </span>
                    <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-xs font-bold bg-[#e6ecea] text-[#33473f] rounded-lg px-2 py-0.5">
                      {shipment.batchNumber}
                    </span>
                    {shipment.gpsLock && (
                      <span className="text-xs font-bold text-[#087a3c] flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#22d36b] animate-pulse" />
                        GPS locked
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-[#4d6a60]">
                    From: {shipment.sourceRegion} → To: <strong>{shipment.destinationPlant}</strong>
                  </div>
                  <div className="text-xs text-[#4d6a60] mt-1">
                    Driver: {shipment.driverName} ({shipment.truckPlate}) • Phone: {shipment.driverPhone}
                  </div>
                </div>

                {/* Telemetry numbers */}
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <div className="text-xs text-[#4d6a60]">Volume</div>
                    <div className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-lg text-[#17352c]">
                      {shipment.volumeLiters.toLocaleString()} L
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-[#4d6a60]">Cold Temp</div>
                    <div className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-lg text-[#087a3c]">
                      {shipment.tempC}°C
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-[#4d6a60]">ETA / Status</div>
                    <div className="font-semibold text-sm text-[#12303a]">
                      {shipment.etaOrStatus}
                    </div>
                  </div>

                  <div>
                    <span
                      className={`text-xs font-bold rounded-lg px-3 py-1.5 inline-block ${
                        isTesting
                          ? "bg-[#fdf0d2] text-[#7a4b00]"
                          : isReleased
                          ? "bg-[#e6ecea] text-[#33473f]"
                          : "bg-[#d9f7e5] text-[#087a3c]"
                      }`}
                    >
                      {shipment.status === "in_transit" && "● In transit"}
                      {shipment.status === "testing" && "● Titration pending"}
                      {shipment.status === "released" && "✓ Escrow released"}
                    </span>
                  </div>
                </div>

                {/* Direct Action */}
                <div>
                  {isTesting ? (
                    <Link
                      href={`/dashboard/dairy/receive-batch?batch=${shipment.batchNumber}`}
                      className="bg-[#12303a] text-white rounded-full px-6 min-h-[46px] font-bold text-sm inline-flex items-center justify-center hover:bg-[#087a3c] transition shadow-md"
                    >
                      Receive & Input Lab Test →
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="bg-[#e6ecea] text-[#33473f] rounded-full px-5 min-h-[46px] font-semibold text-xs inline-flex items-center justify-center cursor-default"
                    >
                      {isReleased ? "Escrow Settled" : "In Route Dispatch"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </section>

      </div>
    </div>
  );
}
