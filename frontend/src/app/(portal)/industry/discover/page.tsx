"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import LeafletMap, { MapMarker } from "@/components/LeafletMap";
import StatusPill from "@/components/ui/StatusPill";
import Button from "@/components/ui/Button";

interface FarmerCandidate {
  id: string;
  name: string;
  lat: number;
  lng: number;
  trustScore: number;
  availableLiters: number;
  cattleHeadcount: number;
  driveMins: number;
  roadKm: number;
  netEstimateUzs: number;
  deliveries90d: number;
}

export default function IndustryDiscoverPage() {
  const [drivingTime, setDrivingTime] = useState<number>(60);
  const [minTrust, setMinTrust] = useState<number>(90);
  const [minVolume, setMinVolume] = useState<number>(500);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>("f1");

  // Quick Contract Form State
  const [contractDailyVolume, setContractDailyVolume] = useState<number>(850);
  const [contractBasePrice, setContractBasePrice] = useState<number>(5500);
  const [offerFactoring, setOfferFactoring] = useState<boolean>(true);
  const [contractCreated, setContractCreated] = useState<boolean>(false);

  const candidates: FarmerCandidate[] = [
    {
      id: "f1",
      name: "Baraka Dairy Farm",
      lat: 41.28,
      lng: 69.22,
      trustScore: 96,
      availableLiters: 850,
      cattleHeadcount: 45,
      driveMins: 28,
      roadKm: 18.4,
      netEstimateUzs: 4828000,
      deliveries90d: 90,
    },
    {
      id: "f2",
      name: "Yangiyul Agromilk LLC",
      lat: 41.115,
      lng: 69.05,
      trustScore: 94,
      availableLiters: 1200,
      cattleHeadcount: 65,
      driveMins: 42,
      roadKm: 31.0,
      netEstimateUzs: 6720000,
      deliveries90d: 88,
    },
    {
      id: "f3",
      name: "Zarafshon Sut Cooperative",
      lat: 41.05,
      lng: 69.18,
      trustScore: 95,
      availableLiters: 950,
      cattleHeadcount: 50,
      driveMins: 52,
      roadKm: 39.5,
      netEstimateUzs: 5320000,
      deliveries90d: 87,
    },
    {
      id: "f4",
      name: "Chirchiq Sanoat Agro",
      lat: 41.468,
      lng: 69.58,
      trustScore: 92,
      availableLiters: 1600,
      cattleHeadcount: 85,
      driveMins: 58,
      roadKm: 44.2,
      netEstimateUzs: 8960000,
      deliveries90d: 84,
    },
    {
      id: "f5",
      name: "Beshariq Premium Milk",
      lat: 41.65,
      lng: 69.85,
      trustScore: 91,
      availableLiters: 2100,
      cattleHeadcount: 110,
      driveMins: 85,
      roadKm: 72.0,
      netEstimateUzs: 11760000,
      deliveries90d: 82,
    },
  ];

  // Candidates above 120 minutes never appear per Section 11.2
  const filteredCandidates = useMemo(() => {
    return candidates.filter(
      (c) =>
        c.driveMins <= drivingTime &&
        c.driveMins <= 120 &&
        c.trustScore >= minTrust &&
        c.availableLiters >= minVolume
    );
  }, [drivingTime, minTrust, minVolume]);

  const selectedFarmer =
    candidates.find((c) => c.id === selectedFarmerId) || filteredCandidates[0] || candidates[0];

  const mapMarkers: MapMarker[] = useMemo(() => {
    return [
      {
        id: "plant",
        title: "Toshkent Dairy JSC Plant #2 (Factory Gate)",
        subtitle: "Intake Weighbridge Hub",
        lat: 41.3111,
        lng: 69.2797,
        role: "INDUSTRY",
      },
      ...filteredCandidates.map((c) => ({
        id: c.id,
        title: `${c.name} (${c.trustScore} Trust)`,
        subtitle: `${c.availableLiters} L/day • ${c.driveMins} min drive`,
        lat: c.lat,
        lng: c.lng,
        role: "FARMER" as const,
      })),
    ];
  }, [filteredCandidates]);

  const totalCombinedCapacity = filteredCandidates.reduce((acc, c) => acc + c.availableLiters, 0);

  const initialFundingUzs = contractDailyVolume * 2 * contractBasePrice;

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    setContractCreated(true);
    setTimeout(() => setContractCreated(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Cold-chain farmer discovery</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Source certified regional raw milk suppliers filtered by transport driving isochrones and verified trust scores.
        </p>
      </div>

      {/* Filter Row per Section 11.2 */}
      <div className="p-4 bg-white rounded-[14px] border border-slate-200 shadow-xs flex flex-wrap items-center gap-6 text-xs">
        {/* Driving-time slider (30 to 120 min, default 60, live label) */}
        <div className="flex-1 min-w-[220px] space-y-1">
          <div className="flex justify-between font-bold">
            <span className="text-slate-600 uppercase text-[10px]">Maximum Driving Radius:</span>
            <span className="font-mono text-teal-700">{drivingTime} minutes</span>
          </div>
          <input
            type="range"
            min="30"
            max="120"
            step="5"
            value={drivingTime}
            onChange={(e) => setDrivingTime(parseInt(e.target.value))}
            className="w-full accent-[#047857] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
        </div>

        {/* Minimum Trust Score Select */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-600 block">Min Trust Score</label>
          <select
            value={minTrust}
            onChange={(e) => setMinTrust(parseInt(e.target.value))}
            className="h-9 px-2.5 rounded-lg border border-slate-200 bg-white font-mono text-xs text-slate-800"
          >
            <option value="80">80+ Satisfactory</option>
            <option value="90">90+ Excellent</option>
            <option value="95">95+ Top Tier</option>
          </select>
        </div>

        {/* Available Daily Volume Select */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-600 block">Min Volume</label>
          <select
            value={minVolume}
            onChange={(e) => setMinVolume(parseInt(e.target.value))}
            className="h-9 px-2.5 rounded-lg border border-slate-200 bg-white font-mono text-xs text-slate-800"
          >
            <option value="500">500+ L/day</option>
            <option value="1000">1,000+ L/day</option>
            <option value="1500">1,500+ L/day</option>
          </select>
        </div>

        <button
          onClick={() => {
            setDrivingTime(60);
            setMinTrust(90);
            setMinVolume(500);
          }}
          className="text-xs font-bold text-teal-700 hover:underline pt-4"
        >
          Reset map
        </button>
      </div>

      {/* Main Grid: Left 60% Map & Ranked Table, Right 40% Sticky Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (about 60% = 7 of 12) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-[14px] border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  {filteredCandidates.length} verified farms within {drivingTime} minutes
                </h3>
                <span className="text-xs font-mono text-teal-700 font-bold">
                  {totalCombinedCapacity.toLocaleString()} L/day combined capacity
                </span>
              </div>
            </div>

            {/* Softened Leaflet Map with Trust-Score Pins */}
            <div className="h-[320px] rounded-xl overflow-hidden border border-slate-200 relative">
              <LeafletMap markers={mapMarkers} />
            </div>
          </div>

          {/* Ranked Table per Section 11.2 */}
          <div className="bg-white rounded-[14px] border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-mono text-[10px] text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Farm</th>
                  <th className="py-2.5 px-2 text-center">Trust</th>
                  <th className="py-2.5 px-2 text-right">Available</th>
                  <th className="py-2.5 px-2 text-right">Drive</th>
                  <th className="py-2.5 px-3 text-right">Net Est</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-sans">
                      No verified farms in this radius. Try a wider driving time.
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((c) => {
                    const isSelected = selectedFarmer?.id === c.id;
                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedFarmerId(c.id)}
                        className={`cursor-pointer transition ${
                          isSelected
                            ? "bg-emerald-50/70 border-l-4 border-l-emerald-600"
                            : "hover:bg-slate-50/60"
                        }`}
                      >
                        <td className="py-3 px-3 font-sans font-bold text-slate-900">
                          {c.name}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            {c.trustScore}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right font-bold text-slate-900">
                          {c.availableLiters} L
                        </td>
                        <td className="py-3 px-2 text-right text-slate-600">
                          {c.driveMins}m
                        </td>
                        <td className="py-3 px-3 text-right text-emerald-700 font-bold">
                          {(c.netEstimateUzs / 1000).toFixed(0)}k UZS
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sticky Panel (about 40% = 5 of 12) per Section 11.2 */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-4">
          {selectedFarmer ? (
            <div className="bg-white rounded-[14px] border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-slate-900">{selectedFarmer.name}</h3>
                  <StatusPill status="VERIFIED" label={`FARM PASS • ${selectedFarmer.trustScore}/100`} />
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 font-mono mt-1">
                  <span>{selectedFarmer.cattleHeadcount} cows</span>
                  <span>•</span>
                  <span>{selectedFarmer.deliveries90d}/90 deliveries</span>
                  <span>•</span>
                  <span className="text-teal-700 font-bold">{selectedFarmer.driveMins} min ({selectedFarmer.roadKm} km)</span>
                </div>
              </div>

              {/* Quick Supply Contract Form */}
              <form onSubmit={handleCreateContract} className="space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-teal-700 font-bold block">
                  Quick Supply Contract Drafting
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase mb-1 block">
                      Daily Volume (L) *
                    </label>
                    <input
                      type="number"
                      step="50"
                      value={contractDailyVolume}
                      onChange={(e) => setContractDailyVolume(parseInt(e.target.value) || 0)}
                      className="w-full h-10 px-2.5 text-xs font-mono font-bold rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase mb-1 block">
                      Base Price (UZS/L) *
                    </label>
                    <input
                      type="number"
                      step="50"
                      value={contractBasePrice}
                      onChange={(e) => setContractBasePrice(parseInt(e.target.value) || 0)}
                      className="w-full h-10 px-2.5 text-xs font-mono font-bold rounded-lg border border-slate-200"
                    />
                  </div>
                </div>

                {/* Mono line per Section 11.2: Initial funding • 2 pickups • 9,350,000 UZS */}
                <div className="p-3 bg-slate-900 text-white rounded-xl text-xs font-mono flex justify-between items-baseline">
                  <span className="text-slate-400 text-[11px]">Initial funding • 2 pickups:</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {initialFundingUzs.toLocaleString()} UZS
                  </span>
                </div>

                {/* Factoring Toggle */}
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">Offer eligible bank factoring</span>
                    <span className="text-[10px] text-slate-500">Partner bank advances payment upon lab pass</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={offerFactoring}
                    onChange={(e) => setOfferFactoring(e.target.checked)}
                    className="h-4 w-4 rounded text-emerald-600"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-[11px] text-teal-900">
                  ℹ️ Escrow will be requested from your revolving facility upon mutual signing.
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full"
                >
                  {contractCreated ? "✓ Contract Dispatched to Farmer" : "Create contract &rarr;"}
                </Button>
              </form>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
              Select a farm from the map or table to inspect credentials and draft a contract.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
