"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import LockedDashboard from "@/components/LockedDashboard";
import StatusPill from "@/components/ui/StatusPill";
import KpiCard from "@/components/ui/KpiCard";
import Banner from "@/components/ui/Banner";
import DataTable, { Column } from "@/components/ui/DataTable";
import LeafletMap, { MapMarker } from "@/components/LeafletMap";
import Button from "@/components/ui/Button";

interface InboundBatch {
  route: string;
  driver: string;
  farm: string;
  volumeL: number;
  eta: string;
  status: string;
}

export default function IndustryDashboardPage() {
  const [me, setMe] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/me")
      .then((res) => res.json())
      .then((data) => {
        setMe(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="py-20 text-center text-xs text-slate-500 font-mono">Loading procurement dashboard...</div>;
  }

  const kybStatus = me?.organization?.kyb_status || "INCOMPLETE";

  if (kybStatus !== "VERIFIED") {
    return (
      <LockedDashboard
        role="INDUSTRY"
        kybStatus={kybStatus}
        reviewNote={me?.organization?.kyb_review_note}
        percent={me?.completion?.percent || 40}
        missing={me?.completion?.missing || ["tax_id", "location"]}
        emailVerified={me?.user?.email_verified}
        profilePath="/industry/profile"
      />
    );
  }

  const markers: MapMarker[] = [
    {
      id: "f1",
      title: "Baraka Dairy Farm",
      subtitle: "850 L / day • Trust: 96",
      lat: 41.28,
      lng: 69.22,
      role: "FARMER",
    },
    {
      id: "f2",
      title: "Yangiyul Agro Herd",
      subtitle: "1,200 L / day • Trust: 94",
      lat: 41.15,
      lng: 69.05,
      role: "FARMER",
    },
    {
      id: "i1",
      title: "Toshkent Dairy JSC Plant #2",
      subtitle: "Factory Silos & Gate Weighbridge",
      lat: 41.3111,
      lng: 69.2797,
      role: "INDUSTRY",
    },
  ];

  const inboundBatches: InboundBatch[] = [
    {
      route: "R-1106-A (Tanker 01 A 734 BC)",
      driver: "Jasur Aliyev",
      farm: "Baraka Dairy Farm (850 L)",
      volumeL: 850,
      eta: "09:48",
      status: "IN_TRANSIT",
    },
    {
      route: "R-1106-B (Tanker 01 B 992 AA)",
      driver: "Rustam Kurbanov",
      farm: "Zarafshon Sut (600 L)",
      volumeL: 600,
      eta: "10:30",
      status: "IN_TRANSIT",
    },
    {
      route: "R-1105-C (Tanker 01 C 411 EA)",
      driver: "Aziz Mamadiev",
      farm: "Pastdarğom Agro (1,500 L)",
      volumeL: 1500,
      eta: "11:15",
      status: "AT_GATE",
    },
  ];

  const manifestColumns: Column<InboundBatch>[] = [
    { key: "route", header: "Route & Tanker", render: (r) => <span className="font-bold text-slate-900">{r.route}</span> },
    { key: "driver", header: "Driver" },
    { key: "farm", header: "Farm Batches" },
    { key: "volumeL", header: "Volume", align: "right", isMono: true, render: (r) => `${r.volumeL.toLocaleString()} L` },
    { key: "eta", header: "Gate ETA", align: "center", isMono: true },
    { key: "status", header: "Status", align: "center", render: (r) => <StatusPill status={r.status} /> },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Primary Action per Section 11.1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Procurement overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            FRIDAY, 06 NOVEMBER • Toshkent Dairy JSC Plant Operations
          </p>
        </div>

        <Link href="/industry/discover">
          <Button variant="primary" size="md">
            + Create supply contract &rarr;
          </Button>
        </Link>
      </div>

      {/* KPI Row (4) per Section 11.1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          eyebrow="Contracted Today"
          figure="42,500 L"
          context="85.0% of 50,000 L daily target"
          progressPct={85}
        />
        <KpiCard
          eyebrow="In Transit"
          figure="12,750 L"
          context="3 tankers, next arrival 09:48"
          delta="3 tankers"
        />
        <KpiCard
          eyebrow="Lab Verified"
          figure="18,600 L"
          context="43.8% of contracted volume"
          delta="+12.4%"
          className="ring-1 ring-emerald-500/20"
        />
        <KpiCard
          eyebrow="Scheduled Pickups"
          figure="11,150 L"
          context="12 farms remaining today"
        />
      </div>

      {/* Incoming Tanker Network Map & Escrow Credit Line Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Card (7 of 12) */}
        <div className="lg:col-span-7 bg-white rounded-[14px] border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-teal-700 font-bold block">
                01 / INCOMING TANKER LOGISTICS NETWORK
              </span>
              <h3 className="font-extrabold text-sm text-slate-900">Regional Cold-Chain Sourcing</h3>
            </div>
            <Link href="/industry/discover" className="text-xs font-bold text-teal-700 hover:underline">
              Expand map &rarr;
            </Link>
          </div>

          <div className="h-[280px] rounded-xl overflow-hidden border border-slate-200 relative">
            <LeafletMap markers={markers} />
          </div>

          <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 pt-1">
            <span>● Emerald: Verified Farm</span>
            <span>● Teal Line: Active Intake Route</span>
            <span>● Navy: Processing Plant</span>
          </div>
        </div>

        {/* Escrow and Credit Line Card (5 of 12) */}
        <div className="lg:col-span-5 bg-white rounded-[14px] border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-teal-700 font-bold block">
                  02 / BANK ESCROW & FACTORING
                </span>
                <h3 className="font-extrabold text-sm text-slate-900">Credit Facility & Reserves</h3>
              </div>
              <StatusPill status="ACTIVE_FUNDED" label="CREDIT ACTIVE" />
            </div>

            <div className="space-y-3 pt-3 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Funded Escrow:</span>
                <span className="font-bold text-slate-900">124,500,000 UZS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Approved Credit Line:</span>
                <span className="font-bold text-slate-900">200,000,000 UZS</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Factoring Deployed (37.5%):</span>
                  <span className="font-bold text-emerald-700">75,000,000 UZS</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: "37.5%" }} />
                </div>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 font-bold">
                <span className="text-slate-700">Available Liquidity:</span>
                <span className="text-emerald-700">125,000,000 UZS</span>
              </div>
            </div>
          </div>

          {/* Dispute Frozen Alert Banner per Section 11.1 */}
          <Banner
            type="warning"
            title="Escrow Freeze in Effect"
            message="1 batch is frozen. 3,300,000 UZS remains protected pending arbitration."
            actionText="Audit dispute"
            onAction={() => {}}
          />

          <Link href="/industry/contracts">
            <Button variant="secondary" size="sm" className="w-full">
              View contracts & ledger &rarr;
            </Button>
          </Link>
        </div>
      </div>

      {/* Inbound Manifest Table per Section 11.1 */}
      <div className="bg-white rounded-[14px] border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-teal-700 font-bold block">
              03 / INTAKE LOG
            </span>
            <h3 className="font-extrabold text-sm text-slate-900">Inbound Milk Manifest</h3>
          </div>
          <Link href="/gate-scanner" className="text-xs font-bold text-teal-700 hover:underline">
            View all intake terminal &rarr;
          </Link>
        </div>

        <DataTable columns={manifestColumns} data={inboundBatches} />
      </div>

      {/* Two Small Cards per Section 11.1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Today's Settlement Readiness */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            Today&apos;s Settlement Readiness
          </span>
          <div className="flex justify-between items-baseline">
            <span className="text-xl font-black font-mono text-slate-900">
              18,600 L Ready
            </span>
            <span className="text-xs font-mono font-bold text-emerald-700">
              105,648,000 UZS
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            14 lab-accepted batches awaiting automatic end-of-day bank clearing release.
          </p>
        </div>

        {/* Card 2: Supply Coverage */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            Supply Coverage & Cold-Chain Telemetry
          </span>
          <div className="flex justify-between items-baseline">
            <span className="text-xl font-black font-mono text-slate-900">
              85.0% Target
            </span>
            <span className="text-xs font-mono font-bold text-teal-700">
              Avg 3.9 °C Inbound
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            18 active supply farms. 100% within optimal cold-chain quality parameter limit.
          </p>
        </div>
      </div>
    </div>
  );
}
