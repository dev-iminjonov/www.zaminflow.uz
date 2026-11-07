"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { getDairyOrders, DairyOrder } from "@/lib/dairyStore";

export default function DairyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<DairyOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    setOrders(getDairyOrders());
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push("/signin");
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === "all") return true;
    return o.status === statusFilter;
  });

  const totalContractedLiters = orders.reduce((acc, curr) => acc + curr.targetVolumeLiters, 0);
  const totalReceivedLiters = orders.reduce((acc, curr) => acc + curr.fulfilledVolumeLiters, 0);
  const totalLockedEscrow = orders.reduce((acc, curr) => acc + curr.lockedEscrowUZS, 0);

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
            <Link href="/dashboard/dairy/orders" className="text-[#087a3c] border-b-2 border-[#22d36b] pb-0.5">
              Orders
            </Link>
            <Link href="/dashboard/dairy/shipments" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
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
              Procurement <span className="text-[#087a3c]">Orders & Contracts</span>
            </h1>
          </div>
          <Link
            href="/dashboard/dairy/place-order"
            className="inline-flex items-center justify-center bg-[#12303a] text-white rounded-full px-7 min-h-[48px] font-bold text-base hover:bg-[#087a3c] transition shadow-sm cursor-pointer"
          >
            + Place new milk order
          </Link>
        </header>

        {/* Procurement Fulfillment KPIs */}
        <section className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5">
          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              Contracted Target Volume
            </div>
            <div className="flex items-baseline flex-wrap gap-2 mt-3">
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#17352c]">
                {totalContractedLiters.toLocaleString()}
              </span>
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[13px] font-medium text-[#4d6a60]">
                L
              </span>
            </div>
          </div>

          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              Actual Intake Received
            </div>
            <div className="flex items-baseline flex-wrap gap-2 mt-3">
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#17352c]">
                {totalReceivedLiters.toLocaleString()}
              </span>
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[13px] font-medium text-[#4d6a60]">
                L
              </span>
              <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-1">
                {Math.round((totalReceivedLiters / totalContractedLiters) * 100)}% Fulfilled
              </span>
            </div>
          </div>

          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              Prefunded Escrow Capital
            </div>
            <div className="flex items-baseline flex-wrap gap-2 mt-3">
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[30px] font-bold text-[#12303a]">
                {totalLockedEscrow.toLocaleString()}
              </span>
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[13px] font-medium text-[#4d6a60]">
                UZS
              </span>
            </div>
          </div>
        </section>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "All Orders" },
            { id: "in_transit", label: "In Fulfillment / Transit" },
            { id: "open", label: "Awaiting Supply Matching" },
            { id: "fulfilled", label: "Completed Orders" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-[#12303a] text-white"
                  : "bg-white/80 text-[#17352c] border border-white hover:bg-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders Card Grid */}
        <section className="flex flex-col gap-4">
          {filteredOrders.map((order) => {
            const percent = Math.round((order.fulfilledVolumeLiters / order.targetVolumeLiters) * 100);

            return (
              <div
                key={order.id}
                className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 sm:p-7 flex flex-wrap items-center justify-between gap-6"
              >
                <div className="flex-[1_1_260px]">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-xl text-[#12303a]">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2.5 py-0.5">
                      Required Grade {order.requiredGrade}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-[#17352c]">
                    Plant: {order.destinationPlant}
                  </div>
                  <div className="text-xs text-[#4d6a60] mt-0.5">
                    Delivery deadline: {order.deliveryDate} • {order.supplierCount} Smallholder Suppliers Matched
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex-[1_1_220px]">
                  <div className="flex justify-between text-xs mb-1.5 font-semibold text-[#4d6a60]">
                    <span>Fulfillment ({percent}%)</span>
                    <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[#17352c]">
                      {order.fulfilledVolumeLiters.toLocaleString()} / {order.targetVolumeLiters.toLocaleString()} L
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-[#e3efe9] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#12303a] rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Pricing & Escrow */}
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <div className="text-xs text-[#4d6a60]">Ceiling Price</div>
                    <div className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-base text-[#17352c]">
                      {order.maxPricePerLiter.toLocaleString()} UZS / L
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-[#4d6a60]">Escrow Backing</div>
                    <div className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-base text-[#087a3c]">
                      {order.lockedEscrowUZS.toLocaleString()} UZS
                    </div>
                  </div>

                  <Link
                    href="/dashboard/dairy/shipments"
                    className="bg-white text-[#12303a] border-[1.5px] border-[#12303a] rounded-full px-5 min-h-[44px] font-bold text-sm inline-flex items-center justify-center hover:bg-[#12303a] hover:text-white transition"
                  >
                    View Fleet Telemetry →
                  </Link>
                </div>
              </div>
            );
          })}
        </section>

      </div>
    </div>
  );
}
