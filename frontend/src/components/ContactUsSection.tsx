"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface ContactUsSectionProps {
  isDark?: boolean;
}

export default function ContactUsSection({ isDark = false }: ContactUsSectionProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    fullName: "",
    contactInfo: "",
    role: "Farmer",
    message: "",
    agreed: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.fullName.trim() || !formData.contactInfo.trim() || !formData.message.trim()) {
      setErrorMessage(t.contact.requiredError);
      return;
    }

    if (!formData.agreed) {
      setErrorMessage(t.contact.consentError);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/v1/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.fullName,
          contact_info: formData.contactInfo,
          role: formData.role,
          message: formData.message,
          consent: formData.agreed,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || "Failed to submit inquiry");
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: "",
      contactInfo: "",
      role: "Farmer",
      message: "",
      agreed: false,
    });
    setIsSubmitted(false);
    setErrorMessage(null);
  };

  return (
    <section
      id="contact"
      className="relative w-full py-20 sm:py-28 overflow-hidden select-none transition-colors duration-500"
    >
      <div className="max-w-[760px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. SECTION HEADER (Centered Overline) */}
        <header className="text-center mb-6 sm:mb-8">
          <div className="text-sm sm:text-base font-bold tracking-[0.08em] uppercase text-[#2d6a4f] dark:text-[#4be08a]">
            {t.contact.badge}
          </div>
        </header>

        {/* 2. INQUIRY FORM (.g Glassmorphism Card matching Design Template) */}
        <div
          className={`rounded-[32px] p-7 sm:p-11 transition-all duration-300 shadow-xl border ${
            isDark
              ? "bg-[#13293D]/80 backdrop-blur-md border-white/10 text-white shadow-[0_10px_40px_rgba(0,0,0,0.3)]"
              : "bg-white/85 backdrop-blur-md border border-[#b7e4c7] text-[#081c15] shadow-[0_10px_40px_rgba(8,28,21,0.06)]"
          }`}
        >
          {isSubmitted ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#52b788]/15 text-[#2d6a4f] dark:text-[#4be08a] flex items-center justify-center text-2xl font-bold">
                ✓
              </div>
              <h3 className="text-2xl font-bold tracking-tight">
                {t.contact.successTitle}
              </h3>
              <p
                className={`max-w-md text-sm sm:text-base leading-relaxed ${
                  isDark ? "text-white/70" : "text-[#2d6a4f]"
                }`}
              >
                {t.contact.successDesc}
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-6 px-6 py-2.5 rounded-full text-sm font-semibold bg-[#1b4332] text-white hover:bg-[#2d6a4f] transition-colors cursor-pointer"
              >
                {t.contact.sendAnother}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {errorMessage && (
                <div className="p-3.5 rounded-xl text-xs sm:text-sm font-medium bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
                  {errorMessage}
                </div>
              )}

              {/* Row 1: Full name & Phone/Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="cn"
                    className="text-sm font-semibold select-none cursor-pointer"
                  >
                    {t.contact.fullName}
                  </label>
                  <input
                    id="cn"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder={t.contact.fullNamePlaceholder}
                    className={`h-[52px] w-full px-4 rounded-[14px] text-base transition-all focus:outline-none focus:ring-2 focus:ring-[#52b788] ${
                      isDark
                        ? "bg-[#0A1926] border border-white/20 text-white placeholder-white/40"
                        : "bg-white border border-[#95d5b2] text-[#081c15] placeholder-[#40916c]/70"
                    }`}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="cp"
                    className="text-sm font-semibold select-none cursor-pointer"
                  >
                    {t.contact.phoneOrEmail}
                  </label>
                  <input
                    id="cp"
                    type="text"
                    required
                    value={formData.contactInfo}
                    onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                    placeholder={t.contact.phoneOrEmailPlaceholder}
                    className={`h-[52px] w-full px-4 rounded-[14px] text-base transition-all focus:outline-none focus:ring-2 focus:ring-[#52b788] ${
                      isDark
                        ? "bg-[#0A1926] border border-white/20 text-white placeholder-white/40"
                        : "bg-white border border-[#95d5b2] text-[#081c15] placeholder-[#40916c]/70"
                    }`}
                  />
                </div>
              </div>

              {/* Row 2: Role selector */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="cr"
                  className="text-sm font-semibold select-none cursor-pointer"
                >
                  {t.contact.roleLabel}
                </label>
                <select
                  id="cr"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className={`h-[52px] w-full px-4 rounded-[14px] text-base transition-all focus:outline-none focus:ring-2 focus:ring-[#52b788] cursor-pointer ${
                    isDark
                      ? "bg-[#0A1926] border border-white/20 text-white"
                      : "bg-white border border-[#95d5b2] text-[#081c15]"
                  }`}
                >
                  <option value="Farmer">{t.contact.roles.farmer}</option>
                  <option value="Dairy Industry">{t.contact.roles.dairy}</option>
                  <option value="Driver">{t.contact.roles.driver}</option>
                  <option value="Other">{t.contact.roles.other}</option>
                </select>
              </div>

              {/* Row 3: Message Textarea */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="cm"
                  className="text-sm font-semibold select-none cursor-pointer"
                >
                  {t.contact.message}
                </label>
                <textarea
                  id="cm"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={t.contact.messagePlaceholder}
                  className={`min-h-[130px] p-4 rounded-[14px] text-base resize-y transition-all focus:outline-none focus:ring-2 focus:ring-[#52b788] ${
                    isDark
                      ? "bg-[#0A1926] border border-white/20 text-white placeholder-white/40"
                      : "bg-white border border-[#95d5b2] text-[#081c15] placeholder-[#40916c]/70"
                  }`}
                />
              </div>

              {/* Consent Checkbox */}
              <label className="flex items-start gap-2.5 text-xs sm:text-sm font-medium leading-relaxed select-none cursor-pointer pt-1">
                <input
                  type="checkbox"
                  required
                  checked={formData.agreed}
                  onChange={(e) => setFormData({ ...formData, agreed: e.target.checked })}
                  className="w-5 h-5 rounded mt-0.5 accent-[#1b4332] dark:accent-[#087a3c] cursor-pointer flex-shrink-0"
                />
                <span>
                  {t.contact.consent}
                  <Link
                    href="/privacy"
                    className="font-bold text-[#087a3c] dark:text-[#4be08a] hover:underline"
                  >
                    {t.contact.privacyPolicy}
                  </Link>
                </span>
              </label>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[54px] rounded-full font-bold text-[17px] text-white bg-[#1b4332] hover:bg-[#2d6a4f] active:scale-[0.99] transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t.contact.submitting}</span>
                  </>
                ) : (
                  <span>{t.contact.submitBtn}</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
