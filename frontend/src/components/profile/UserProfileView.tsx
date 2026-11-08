"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RoleKey, ROLES } from "@/lib/roles";
import { getStoredSession, AuthSession } from "@/lib/auth";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";
import { useLanguage } from "@/context/LanguageContext";
import { ThemeToggleButton } from "@/context/ThemeContext";
import { getDisplayInitials, resolveUserAvatar } from "@/lib/userAvatar";

export interface UserProfileData {
  userId: string;
  role: RoleKey;
  fullName: string;
  title: string;
  organizationName: string;
  location: string;
  avatarUrl: string;
  bannerUrl?: string;
  email: string;
  phone: string;
  trustScore: number;
  kybVerified: boolean;
  memberSince: string;
  taxId: string;
  bankName: string;
  iban: string;
  bio: string;
  languages: string[];
  capabilities: { label: string; count?: string; active?: boolean }[];
  stats: {
    label: string;
    value: string;
    sublabel: string;
  }[];
  team: {
    name: string;
    role: string;
    avatarUrl: string;
  }[];
  tradingSpecs: {
    label: string;
    value: string;
  }[];
}

interface UserProfileViewProps {
  initialRole?: RoleKey;
  profileId?: string;
}

export default function UserProfileView({
  initialRole = "farmer",
  profileId,
}: UserProfileViewProps) {
  const router = useRouter();
  const { locale, setLocale } = useLanguage();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "specs" | "contracts" | "team">("overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [failedTeamImages, setFailedTeamImages] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setSession(getStoredSession());
  }, []);

  // Determine current active profile role
  const role: RoleKey = initialRole;

  const farmerFullName = session?.user?.fullName || "Iminjonov Muhammadaziz";
  const dairyFullName = session?.user?.fullName || "Malika Karimova";
  const driverFullName = session?.user?.fullName || "Bobur Alimov";
  const bankFullName = session?.user?.fullName || "Rustam Karimov";
  const adminFullName = session?.user?.fullName || "Iminjonov Muhammadaziz";

  // Base mock profiles tailored for each role
  const roleProfiles: Record<RoleKey, UserProfileData> = {
    farmer: {
      userId: "usr-farmer-01",
      role: "farmer",
      fullName: farmerFullName,
      title: "Lead Farm Operator & Milk Producer",
      organizationName: session?.organization?.legalName || "Sayxunobod Agro-Dairy Farm LLC",
      location: "Sayxunobod District, Sirdaryo Region, Uzbekistan",
      avatarUrl: resolveUserAvatar(farmerFullName, session?.user?.email) || "",
      bannerUrl: "/images/hero-ecosystem-3d.jpg",
      email: session?.user?.email || "farmer@zaminflow.uz",
      phone: "+998 90 333 44 55",
      trustScore: 98,
      kybVerified: true,
      memberSince: "March 2025",
      taxId: "304 981 223",
      bankName: "AgroBank Sayxunobod Regional Branch",
      iban: "UZ8800010000304981223001",
      bio: "Sayxunobod Certified Agro-Dairy Farm operates 180 Holstein-Friesian dairy cattle producing over 4,500 liters of high-protein Grade A raw milk daily. Equipped with automated GEA cooling tanks (+3.2°C locked) and digital titration sensors calibrated to national veterinary standards.",
      languages: ["O'zbekcha", "Русский", "English"],
      capabilities: [
        { label: "Daily Yield: 4,500 L / day", active: true },
        { label: "Fat Titration: 3.9% – 4.2%", active: true },
        { label: "SNF: 8.65% Certified", active: true },
        { label: "Pre-cooled at +3.2°C", active: true },
        { label: "Vet Inspection № UZ-99412", active: true },
        { label: "Factoring via AgroBank", active: false },
        { label: "Direct Escrow Settlement", active: true },
      ],
      stats: [
        { label: "Completed Deliveries", value: "142", sublabel: "100% on-time release" },
        { label: "Quality Pass Rate", value: "98.4%", sublabel: "Grade A certified" },
        { label: "Dispute Rate", value: "0.0%", sublabel: "Zero frozen funds" },
        { label: "Settlement Speed", value: "< 2.5 hrs", sublabel: "Direct bank escrow" },
      ],
      team: [
        { name: "Iminjonov Muhammadaziz", role: "Founder & Lead Operator", avatarUrl: "/images/team-muhammadaziz.jpg" },
        { name: "Abdumanov Akrom", role: "Lead Systems & IoT Engineer", avatarUrl: "/images/team-akrom.jpg" },
        { name: "Sevinchoy Soporboyeva", role: "Co-Founder & Quality Operations", avatarUrl: "/images/team-sevinchoy.jpg" },
      ],
      tradingSpecs: [
        { label: "Minimum Daily Order", value: "1,000 Liters" },
        { label: "Maximum Peak Capacity", value: "5,500 Liters / day" },
        { label: "Temperature Guarantee", value: "+3.2°C to +4.0°C" },
        { label: "Base Price Range", value: "5,600 – 6,000 UZS / L" },
        { label: "Payment Method", value: "ZaminFlow Smart Escrow with Bank Guarantee" },
      ],
    },
    dairy: {
      userId: "usr-dairy-01",
      role: "dairy",
      fullName: dairyFullName,
      title: "Chief Procurement Officer & Plant Technologist",
      organizationName: session?.organization?.legalName || "Toshkent Dairy Processing JSC",
      location: "Bektemir Industrial Zone, Tashkent, Uzbekistan",
      avatarUrl: resolveUserAvatar(dairyFullName, session?.user?.email) || "",
      bannerUrl: "/images/hero-ecosystem-3d.jpg",
      email: session?.user?.email || "dairy@zaminflow.uz",
      phone: "+998 71 200 45 67",
      trustScore: 99,
      kybVerified: true,
      memberSince: "January 2025",
      taxId: "201 445 990",
      bankName: "AsakaBank Head Office / Treasury",
      iban: "UZ4500020000201445990001",
      bio: "Toshkent Dairy Processing Complex processes 120,000+ liters of raw milk daily into pasteurized consumer milk, kefir, butter, and hard cheeses. We maintain pre-funded bank escrow custody with automated release upon independent gate laboratory titration clearance.",
      languages: ["Русский", "O'zbekcha", "English"],
      capabilities: [
        { label: "Intake Capacity: 120,000 L / day", active: true },
        { label: "Minimum SNF: 8.5%", active: true },
        { label: "ISO 22000 & Halal Certified", active: true },
        { label: "Pre-funded Escrow Custody", active: true },
        { label: "Gate Titration in 15 mins", active: true },
        { label: "Tanker Fleet Available", active: false },
        { label: "Direct Sirdaryo & Samarkand Routes", active: true },
      ],
      stats: [
        { label: "Monthly Intake", value: "3.6M L", sublabel: "Commercial dairy production" },
        { label: "Active Farmer Contracts", value: "84 Farms", sublabel: "Direct partnerships" },
        { label: "Avg Escrow Turnover", value: "1.8 hrs", sublabel: "From gate to bank release" },
        { label: "Trust Score", value: "99 / 100", sublabel: "Tier 1 Enterprise" },
      ],
      team: [
        { name: "Sevinchoy Soporboyeva", role: "Co-Founder & Dairy Partner Liaison", avatarUrl: "/images/team-sevinchoy.jpg" },
        { name: "Shokhjakhon Abdufattohov", role: "Strategic Adviser & Operations", avatarUrl: "/images/team-shohjahon.jpg" },
        { name: "Abdumanov Akrom", role: "Gate Quality Telemetry Lead", avatarUrl: "/images/team-akrom.jpg" },
      ],
      tradingSpecs: [
        { label: "Required Grade", value: "Grade A or Grade B (Titrated)" },
        { label: "Receiving Hours", value: "24/7 Priority Cold Gate Intake" },
        { label: "Purchase Pricing", value: "Market Pegged (Current: 5,800 – 6,200 UZS/L)" },
        { label: "Laboratory Turnaround", value: "15 minutes per intake tanker" },
        { label: "Settlement Security", value: "Central Bank Escrow with AsakaBank" },
      ],
    },
    driver: {
      userId: "usr-driver-01",
      role: "driver",
      fullName: driverFullName,
      title: "Certified Cold-Chain Tanker Operator",
      organizationName: session?.organization?.legalName || "ZaminFlow Logistics Fleet #04",
      location: "Tashkent - Sayxunobod Transit Corridor, Uzbekistan",
      avatarUrl: resolveUserAvatar(driverFullName, session?.user?.email) || "",
      bannerUrl: "/images/hero-ecosystem-3d.jpg",
      email: session?.user?.email || "driver@zaminflow.uz",
      phone: "+998 90 999 88 77",
      trustScore: 97,
      kybVerified: true,
      memberSince: "April 2025",
      taxId: "401 229 110",
      bankName: "AgroBank Transport Clearing",
      iban: "UZ1200030000401229110001",
      bio: "Professional dairy logistics operator with 8+ years experience in insulated milk transport. Operating a MAN TGS 26.440 20,000L food-grade stainless steel tanker paired with ZaminFlow real-time IoT temperature and GPS gateway.",
      languages: ["O'zbekcha", "Русский"],
      capabilities: [
        { label: "20,000 L Insulated Tanker", active: true },
        { label: "GPS Telemetry Paired", active: true },
        { label: "Cold-Chain Sealed: +3.2°C", active: true },
        { label: "QR Gate Scanning Certified", active: true },
        { label: "CIP Sanitized Daily", active: true },
      ],
      stats: [
        { label: "Trips Completed", value: "348", sublabel: "Zero cold breaches" },
        { label: "Avg Delivery Temp", value: "+3.2°C", sublabel: "Calibrated sensor" },
        { label: "Transit Punctuality", value: "99.1%", sublabel: "On-time arrival" },
        { label: "Safety Rating", value: "5.0 ★", sublabel: "Certified driver" },
      ],
      team: [
        { name: "Abdumanov Akrom", role: "Fleet Telemetry & IoT Lead", avatarUrl: "/images/team-akrom.jpg" },
        { name: "Shokhjakhon Abdufattohov", role: "Logistics Dispatch Adviser", avatarUrl: "/images/team-shohjahon.jpg" },
      ],
      tradingSpecs: [
        { label: "Vehicle Model", value: "MAN TGS 26.440 Stainless Tanker" },
        { label: "Vehicle Number", value: "01-A 882 AA" },
        { label: "Sanitary Permit", value: "State Health № SAN-2026-90" },
        { label: "Service Routes", value: "Sirdaryo, Tashkent, Samarkand, Jizzakh" },
      ],
    },
    bank: {
      userId: "usr-bank-01",
      role: "bank",
      fullName: bankFullName,
      title: "Chief Escrow Compliance Officer",
      organizationName: session?.organization?.legalName || "Agrobank ATB (Escrow Custodian)",
      location: "Muqimiy Street 43, Tashkent, 100096, Uzbekistan",
      avatarUrl: resolveUserAvatar(bankFullName, session?.user?.email) || "",
      bannerUrl: "/images/hero-ecosystem-3d.jpg",
      email: session?.user?.email || "bank@zaminflow.uz",
      phone: "+998 71 203 88 88",
      trustScore: 100,
      kybVerified: true,
      memberSince: "February 2025",
      taxId: "200 110 994",
      bankName: "Central Bank of Uzbekistan RTGS Clearing",
      iban: "UZ0100400000200110994001",
      bio: "Licensed commercial bank escrow custodian and trade finance clearing partner for ZaminFlow B2B agricultural supply contracts. Enforces ISO 20022 pacs.008 real-time settlement and double-entry ledger reconciliation.",
      languages: ["O'zbekcha", "Русский", "English"],
      capabilities: [
        { label: "ISO 20022 pacs.008 Clearing", active: true },
        { label: "Escrow Vault Custody", active: true },
        { label: "SHA-256 Ledger Audit", active: true },
        { label: "CBU Banking License #14", active: true },
      ],
      stats: [
        { label: "Escrow Solvency", value: "100%", sublabel: "Fully collateralized" },
        { label: "Settlement Speed", value: "< 3 min", sublabel: "Post-titration release" },
        { label: "Default Rate", value: "0.00%", sublabel: "Zero bad debt" },
        { label: "Audit Integrity", value: "Verified", sublabel: "Append-only ledger" },
      ],
      team: [
        { name: "Iminjonov Muhammadaziz", role: "Founder & Escrow Governance", avatarUrl: "/images/team-muhammadaziz.jpg" },
        { name: "Shokhjakhon Abdufattohov", role: "Financial Compliance Adviser", avatarUrl: "/images/team-shohjahon.jpg" },
      ],
      tradingSpecs: [
        { label: "CBU Banking License", value: "Central Bank License № 14" },
        { label: "Clearing Standard", value: "ISO 20022 (pacs.008.001.08)" },
      ],
    },
    admin: {
      userId: "usr-admin-01",
      role: "admin",
      fullName: adminFullName,
      title: "Founder & Chief Regulatory Officer",
      organizationName: "ZaminFlow National Infrastructure Bureau",
      location: "Navoi Avenue 14, Tashkent, 100011, Uzbekistan",
      avatarUrl:
        resolveUserAvatar(
          adminFullName,
          session?.user?.email || "iminjonovmuhammadaziz626@gmail.com"
        ) || "/images/team-muhammadaziz.jpg",
      bannerUrl: "/images/hero-ecosystem-3d.jpg",
      email: session?.user?.email || "iminjonovmuhammadaziz626@gmail.com",
      phone: "+998 71 200 45 67",
      trustScore: 100,
      kybVerified: true,
      memberSince: "January 2025",
      taxId: "100 000 001",
      bankName: "Central Bank of Uzbekistan",
      iban: "UZ0000000000000000000001",
      bio: "Official compliance and escrow oversight administrator for the ZaminFlow national B2B dairy ecosystem. Managing regulatory dossiers, dispute resolution tribunals, and escrow settlement contracts.",
      languages: ["O'zbekcha", "Русский", "English"],
      capabilities: [
        { label: "Central Bank Escrow Oversight", active: true },
        { label: "Disputes Tribunal Governance", active: true },
        { label: "Enterprise KYB Dossier Review", active: true },
        { label: "National Supply Standards", active: true },
      ],
      stats: [
        { label: "Active Enterprises", value: "1,240", sublabel: "Verified accounts" },
        { label: "Escrow in Custody", value: "48.5M UZS", sublabel: "CBU Guaranteed" },
        { label: "Resolution Speed", value: "< 24 hrs", sublabel: "Tribunal SLA" },
        { label: "Compliance Rate", value: "100%", sublabel: "Strict legal audit" },
      ],
      team: [
        { name: "Iminjonov Muhammadaziz", role: "Founder & Super Admin", avatarUrl: "/images/team-muhammadaziz.jpg" },
        { name: "Sevinchoy Soporboyeva", role: "Co-Founder & Operations", avatarUrl: "/images/team-sevinchoy.jpg" },
        { name: "Abdumanov Akrom", role: "Lead Platform Architect", avatarUrl: "/images/team-akrom.jpg" },
        { name: "Shokhjakhon Abdufattohov", role: "Strategic Adviser", avatarUrl: "/images/team-shohjahon.jpg" },
      ],
      tradingSpecs: [
        { label: "Jurisdiction", value: "Republic of Uzbekistan (14 Regions)" },
        { label: "Regulatory Framework", value: "Law on Electronic Commerce & FinTech Escrow" },
      ],
    },
  };

  const profile = roleProfiles[role] || roleProfiles.farmer;

  // Editable fields state for the "Edit Profile" modal
  const [editFullName, setEditFullName] = useState(profile.fullName);
  const [editTitle, setEditTitle] = useState(profile.title);
  const [editLocation, setEditLocation] = useState(profile.location);
  const [editBio, setEditBio] = useState(profile.bio);
  const [editPhone, setEditPhone] = useState(profile.phone);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    profile.fullName = editFullName;
    profile.title = editTitle;
    profile.location = editLocation;
    profile.bio = editBio;
    profile.phone = editPhone;
    setIsEditModalOpen(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const roleConfig = ROLES[role] || ROLES.farmer;

  return (
    <div className="min-h-screen bg-[#EAEFF0] dark:bg-[#0A1318] py-5 px-3 sm:px-6 transition-colors font-sans antialiased">
      {/* Floating Canvas Shell matching Quixotic & TeamHub */}
      <div className="max-w-[1380px] mx-auto bg-white dark:bg-[#101E27] rounded-[36px] shadow-[0_20px_50px_rgba(15,40,30,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-slate-100 dark:border-white/5 p-4 sm:p-8 flex flex-col gap-6">

        {/* 1. TOP HEADER NAVIGATION */}
        <header className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-white/5">
          <Link href={`/dashboard/${role}`} className="flex items-center shrink-0">
            <ZaminFlowLogo size="md" />
          </Link>

          {/* Nav pill tabs */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-xs font-semibold">
            <Link
              href={`/dashboard/${role}`}
              className="px-4 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition"
            >
              ← Back to Dashboard
            </Link>
            <span className="px-4 py-1.5 rounded-full bg-[#087a3c] text-white shadow-xs font-bold">
              Partner Profile
            </span>
            <Link
              href={role === "dairy" ? "/dashboard/dairy/orders" : "/dashboard/farmer/my-milk"}
              className="px-4 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition"
            >
              Trading Pipeline
            </Link>
            <Link
              href={role === "dairy" ? "/dashboard/dairy/escrow" : "/dashboard/farmer/payouts"}
              className="px-4 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition"
            >
              Escrow Custody
            </Link>
          </nav>

          {/* Right Action: Locale, Theme Mode Toggle & Role Badge */}
          <div className="flex items-center gap-3">
            <div className="flex rounded-full p-0.5 border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-[11px] font-bold">
              {(["uz", "ru", "en"] as const).map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocale(loc)}
                  className={`px-2 py-0.5 rounded-full uppercase transition cursor-pointer ${
                    locale === loc
                      ? "bg-[#12303a] text-white dark:bg-[#1B98E0] dark:text-[#13293D]"
                      : "text-slate-500 hover:text-black dark:hover:text-white"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>

            <ThemeToggleButton size="sm" />

            <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2.5 py-1 whitespace-nowrap">
              {roleConfig.label}
            </span>
          </div>
        </header>

        {/* Success toast */}
        {saveSuccess && (
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between animate-in fade-in">
            <span>✓ Partner profile information saved successfully. Updated in trading directory.</span>
            <button onClick={() => setSaveSuccess(false)} className="text-emerald-700">✕</button>
          </div>
        )}

        {/* 2. HERO COVER BANNER & PROFILE CARD (Matching uploaded image media_1794076111136_441a2250.jpg) */}
        <div className="bg-slate-50 dark:bg-white/5 rounded-[30px] border border-slate-200/70 dark:border-white/10 overflow-hidden shadow-xs">
          
          {/* Cover Landscape Banner */}
          <div className="h-44 sm:h-56 w-full relative overflow-hidden bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-950">
            <img
              src="/images/hero-ecosystem-3d.jpg"
              alt="Agritech Ecosystem Cover"
              className="w-full h-full object-cover opacity-60 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white font-mono text-[11px] font-semibold flex items-center gap-1.5 border border-white/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live on ZaminFlow Directory
              </span>
            </div>
          </div>

          {/* Profile Header Row with Overlapping Avatar */}
          <div className="px-6 sm:px-10 pb-7 pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 -mt-16 sm:-mt-20">
              
              {/* Left: Avatar + Identity */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-5">
                <div className="relative inline-block">
                  <div className="w-28 sm:w-32 h-28 sm:h-32 rounded-full border-4 border-white dark:border-slate-900 shadow-xl overflow-hidden bg-gradient-to-tr from-emerald-700 to-teal-500 flex items-center justify-center">
                    {profile.avatarUrl && !avatarLoadError ? (
                      <img
                        src={profile.avatarUrl}
                        alt={profile.fullName}
                        className="w-full h-full object-cover object-[center_18%]"
                        onError={() => setAvatarLoadError(true)}
                      />
                    ) : (
                      <span className="text-3xl font-extrabold text-white tracking-wider">
                        {getDisplayInitials(profile.fullName)}
                      </span>
                    )}
                  </div>
                  {/* Verified check badge */}
                  <div className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs" title="Certified KYB Partner">
                    ✓
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {profile.fullName}
                    </h1>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-full px-2.5 py-0.5">
                      {profile.kybVerified ? "Verified Partner" : "Verification In Progress"}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {profile.title} &bull; <strong className="text-slate-700 dark:text-slate-300">{profile.organizationName}</strong>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1 font-medium">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{profile.location}</span>
                  </p>
                </div>
              </div>

              {/* Right: Action Buttons & Communication Icons */}
              <div className="flex items-center gap-2.5 self-start sm:self-end pt-2">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-300 dark:border-white/20 bg-white dark:bg-white/5 text-slate-800 dark:text-white font-bold text-xs hover:bg-slate-50 dark:hover:bg-white/10 transition shadow-xs cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Profile</span>
                </button>

                <a
                  href={`tel:${profile.phone}`}
                  className="p-2.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:text-emerald-700 transition cursor-pointer"
                  title="Call Hotline"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </a>

                <a
                  href={`mailto:${profile.email}`}
                  className="p-2.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:text-emerald-700 transition cursor-pointer"
                  title="Send Verified Inquiry"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </a>

                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`p-2.5 rounded-full border transition cursor-pointer ${
                    isBookmarked
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10"
                  }`}
                  title={isBookmarked ? "Saved in Preferred Partners" : "Bookmark Partner"}
                >
                  <svg className="w-4 h-4" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>

            </div>

            {/* Profile Navigation Tabs (Matching image) */}
            <div className="flex items-center gap-6 mt-8 pt-4 border-t border-slate-200/60 dark:border-white/10 text-xs font-bold overflow-x-auto">
              <button
                onClick={() => setActiveTab("overview")}
                className={`pb-2 transition whitespace-nowrap cursor-pointer ${
                  activeTab === "overview"
                    ? "text-[#087a3c] dark:text-[#22d36b] border-b-2 border-[#087a3c] dark:border-[#22d36b]"
                    : "text-slate-500 hover:text-black dark:hover:text-white"
                }`}
              >
                Overview & Operations
              </button>
              <button
                onClick={() => setActiveTab("specs")}
                className={`pb-2 transition whitespace-nowrap cursor-pointer ${
                  activeTab === "specs"
                    ? "text-[#087a3c] dark:text-[#22d36b] border-b-2 border-[#087a3c] dark:border-[#22d36b]"
                    : "text-slate-500 hover:text-black dark:hover:text-white"
                }`}
              >
                Trading Specs & Quality Benchmark
              </button>
              <button
                onClick={() => setActiveTab("contracts")}
                className={`pb-2 transition whitespace-nowrap cursor-pointer ${
                  activeTab === "contracts"
                    ? "text-[#087a3c] dark:text-[#22d36b] border-b-2 border-[#087a3c] dark:border-[#22d36b]"
                    : "text-slate-500 hover:text-black dark:hover:text-white"
                }`}
              >
                Escrow Track Record
              </button>
              <button
                onClick={() => setActiveTab("team")}
                className={`pb-2 transition whitespace-nowrap cursor-pointer ${
                  activeTab === "team"
                    ? "text-[#087a3c] dark:text-[#22d36b] border-b-2 border-[#087a3c] dark:border-[#22d36b]"
                    : "text-slate-500 hover:text-black dark:hover:text-white"
                }`}
              >
                Management & Operations Team
              </button>
            </div>

          </div>

        </div>

        {/* 3. MAIN CONTENT: 2 COLUMNS (Matching layout of media_1794076111136_441a2250.jpg) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Summary, Offerings ("Ask Me About"), & Track Record (cols 8) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* CARD 1: Operational Summary / About */}
            <div className="bg-slate-50 dark:bg-white/5 rounded-[28px] p-6 sm:p-7 border border-slate-200/70 dark:border-white/10">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/10 mb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Operational Summary & Facility
                </h2>
                <span className="text-[11px] font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                  Certified Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                {profile.bio}
              </p>
            </div>

            {/* CARD 2: Offerings & Capabilities ("Ask Me About" style tags from image) */}
            <div className="bg-slate-50 dark:bg-white/5 rounded-[28px] p-6 sm:p-7 border border-slate-200/70 dark:border-white/10">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/10 mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Verified Capabilities & Offerings
                  </h2>
                  <span className="text-[11px] text-slate-400">
                    What we supply and operational standards for trading partners
                  </span>
                </div>
                <span className="text-xs font-bold bg-[#087a3c] text-white px-2.5 py-0.5 rounded-full">
                  {profile.capabilities.length} Verified
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {profile.capabilities.map((cap, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{cap.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CARD 3: Trading Track Record (Performance Grid) */}
            <div className="bg-slate-50 dark:bg-white/5 rounded-[28px] p-6 sm:p-7 border border-slate-200/70 dark:border-white/10">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/10 mb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Historical Trading & Settlement Performance
                </h2>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  Trust Score: {profile.trustScore} / 100
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {profile.stats.map((st, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/10"
                  >
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      {st.label}
                    </span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1 block">
                      {st.value}
                    </span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold block mt-0.5">
                      {st.sublabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CARD 4: Trading Specifications Table */}
            <div className="bg-slate-50 dark:bg-white/5 rounded-[28px] p-6 sm:p-7 border border-slate-200/70 dark:border-white/10">
              <h2 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-200/60 dark:border-white/10 mb-3">
                Commercial Contract Specifications
              </h2>
              <div className="divide-y divide-slate-200/60 dark:divide-white/5">
                {profile.tradingSpecs.map((spec, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-semibold">{spec.label}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Team Hierarchy & Additional Credentials (cols 4) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* CARD: Operations & Key Management Team (Matching "My Manager" from image) */}
            <div className="bg-slate-50 dark:bg-white/5 rounded-[28px] p-6 border border-slate-200/70 dark:border-white/10">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/10 mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Key Operations Contacts
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">3 Liaisons</span>
              </div>

              <div className="space-y-3.5">
                {profile.team.map((member, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/10 transition hover:border-emerald-300"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-tr from-emerald-700 to-teal-500 flex items-center justify-center shrink-0">
                      {member.avatarUrl && !failedTeamImages[idx] ? (
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          className="w-full h-full object-cover object-[center_18%]"
                          onError={() =>
                            setFailedTeamImages((prev) => ({ ...prev, [idx]: true }))
                          }
                        />
                      ) : (
                        <span className="text-xs font-bold text-white">
                          {getDisplayInitials(member.name)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {member.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {member.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CARD: Additional Entity Details (Matching "Additional Details" from image) */}
            <div className="bg-slate-50 dark:bg-white/5 rounded-[28px] p-6 border border-slate-200/70 dark:border-white/10">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/10 mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Additional Credentials
                </h3>
                <span className="text-[11px] font-mono text-emerald-700">Verified</span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[11px] uppercase font-bold text-slate-400 block">
                    Verified Business Email
                  </span>
                  <a href={`mailto:${profile.email}`} className="font-mono text-emerald-700 dark:text-emerald-400 hover:underline">
                    {profile.email}
                  </a>
                </div>

                <div>
                  <span className="text-[11px] uppercase font-bold text-slate-400 block">
                    Languages Spoken
                  </span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">
                    {profile.languages.join(", ")}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] uppercase font-bold text-slate-400 block">
                    Taxpayer Identification (INN)
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {profile.taxId}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] uppercase font-bold text-slate-400 block">
                    Designated Settlement Bank
                  </span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">
                    {profile.bankName}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
                    {profile.iban}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] uppercase font-bold text-slate-400 block">
                    ZaminFlow Member Since
                  </span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">
                    {profile.memberSince}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Verified KYB Status
                      </span>
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        Tier 1 Approved
                      </span>
                    </div>
                    <span className="text-2xl font-black font-mono text-[#087a3c] dark:text-[#22d36b]">
                      {profile.trustScore}
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Edit Partner Profile
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-black dark:hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Name / Primary Contact
                </label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Professional Title / Designation
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Operating Location / District
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Operational Summary & Equipment Bio
                </label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={4}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-normal focus:outline-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Direct Hotline Phone
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-semibold focus:outline-emerald-600"
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-slate-300 text-slate-600 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#087a3c] text-white font-bold hover:bg-[#065F46] transition shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
