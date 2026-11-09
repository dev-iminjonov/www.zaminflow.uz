"use client";

import React, { useState } from "react";
import { AuthSession } from "@/lib/auth";
import { resolveUserAvatar } from "@/lib/userAvatar";
import { useLanguage } from "@/context/LanguageContext";

interface B2BProfileWindowProps {
  session: AuthSession | null;
  role: "farmer" | "dairy" | "driver" | "admin" | "bank";
  isDark: boolean;
}

export default function B2BProfileWindow({
  session,
  role,
  isDark,
}: B2BProfileWindowProps) {
  const { locale } = useLanguage();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const L = {
    ru: {
      kybLevel3: "Сертификация KYB Level-3",
      editProfile: "Редактировать профиль",
      legalInfo: "Юридическая и контактная информация",
      edit: "Изменить",
      legalName: "Юридическое наименование",
      email: "Электронная почта",
      phone: "Телефон",
      website: "Веб-сайт",
      taxId: "ИНН (STIR)",
      bankIban: "Расчетный счет (IBAN)",
      region: "Регион и адрес",
      slogan: "Миссия компании",
      activityOverview: "Операционные показатели и аудит",
      totalVolume: "Общий объем",
      activeContracts: "Активные договоры",
      auditTrail: "Аудит действий",
      recentActivities: "Недавняя активность",
      uploadNewAvatar: "Загрузить фото",
      saveChanges: "Сохранить и обновить",
      cancel: "Отмена",
    },
    en: {
      kybLevel3: "KYB Level-3 Certified",
      editProfile: "Edit Profile",
      legalInfo: "Legal & Contact Information",
      edit: "Edit",
      legalName: "Legal Entity Name",
      email: "Email Address",
      phone: "Contact Phone",
      website: "Website",
      taxId: "Tax ID (TIN/STIR)",
      bankIban: "Bank Settlement IBAN",
      region: "Region & Address",
      slogan: "Corporate Slogan",
      activityOverview: "Operational Stats & Audit",
      totalVolume: "Total Volume",
      activeContracts: "Active Contracts",
      auditTrail: "Audit Trail",
      recentActivities: "Recent Activity Log",
      uploadNewAvatar: "Upload New Avatar",
      saveChanges: "Save & Update",
      cancel: "Cancel",
    },
    uz: {
      kybLevel3: "KYB Level-3 Sertifikatlangan",
      editProfile: "Profilni Tahrirlash",
      legalInfo: "Yuridik & Aloqa Maʼlumotlari",
      edit: "Tahrirlash",
      legalName: "Tashkilot Yuridik Nomi",
      email: "Elektron Pochta",
      phone: "Aloqa Telefoni",
      website: "Veb-sayt",
      taxId: "STIR (INN)",
      bankIban: "Hisob-raqam (IBAN)",
      region: "Hudud va Manzil",
      slogan: "Korxona Shiori",
      activityOverview: "Operatsion Körsatkiçlar & Hamyon",
      totalVolume: "Jami Hajm",
      activeContracts: "Faol Shartnomalar",
      auditTrail: "Audit Jurnali",
      recentActivities: "Sönggi Faoliyat Tarixi",
      uploadNewAvatar: "Yangi Rasm Yuklash",
      saveChanges: "Saqlash va Yangilash",
      cancel: "Bekor qilish",
    },
  }[locale] || {
    kybLevel3: "KYB Level-3 Certified",
    editProfile: "Edit Profile",
    legalInfo: "Legal & Contact Information",
    edit: "Edit",
    legalName: "Legal Entity Name",
    email: "Email Address",
    phone: "Contact Phone",
    website: "Website",
    taxId: "Tax ID (TIN/STIR)",
    bankIban: "Bank Settlement IBAN",
    region: "Region & Address",
    slogan: "Corporate Slogan",
    activityOverview: "Operational Stats & Audit",
    totalVolume: "Total Volume",
    activeContracts: "Active Contracts",
    auditTrail: "Audit Trail",
    recentActivities: "Recent Activity Log",
    uploadNewAvatar: "Upload New Avatar",
    saveChanges: "Save & Update",
    cancel: "Cancel",
  };

  // Profile Form States
  const [fullName, setFullName] = useState(session?.user?.fullName || "Muhammadaziz Iminjonov");
  const [title, setTitle] = useState(
    role === "farmer"
      ? "Bosh Fermer & Ta'sischi"
      : role === "dairy"
      ? "Texnik Boshqaruvchi"
      : role === "driver"
      ? "Logistika Yetkazib Beruvchi"
      : role === "bank"
      ? "Eskrou Bank Ofitseri"
      : "Bosh Administrator"
  );
  const [email, setEmail] = useState(session?.user?.email || "info@zaminflow.uz");
  const [phone, setPhone] = useState(session?.user?.phoneNumber || "+998 90 123 45 67");
  const [region, setRegion] = useState("Toshkent viloyati, Parkent tumani");
  const [slogan, setSlogan] = useState(
    "Milliy oziq-ovqat xavfsizligi va şaffof sut zanjirini raqamlaştiriş böyiça işonçli hamkor."
  );
  const [website, setWebsite] = useState("https://zaminflow.uz");
  const [taxId, setTaxId] = useState(session?.organization?.taxId || "309845120");
  const [bankIban, setBankIban] = useState("UZ24 0001 4000 0002 6000 1234 567");
  const [avatarUrl, setAvatarUrl] = useState(
    resolveUserAvatar(session?.user?.fullName, session?.user?.email) ||
      "/images/team-muhammadaziz.webp"
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditModalOpen(false);
    showToast("Profil ma'lumotlari muvaffaqiyatli yangilandi.");
  };

  // Role-Specific Cover Banner Backgrounds
  const coverGradients: Record<string, string> = {
    farmer: "from-emerald-700 via-teal-800 to-slate-900",
    dairy: "from-sky-700 via-blue-800 to-indigo-950",
    driver: "from-amber-700 via-orange-800 to-stone-900",
    admin: "from-slate-800 via-slate-900 to-emerald-950",
    bank: "from-indigo-900 via-slate-900 to-teal-950",
  };

  const coverGradient = coverGradients[role] || coverGradients.admin;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#14181d] text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-emerald-500/30 animate-in fade-in">
          <span className="text-emerald-400">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          1. PANORAMIC COVER BANNER & AVATAR (Matches Reference 1: media_1794212998246_0f7b2166.jpg)
      ========================================================================= */}
      <div className={`rounded-3xl border overflow-hidden transition shadow-sm ${
        isDark ? "bg-[#14181d] border-white/10" : "bg-white border-slate-200"
      }`}>
        {/* Panoramic Banner */}
        <div className={`h-40 sm:h-52 w-full bg-gradient-to-r ${coverGradient} relative p-6 flex flex-col justify-end overflow-hidden`}>
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/20">
              {role.toUpperCase()} AKKREDITATSIYASI
            </span>
          </div>
        </div>

        {/* Profile Header Details Bar */}
        <div className="px-6 sm:px-8 pb-6 pt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-5">
            {/* Circular Avatar + Green Verified Dot */}
            <div className="relative shrink-0">
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-white dark:ring-[#14181d] shadow-lg bg-slate-100"
              />
              <span
                className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#14181d] flex items-center justify-center text-white text-[10px]"
                title="KYB Darajasi Tasdiqlangan"
              >
                ✓
              </span>
            </div>

            {/* Name + Badges */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {fullName}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-500/30">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  {L.kybLevel3}
                </span>
              </div>

              <p className="text-xs font-semibold text-slate-500 dark:text-white/60 flex items-center gap-2">
                <span>{title}</span>
                <span>•</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">STIR: {taxId}</span>
                <span>•</span>
                <span>{region}</span>
              </p>
            </div>
          </div>

          {/* Edit Profile Button */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-xs transition cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>{L.editProfile}</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. TWO-CARD CONTENT LAYOUT (Matches Reference 1: Personal & Activity Cards)
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CARD A: Personal & Corporate Information (6 Cols) */}
        <div className={`lg:col-span-6 p-6 sm:p-7 rounded-3xl border transition shadow-sm ${
          isDark ? "bg-[#14181d] border-white/10" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {L.legalInfo}
            </h3>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              {L.edit}
            </button>
          </div>

          <div className="mt-5 space-y-4 text-xs">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-white/40 block">
                {L.legalName}
              </span>
              <span className="font-bold text-slate-800 dark:text-white mt-0.5 block">
                {session?.organization?.legalName || "ZaminFlow Agrosanoat MCHJ"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-white/40 block">
                  {L.email}
                </span>
                <a href={`mailto:${email}`} className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline mt-0.5 block truncate">
                  {email}
                </a>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-white/40 block">
                  {L.phone}
                </span>
                <span className="font-semibold text-slate-800 dark:text-white mt-0.5 block">
                  {phone}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-white/40 block">
                {L.website}
              </span>
              <a href={website} target="_blank" rel="noreferrer" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline mt-0.5 block">
                {website}
              </a>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-3">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-white/40 block">
                  Bank IBAN Hisob Raqami
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-white mt-0.5 block">
                  {bankIban}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-white/40 block">
                  Korxona Shiori / Tavsifi
                </span>
                <p className="font-medium text-slate-600 dark:text-white/70 mt-1 leading-relaxed">
                  "{slogan}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CARD B: Operational Telemetry & Activity Overview (6 Cols) */}
        <div className={`lg:col-span-6 p-6 sm:p-7 rounded-3xl border transition shadow-sm ${
          isDark ? "bg-[#14181d] border-white/10" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {L.activityOverview}
            </h3>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
              Onlayn
            </span>
          </div>

          {/* 3 Metric Pills */}
          <div className="grid grid-cols-3 gap-3 my-5">
            <div className={`p-3.5 rounded-2xl border text-center ${
              isDark ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-200/60"
            }`}>
              <div className="text-lg font-black text-slate-900 dark:text-white">99.4%</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                Ishonch Balli
              </div>
            </div>

            <div className={`p-3.5 rounded-2xl border text-center ${
              isDark ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-200/60"
            }`}>
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">Level 3</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                KYB Status
              </div>
            </div>

            <div className={`p-3.5 rounded-2xl border text-center ${
              isDark ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-200/60"
            }`}>
              <div className="text-lg font-black text-slate-900 dark:text-white">2026</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                A'zolik
              </div>
            </div>
          </div>

          {/* Ledger Audit Log Trail */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/40 mb-3">
              So'nggi Tizim Loglari & Harakatlar
            </h4>
            <div className="space-y-3">
              {[
                { title: "KYB Darajasi Yangilandi", desc: "Toşkent Davlat Veterinariya qömitasi reyestri böyiça tasdiqlandi", time: "2 soat oldin" },
                { title: "Eskrou Hamyon Kliringi", desc: "Elektron tijorat tölov şlyuziga muvaffaqiyatli ulandi", time: "Kecha" },
                { title: "Xavfsizlik Sertifikati Faollashdi", desc: "Ikki bosqichli autentifikatsiya (2FA) yoqildi", time: "3 kun oldin" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start justify-between gap-3 text-xs py-1.5 border-b border-slate-100 dark:border-white/5 last:border-0">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white block">{item.title}</span>
                    <span className="text-[11px] text-slate-500 dark:text-white/50 block mt-0.5">{item.desc}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* =========================================================================
          3. THREE-COLUMN EDIT PROFILE MODAL (Matches Reference 2: media_1794213030540_a27ede75.jpg)
      ========================================================================= */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className={`w-full max-w-4xl rounded-3xl border shadow-2xl overflow-hidden transition animate-in zoom-in-95 ${
            isDark ? "bg-[#14181d] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            
            {/* Modal Header */}
            <div className="px-6 sm:px-8 py-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black tracking-tight">
                  Tashkilot va Shaxsiy Profilni Tahrirlash
                </h3>
                <p className="text-xs text-slate-500 dark:text-white/50 mt-0.5">
                  B2B rekvizitlar va mas'ul shaxs sozlamalarini yangilang.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Form: 3 Columns Grid */}
            <form onSubmit={handleSaveProfile} className="p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Column 1: Avatar & Slogan (3.5 Cols) */}
                <div className="md:col-span-4 flex flex-col items-center text-center border-b md:border-b-0 md:border-r border-slate-100 dark:border-white/10 pb-6 md:pb-0 md:pr-6">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                    {locale === "ru" ? "Ваш профиль" : locale === "en" ? "Your Profile" : "Sizning Profilingiz"}
                  </span>
                  <div className="relative mb-3">
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-cover ring-4 ring-emerald-500/20 shadow-md bg-slate-100"
                    />
                  </div>
                  <h4 className="font-bold text-sm">{fullName}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{title}</p>

                  <div className="mt-4 w-full">
                    <button
                      type="button"
                      onClick={() => alert("Avatar yuklash funksiyasi faollashtirildi.")}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                    >
                      {L.uploadNewAvatar}
                    </button>
                  </div>

                  <div className="mt-6 w-full text-left">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      {L.slogan}
                    </label>
                    <textarea
                      value={slogan}
                      onChange={(e) => setSlogan(e.target.value)}
                      rows={3}
                      className={`w-full p-2.5 rounded-xl text-xs border transition ${
                        isDark ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                      } focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                    />
                  </div>
                </div>

                {/* Column 2: Personal & Contact Settings (4.5 Cols) */}
                <div className="md:col-span-4 space-y-3.5 border-b md:border-b-0 md:border-r border-slate-100 dark:border-white/10 pb-6 md:pb-0 md:pr-6">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Mas'ul Shaxs Sozlamalari
                  </span>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-white/60 block mb-1">
                      To'liq Ism (F.I.SH.)
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs border ${
                        isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                      } focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-white/60 block mb-1">
                      Lavozim
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs border ${
                        isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                      } focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-white/60 block mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs border ${
                        isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                      } focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-white/60 block mb-1">
                      Aloqa Telefoni
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs border ${
                        isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                      } focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-white/60 block mb-1">
                      Viloyat / Tuman
                    </label>
                    <input
                      type="text"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs border ${
                        isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                      } focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                    />
                  </div>
                </div>

                {/* Column 3: Corporate & Financial Details (4 Cols) */}
                <div className="md:col-span-4 space-y-3.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Yuridik & Bank Rekvizitlari
                  </span>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-white/60 block mb-1">
                      STIR (INN) Raqami
                    </label>
                    <input
                      type="text"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-mono font-bold border ${
                        isDark ? "bg-white/5 border-white/10 text-emerald-400" : "bg-slate-50 border-slate-200 text-emerald-700"
                      } focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-white/60 block mb-1">
                      Bank Hisob Raqami (IBAN)
                    </label>
                    <input
                      type="text"
                      value={bankIban}
                      onChange={(e) => setBankIban(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-mono border ${
                        isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                      } focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-white/60 block mb-1">
                      Rasmiy Veb-Sayt
                    </label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs border ${
                        isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                      } focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs font-bold shadow-md transition cursor-pointer"
                    >
                      {L.saveChanges}
                    </button>
                  </div>
                </div>

              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
