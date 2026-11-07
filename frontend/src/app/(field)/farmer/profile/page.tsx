"use client";

import React, { useEffect, useState } from "react";
import CompletionMeter from "@/components/CompletionMeter";
import DocumentUploader from "@/components/DocumentUploader";
import MapPinPicker from "@/components/MapPinPicker";
import StatusPill from "@/components/ui/StatusPill";
import TrustScoreGauge from "@/components/ui/TrustScoreGauge";
import Button from "@/components/ui/Button";

export default function FarmerProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form fields
  const [legalName, setLegalName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [contactPhone, setContactPhone] = useState("+998");
  const [addressText, setAddressText] = useState("");
  const [lat, setLat] = useState<number>(41.2995);
  const [lng, setLng] = useState<number>(69.2401);
  const [bankIban, setBankIban] = useState("");
  const [cattleHeadcount, setCattleHeadcount] = useState<number>(45);
  const [dailyCapacity, setDailyCapacity] = useState<number>(1200);
  const [tankCapacity, setTankCapacity] = useState<number>(2000);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/v1/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setLegalName(data.legal_name || "Baraka Dairy Farm");
        setTaxId(data.tax_id || "309482110");
        setContactPhone(data.contact_phone || "+998901234567");
        setAddressText(data.address_text || "Pastdarg'om district, Samarkand region");
        if (data.lat && data.lng) {
          setLat(Number(data.lat));
          setLng(Number(data.lng));
        }
        setBankIban(data.bank_iban || "UZ9800010000123456789012");
        if (data.cattle_headcount) setCattleHeadcount(data.cattle_headcount);
        if (data.daily_capacity_liters) setDailyCapacity(Number(data.daily_capacity_liters));
        if (data.cooling_tank_capacity_liters) setTankCapacity(Number(data.cooling_tank_capacity_liters));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const kybStatus = profile?.kyb_status || "INCOMPLETE";
  const isEditable = kybStatus === "INCOMPLETE" || kybStatus === "REJECTED";
  const isVerified = kybStatus === "VERIFIED";

  const handleSaveSection = async () => {
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
        daily_capacity_liters: dailyCapacity,
        farm_profile: {
          cattle_headcount: cattleHeadcount,
          cooling_tank_capacity_liters: tankCapacity,
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
        throw new Error(err.detail || "Submission criteria incomplete.");
      }
      fetchProfile();
    } catch (err: any) {
      setSubmitError(err.message || "Cannot submit. Please check missing fields.");
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-xs text-slate-500 font-mono">Loading profile...</div>;
  }

  // 1. VERIFIED MODE (Figma 'Farm profile' per Section 10.4)
  if (isVerified) {
    return (
      <div className="space-y-4 pb-8">
        {/* Identity Card with 'VERIFIED FARM PASS' */}
        <div className="rounded-[20px] bg-white border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-mono text-teal-700 uppercase tracking-wider font-bold block">
                OFFICIAL AGRICULTURAL REGISTRY
              </span>
              <h1 className="text-xl font-black text-slate-900 mt-0.5">{legalName}</h1>
            </div>
            <StatusPill status="VERIFIED" label="VERIFIED FARM PASS" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">STIR / INN</span>
              <span className="font-bold text-slate-900">{taxId}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Herd Headcount</span>
              <span className="font-bold text-slate-900">{cattleHeadcount} Milking Cows</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Cooling Vat</span>
              <span className="font-bold text-slate-900">{tankCapacity.toLocaleString()} L capacity</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Settlement IBAN</span>
              <span className="font-bold text-slate-900 truncate block">{bankIban.slice(0, 14)}...</span>
            </div>
          </div>
        </div>

        {/* Trust Score Gauge (96, EXCELLENT / 100) with four sub-bars */}
        <div className="rounded-[20px] bg-white border border-slate-200 p-6 shadow-xs space-y-3 text-center">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            OFFICIAL PLATFORM TRUST SCORE
          </span>
          <TrustScoreGauge score={96} showSubBars={true} />
        </div>

        {/* 90-Day Delivery Record (Section 10.4) */}
        <div className="rounded-[20px] bg-white border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="font-extrabold text-sm text-slate-900">90-Day Delivery Record</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-base font-black text-slate-900 block">76,500 L</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Milk Delivered</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-base font-black text-emerald-700 block">89 / 90</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Accepted Batches</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-base font-black text-slate-900 block">97.8%</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold">On-Time Arrivals</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-base font-black text-slate-900 block">0</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Open Disputes</span>
            </div>
          </div>
        </div>

        {/* Registered Location Mini-Map */}
        <div className="rounded-[20px] bg-white border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-sm text-slate-900">Registered Farm Location</h3>
            <span className="font-mono text-xs text-slate-500">{lat.toFixed(4)}, {lng.toFixed(4)}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 font-mono">
            {addressText}
          </div>
          <p className="text-[10px] text-slate-400">
            Sensitive certified fields are locked. Contact support@zaminflow.uz to update registered location or tax credentials.
          </p>
        </div>
      </div>
    );
  }

  // 2. COMPLETE & REVIEW MODES (INCOMPLETE, SUBMITTED, REJECTED, SUSPENDED)
  const percent = profile?.completion?.percent || 50;
  const missing = profile?.completion?.missing || [];
  const is100Percent = percent >= 100;
  const isEmailVerified = profile?.email_verified;

  return (
    <div className="space-y-4 pb-20">
      <div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">
          {kybStatus === "SUBMITTED" ? "Farm Profile Under Review" : "Complete your farm profile."}
        </h1>
        <p className="text-xs text-slate-500">
          Required for Central Bank escrow factoring and automated quality payouts.
        </p>
      </div>

      {/* Rejection Banner if REJECTED */}
      {kybStatus === "REJECTED" && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-medium space-y-1">
          <span className="font-bold block">Changes Requested by Compliance Admin:</span>
          <span>{profile?.kyb_review_note || "Please upload a clearer veterinary certificate and verify farm address."}</span>
        </div>
      )}

      {/* Review Banner if SUBMITTED */}
      {kybStatus === "SUBMITTED" && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 font-medium space-y-1">
          <span className="font-bold block">Submission Received</span>
          <span>Your profile is currently under review by our compliance team. Data is read-only during verification.</span>
        </div>
      )}

      {/* Completion Meter */}
      <CompletionMeter percent={percent} missing={missing} />

      {/* Accordion Cards */}
      <div className="space-y-3">
        {/* Card 1: Farm Identity */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs space-y-3">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">
            1. Farm Identity
          </h3>
          <div className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Legal Farm / Herd Name *
              </label>
              <input
                type="text"
                disabled={!isEditable}
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                STIR / INN (Tax Identification) *
              </label>
              <input
                type="text"
                disabled={!isEditable}
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full h-10 px-3 text-xs font-mono rounded-xl border border-slate-200 disabled:bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Contact & Location */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs space-y-3">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">
            2. Contact & Farm Location
          </h3>
          <div className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Contact Phone (+998) *
              </label>
              <input
                type="text"
                disabled={!isEditable}
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full h-10 px-3 text-xs font-mono rounded-xl border border-slate-200 disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Physical Farm Address *
              </label>
              <input
                type="text"
                disabled={!isEditable}
                value={addressText}
                onChange={(e) => setAddressText(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 disabled:bg-slate-50"
              />
            </div>

            {/* Leaflet Draggable Pin Picker (Section 10.4) */}
            <div className="pt-1">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Pin Farm Cooling Vat on Map *
              </label>
              <MapPinPicker
                lat={lat}
                lng={lng}
                disabled={!isEditable}
                onChange={(newLat, newLng) => {
                  setLat(newLat);
                  setLng(newLng);
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Capacity & Herd Headcount */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs space-y-3">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">
            3. Capacity & Livestock
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                Cows
              </label>
              <input
                type="number"
                disabled={!isEditable}
                value={cattleHeadcount}
                onChange={(e) => setCattleHeadcount(parseInt(e.target.value) || 0)}
                className="w-full h-10 px-2 text-xs font-mono font-bold rounded-xl border border-slate-200 disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                Daily L
              </label>
              <input
                type="number"
                disabled={!isEditable}
                value={dailyCapacity}
                onChange={(e) => setDailyCapacity(parseInt(e.target.value) || 0)}
                className="w-full h-10 px-2 text-xs font-mono font-bold rounded-xl border border-slate-200 disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                Vat L
              </label>
              <input
                type="number"
                disabled={!isEditable}
                value={tankCapacity}
                onChange={(e) => setTankCapacity(parseInt(e.target.value) || 0)}
                className="w-full h-10 px-2 text-xs font-mono font-bold rounded-xl border border-slate-200 disabled:bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* Card 4: Banking */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs space-y-3">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">
            4. Settlement Account (IBAN)
          </h3>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Bank IBAN Account *
            </label>
            <input
              type="text"
              disabled={!isEditable}
              placeholder="UZ9800010000123456789012"
              value={bankIban}
              onChange={(e) => setBankIban(e.target.value)}
              className="w-full h-10 px-3 text-xs font-mono rounded-xl border border-slate-200 disabled:bg-slate-50"
            />
          </div>
        </div>

        {/* Card 5: Documents */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs space-y-3">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">
            5. Mandatory Verification Documents
          </h3>
          <div className="space-y-3">
            <DocumentUploader
              docType="REGISTRATION_CERT"
              label="State Registration or Farm Certificate"
              disabled={!isEditable}
              onUploaded={fetchProfile}
            />
            <DocumentUploader
              docType="VET_CERT"
              label="Veterinary Sanitary Certificate (Form #1)"
              disabled={!isEditable}
              onUploaded={fetchProfile}
            />
          </div>
        </div>
      </div>

      {/* Save Draft Button */}
      {isEditable && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs font-mono font-bold text-emerald-700">
            {saveStatus}
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleSaveSection}
          >
            Save Draft Changes
          </Button>
        </div>
      )}

      {/* Sticky Bottom Bar: Submit for Review (Section 10.4) */}
      {isEditable && (
        <div className="fixed bottom-16 inset-x-0 max-w-[560px] mx-auto p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30 shadow-float">
          {submitError && (
            <div className="mb-2 p-2 bg-red-50 text-red-700 text-xs font-medium rounded-lg">
              {submitError}
            </div>
          )}
          <Button
            type="button"
            variant="primary"
            size="md"
            disabled={!is100Percent || !isEmailVerified}
            title={
              !isEmailVerified
                ? "Verify your email before submitting"
                : !is100Percent
                ? "Complete all required fields and documents to 100%"
                : "Submit for compliance review"
            }
            onClick={handleSubmitForReview}
            className="w-full"
          >
            Submit for review &rarr;
          </Button>
        </div>
      )}
    </div>
  );
}
