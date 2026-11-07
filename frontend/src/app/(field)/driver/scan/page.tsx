"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";

function DriverScanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeStep, setActiveStep] = useState<1 | 2>(1);
  const [torchOn, setTorchOn] = useState(false);
  const [farmQrScanned, setFarmQrScanned] = useState(false);
  const [vialBarcode, setVialBarcode] = useState("");
  const [vialScanned, setVialScanned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // States simulation: normal, outside geofence
  const [isOutsideGeofence, setIsOutsideGeofence] = useState(false);

  const handleSimulateScanQr = () => {
    setFarmQrScanned(true);
    setActiveStep(2);
  };

  const handleSimulateScanVial = () => {
    setVialBarcode("RV-261106-014");
    setVialScanned(true);
  };

  const handleConfirmPickup = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/driver/queue");
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="rounded-2xl bg-white border border-emerald-200 p-8 text-center space-y-4 shadow-sm my-8">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl mx-auto shadow-xs">
          ✓
        </div>
        <h2 className="text-xl font-black text-slate-900">Pickup Confirmed!</h2>
        <p className="text-xs text-slate-600">
          Batch tagged and transitioned to <span className="font-mono font-bold text-teal-700">IN_TRANSIT</span>.
        </p>
        <p className="text-[11px] font-mono text-slate-400">Returning to queue...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Header & Step Chips (Section 10.6) */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Driver Pickup Scanner</h1>
          <p className="text-xs text-slate-500">Dual-verification: Farm token & Reference sample</p>
        </div>
        <Link
          href="/driver/queue"
          className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200"
        >
          Cancel
        </Link>
      </div>

      {/* Step Chips: '1 Farm QR' and '2 Reference vial' */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveStep(1)}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold border transition ${
            activeStep === 1
              ? "bg-slate-900 text-white border-slate-900"
              : farmQrScanned
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-white text-slate-500 border-slate-200"
          }`}
        >
          1 Farm QR {farmQrScanned && "✓"}
        </button>
        <button
          onClick={() => setActiveStep(2)}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold border transition ${
            activeStep === 2
              ? "bg-slate-900 text-white border-slate-900"
              : vialScanned
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-white text-slate-500 border-slate-200"
          }`}
        >
          2 Reference vial {vialScanned && "✓"}
        </button>
      </div>

      {/* Camera Viewport with Rounded Emerald Corner Brackets & Torch Toggle */}
      <div className="relative aspect-square max-w-sm mx-auto rounded-3xl bg-slate-950 border-2 border-slate-800 flex flex-col items-center justify-center text-white overflow-hidden p-6 shadow-float">
        {/* Rounded Emerald Corner Brackets */}
        <div className="relative w-56 h-56 flex flex-col justify-between">
          <div className="flex justify-between">
            <div className="w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
            <div className="w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
          </div>

          <div className="text-center px-2">
            <span className="text-xs font-mono text-emerald-300 font-bold bg-slate-900/80 px-3 py-1 rounded-full border border-emerald-500/30">
              {activeStep === 1 ? "Align Farmer QR code" : "Align Reference Vial barcode"}
            </span>
          </div>

          <div className="flex justify-between">
            <div className="w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
            <div className="w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />
          </div>
        </div>

        {/* Torch Toggle at Top-Right */}
        <button
          onClick={() => setTorchOn(!torchOn)}
          className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-sm border transition cursor-pointer ${
            torchOn
              ? "bg-amber-400 text-slate-950 border-amber-300 font-bold"
              : "bg-slate-900/80 text-white border-slate-700"
          }`}
        >
          🔦
        </button>

        {/* Simulated Trigger Buttons */}
        <div className="absolute bottom-4 inset-x-4 flex gap-2">
          {activeStep === 1 ? (
            <button
              onClick={handleSimulateScanQr}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              Simulate Scan Farmer QR
            </button>
          ) : (
            <button
              onClick={handleSimulateScanVial}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              Simulate Scan Sample Vial
            </button>
          )}
        </div>
      </div>

      {/* Geofence Alert State (Section 10.6) */}
      {isOutsideGeofence && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold flex justify-between items-center">
          <span>⛔ You are 740 m from the farm. Move closer to satisfy 500 m perimeter.</span>
          <button
            onClick={() => setIsOutsideGeofence(false)}
            className="text-[11px] underline"
          >
            Reset
          </button>
        </div>
      )}

      {/* 1. Pickup Validation Card (Section 10.6) */}
      {farmQrScanned && (
        <div className="rounded-2xl bg-white border border-emerald-200 p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-800">
              <span>✓</span>
              <span>Farmer QR verified</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-bold">PICKUP / 261106 / 014</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
            <div className="p-2 rounded-lg bg-slate-50">
              <span className="text-[10px] text-slate-400 block uppercase">Declared Volume</span>
              <span className="font-bold text-slate-900">850 Liters</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50">
              <span className="text-[10px] text-slate-400 block uppercase">Inflow Temp</span>
              <span className="font-bold text-emerald-700">3.2 °C</span>
            </div>
          </div>

          {/* Geofence line */}
          <div className="flex justify-between items-center text-[11px] font-mono pt-1 text-emerald-700 font-bold border-t border-slate-100">
            <span>38 m / 500 m • WITHIN PICKUP GEOFENCE</span>
            <span className="text-slate-400">GPS Acc: ±3m</span>
          </div>
        </div>
      )}

      {/* 2. Reference Sample Card (Section 10.6) */}
      {activeStep === 2 && (
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-900">Physical Reference Sample</span>
            {vialScanned && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold border border-emerald-200">
                VIAL CAPTURED • SEAL INTACT
              </span>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Sample Vial Barcode *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. RV-261106-014"
                value={vialBarcode}
                onChange={(e) => setVialBarcode(e.target.value)}
                className="flex-1 h-11 px-3 text-xs font-mono font-bold rounded-xl border border-slate-200"
              />
              <button
                type="button"
                onClick={() => setVialScanned(Boolean(vialBarcode.trim()))}
                className="px-4 h-11 bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                Set
              </button>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Button
              variant="primary"
              size="md"
              loading={isSubmitting}
              disabled={!farmQrScanned || !vialBarcode.trim()}
              onClick={handleConfirmPickup}
              className="w-full"
            >
              Confirm pickup and link reference vial &rarr;
            </Button>
            <button
              onClick={() => setIsOutsideGeofence(true)}
              className="text-[10px] text-slate-400 hover:text-slate-600 underline font-mono"
            >
              [Simulate Outside Geofence Test]
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DriverScanPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center text-xs text-slate-500 font-mono">Loading scanner...</div>}>
      <DriverScanContent />
    </Suspense>
  );
}
