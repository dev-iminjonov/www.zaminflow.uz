"use client";

import React, { useEffect, useState } from "react";
import CompletionMeter from "@/components/CompletionMeter";
import DocumentUploader from "@/components/DocumentUploader";
import MapPinPicker from "@/components/MapPinPicker";
import StatusPill from "@/components/ui/StatusPill";
import PayoutPreviewPanel from "@/components/ui/PayoutPreviewPanel";
import Button from "@/components/ui/Button";

export default function IndustryProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form fields
  const [legalName, setLegalName] = useState("Toshkent Dairy JSC");
  const [taxId, setTaxId] = useState("309482110");
  const [contactPhone, setContactPhone] = useState("+998 71 200 44 55");
  const [bankIban, setBankIban] = useState("UZ9800010000123456789012");
  const [signatoryName, setSignatoryName] = useState("Rustam Alimov");
  const [addressText, setAddressText] = useState("Chilanzar district, Tashkent city");
  const [lat, setLat] = useState<number>(41.3111);
  const [lng, setLng] = useState<number>(69.2797);
  const [dailyIntake, setDailyIntake] = useState<number>(50000);
  const [siloCapacity, setSiloCapacity] = useState<number>(120000);
  const [intakeFrom, setIntakeFrom] = useState("06:00");
  const [intakeTo, setIntakeTo] = useState("18:00");

  // Quality Coefficients
  const [stdFat, setStdFat] = useState("3.60");
  const [stdSnf, setStdSnf] = useState("8.50");
  const [alphaFat, setAlphaFat] = useState("0.1500");
  const [betaSnf, setBetaSnf] = useState("0.1000");

  // Safety Rules & Toggles
  const [maxTempOptimal, setMaxTempOptimal] = useState("4.0");
  const [maxTempReject, setMaxTempReject] = useState("8.0");
  const [maxAcidity, setMaxAcidity] = useState("18.0");
  const [requireAntibiotics, setRequireAntibiotics] = useState(true);
  const [freezeEscrowOnReject, setFreezeEscrowOnReject] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/v1/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        if (data.legal_name) setLegalName(data.legal_name);
        if (data.tax_id) setTaxId(data.tax_id);
        if (data.contact_phone) setContactPhone(data.contact_phone);
        if (data.bank_iban) setBankIban(data.bank_iban);
        if (data.signatory_name) setSignatoryName(data.signatory_name);
        if (data.address_text) setAddressText(data.address_text);
        if (data.lat && data.lng) {
          setLat(Number(data.lat));
          setLng(Number(data.lng));
        }
        if (data.daily_capacity_liters) setDailyIntake(Number(data.daily_capacity_liters));
        if (data.silo_capacity_liters) setSiloCapacity(Number(data.silo_capacity_liters));
        if (data.intake_from) setIntakeFrom(data.intake_from.slice(0, 5));
        if (data.intake_to) setIntakeTo(data.intake_to.slice(0, 5));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const kybStatus = profile?.kyb_status || "INCOMPLETE";
  const isVerified = kybStatus === "VERIFIED";
  const isEditable = kybStatus === "INCOMPLETE" || kybStatus === "REJECTED";
  const percent = profile?.completion?.percent || (isVerified ? 100 : 60);
  const missing = profile?.completion?.missing || [];

  const handleSave = async () => {
    setSaveStatus("Saving...");
    try {
      const payload = {
        legal_name: legalName,
        tax_id: taxId,
        contact_phone: contactPhone,
        address_text: addressText,
        lat: lat,
        lng: lng,
        bank_iban: bankIban,
        daily_capacity_liters: dailyIntake,
        industry_profile: {
          signatory_name: signatoryName,
          silo_capacity_liters: siloCapacity,
          intake_from: `${intakeFrom}:00`,
          intake_to: `${intakeTo}:00`,
          std_fat_pct: parseFloat(stdFat),
          std_snf_pct: parseFloat(stdSnf),
          alpha_fat_coeff: parseFloat(alphaFat),
          beta_snf_coeff: parseFloat(betaSnf),
          max_temp_optimal_c: parseFloat(maxTempOptimal),
          max_temp_reject_c: parseFloat(maxTempReject),
          max_acidity_turner: parseFloat(maxAcidity),
        },
      };

      const res = await fetch("/api/v1/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaveStatus("✓ Changes saved");
        fetchProfile();
      } else {
        setSaveStatus("Failed to save");
      }
    } catch {
      setSaveStatus("Failed to save");
    } finally {
      setTimeout(() => setSaveStatus(null), 2500);
    }
  };

  const handleSubmitForReview = async () => {
    setSubmitError(null);
    try {
      const res = await fetch("/api/v1/profile/submit", { method: "POST" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Submission incomplete.");
      }
      fetchProfile();
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit for compliance review.");
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-xs text-slate-500 font-mono">Loading factory profile...</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Title & Status Banner on Top (Section 11.5) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Factory profile and quality matrix
            </h1>
            <StatusPill status={kybStatus} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure institutional STIR registration, intake silo hours, and algorithmic payout coefficients.
          </p>
        </div>

        {isVerified && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono font-bold text-emerald-800">
            <span>🛡️</span>
            <span>PUBLIC INDUSTRY TRUST: 98 / 100</span>
          </div>
        )}
      </div>

      {/* Completion Meter */}
      {!isVerified && (
        <CompletionMeter percent={percent} missing={missing} />
      )}

      {/* Main Grid: Left Column Cards, Right Sticky Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column Cards (7 of 12) per Section 11.5 */}
        <div className="lg:col-span-7 space-y-4">
          {/* 1. Company Card */}
          <div className="bg-white rounded-[14px] border border-slate-200 p-5 shadow-xs space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-teal-700 font-bold block">
              01 / COMPANY IDENTITY & SETTLEMENT
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Company Legal Name *</label>
                <input
                  type="text"
                  disabled={isVerified}
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 disabled:bg-slate-50 font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Tax ID (STIR / INN) *</label>
                <input
                  type="text"
                  disabled={isVerified}
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 disabled:bg-slate-50 font-mono font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Authorized Signatory Name *</label>
                <input
                  type="text"
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Contact Phone *</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Bank Settlement Account (IBAN) *</label>
                <input
                  type="text"
                  disabled={isVerified}
                  value={bankIban}
                  onChange={(e) => setBankIban(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 disabled:bg-slate-50 font-mono font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* 2. Location and Intake Card */}
          <div className="bg-white rounded-[14px] border border-slate-200 p-5 shadow-xs space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-teal-700 font-bold block">
              02 / LOCATION & INTAKE CAPACITY
            </span>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Factory Gate Address *</label>
                <input
                  type="text"
                  value={addressText}
                  onChange={(e) => setAddressText(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200"
                />
              </div>

              {/* Pin Map */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Weighbridge Georeference *</label>
                <MapPinPicker
                  lat={lat}
                  lng={lng}
                  disabled={isVerified}
                  onChange={(newLat, newLng) => {
                    setLat(newLat);
                    setLng(newLng);
                  }}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block">Intake From</label>
                  <input
                    type="time"
                    value={intakeFrom}
                    onChange={(e) => setIntakeFrom(e.target.value)}
                    className="w-full h-9 px-2 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block">Intake To</label>
                  <input
                    type="time"
                    value={intakeTo}
                    onChange={(e) => setIntakeTo(e.target.value)}
                    className="w-full h-9 px-2 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block">Daily Target (L)</label>
                  <input
                    type="number"
                    step="1000"
                    value={dailyIntake}
                    onChange={(e) => setDailyIntake(parseInt(e.target.value) || 0)}
                    className="w-full h-9 px-2 rounded-lg border border-slate-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block">Silo Total (L)</label>
                  <input
                    type="number"
                    step="5000"
                    value={siloCapacity}
                    onChange={(e) => setSiloCapacity(parseInt(e.target.value) || 0)}
                    className="w-full h-9 px-2 rounded-lg border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Quality Payout Coefficients Card per Section 11.5 */}
          <div className="bg-white rounded-[14px] border border-slate-200 p-5 shadow-xs space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-teal-700 font-bold block">
              03 / QUALITY PAYOUT COEFFICIENTS (MULTIPLIER MODEL)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div>
                <label className="text-[10px] text-slate-500 font-bold block">Standard Fat %</label>
                <input
                  type="number"
                  step="0.05"
                  value={stdFat}
                  onChange={(e) => setStdFat(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block">Standard SNF %</label>
                <input
                  type="number"
                  step="0.05"
                  value={stdSnf}
                  onChange={(e) => setStdSnf(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block">Alpha Fat (α)</label>
                <input
                  type="number"
                  step="0.01"
                  value={alphaFat}
                  onChange={(e) => setAlphaFat(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 font-bold text-emerald-700"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block">Beta SNF (β)</label>
                <input
                  type="number"
                  step="0.01"
                  value={betaSnf}
                  onChange={(e) => setBetaSnf(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 font-bold text-teal-700"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 font-sans">
              Rule helper: <span className="font-mono font-bold text-slate-800">alpha 0.15 = +1.5% price for every +0.1% fat</span> above standard 3.60%.
            </p>
          </div>

          {/* 4. Cold-Chain & Safety Rules per Section 11.5 */}
          <div className="bg-white rounded-[14px] border border-slate-200 p-5 shadow-xs space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-teal-700 font-bold block">
              04 / COLD-CHAIN & SAFETY RULES
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div>
                <label className="text-[10px] text-slate-500 font-bold block">Optimal Temp (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={maxTempOptimal}
                  onChange={(e) => setMaxTempOptimal(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block">Reject Temp (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={maxTempReject}
                  onChange={(e) => setMaxTempReject(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 font-bold text-red-600"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block">Max Acidity (°T)</label>
                <input
                  type="number"
                  step="0.5"
                  value={maxAcidity}
                  onChange={(e) => setMaxAcidity(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 font-bold"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireAntibiotics}
                  onChange={(e) => setRequireAntibiotics(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span className="font-medium text-slate-700">Require automated rapid antibiotics test pass (Delvotest / Charm)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={freezeEscrowOnReject}
                  onChange={(e) => setFreezeEscrowOnReject(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span className="font-medium text-slate-700">Freeze escrow automatically on rejected or contested batches</span>
              </label>
            </div>
          </div>

          {/* 5. Documents Card */}
          <div className="bg-white rounded-[14px] border border-slate-200 p-5 shadow-xs space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-teal-700 font-bold block">
              05 / COMPLIANCE DOCUMENTS
            </span>
            <div className="space-y-3">
              <DocumentUploader
                docType="REGISTRATION_CERT"
                label="State Registration Certificate (Guvohnoma)"
                disabled={isVerified}
                onUploaded={fetchProfile}
              />
              <DocumentUploader
                docType="SANITARY_PERMIT"
                label="Sanitary-Epidemiological Operating Permit"
                disabled={isVerified}
                onUploaded={fetchProfile}
              />
            </div>
          </div>
        </div>

        {/* Right Sticky Column (5 of 12) per Section 11.5 */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-4">
          {/* Live Payout Example Panel reproducing benchmark */}
          <PayoutPreviewPanel
            initialVolume={1000}
            initialBasePrice={4000}
            initialFat={4.00}
            initialSnf={8.70}
            initialTemp={3.8}
            editable={true}
          />

          {/* Factory Identity Card */}
          <div className="bg-white rounded-[14px] border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                FACTORY IDENTITY PASS
              </span>
              <StatusPill status={kybStatus} />
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="font-bold text-slate-900 text-sm font-sans">{legalName}</div>
              <div className="text-slate-500">STIR: {taxId}</div>
              <div className="text-slate-500">Silo Capacity: {siloCapacity.toLocaleString()} L</div>
              <div className="text-slate-500">Intake Window: {intakeFrom} – {intakeTo}</div>
            </div>

            {isVerified && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 font-medium">
                ⚠️ 14 active contracts keep their signed matrix. Changes apply to newly created supply contracts only.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions (Section 11.5) */}
      <div className="fixed bottom-0 inset-x-0 lg:left-[216px] bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 z-30 shadow-float">
        <div className="max-w-[1224px] mx-auto flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-emerald-700">
            {saveStatus || submitError}
          </span>

          <div className="flex gap-3">
            {isEditable && (
              <Button
                variant="secondary"
                size="md"
                onClick={() => fetchProfile()}
              >
                Discard changes
              </Button>
            )}

            <Button
              variant="secondary"
              size="md"
              onClick={handleSave}
            >
              Save Draft
            </Button>

            {!isVerified ? (
              <Button
                variant="primary"
                size="md"
                disabled={percent < 100}
                onClick={handleSubmitForReview}
              >
                Submit for review &rarr;
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={handleSave}
              >
                Publish for new contracts &rarr;
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
