"use client";

import React, { useState } from "react";
import Link from "next/link";

interface ContactUsSectionProps {
  isDark?: boolean;
}

export default function ContactUsSection({ isDark = false }: ContactUsSectionProps) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.fullName.trim() || !formData.contactInfo.trim() || !formData.message.trim()) {
      setErrorMessage("Please complete all required fields before sending.");
      return;
    }

    if (!formData.agreed) {
      setErrorMessage("Please confirm your consent to the Privacy Policy.");
      return;
    }

    setIsSubmitting(true);

    // Simulate reliable dispatch
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
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
        {/* 1. SECTION HEADER (Centered Overline + Title) */}
        <header className="text-center mb-10 sm:mb-14">
          <div className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#087a3c] dark:text-[#4be08a]">
            Contact us
          </div>
          <h2
            className={`mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.08] ${
              isDark ? "text-white" : "text-[#17352c]"
            }`}
          >
            Let&apos;s talk about your{" "}
            <span className="text-[#087a3c] dark:text-[#4be08a]">dairy supply chain</span>
          </h2>
        </header>

        {/* 2. INQUIRY FORM (.g Glassmorphism Card matching Design Template) */}
        <div
          className={`rounded-[32px] p-7 sm:p-11 transition-all duration-300 shadow-xl border ${
            isDark
              ? "bg-[#13293D]/80 backdrop-blur-md border-white/10 text-white shadow-[0_10px_40px_rgba(0,0,0,0.3)]"
              : "bg-white/80 backdrop-blur-md border-white text-[#17352c] shadow-[0_10px_40px_rgba(20,80,60,0.08)]"
          }`}
        >
          {isSubmitted ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#087a3c]/15 text-[#087a3c] dark:text-[#4be08a] flex items-center justify-center text-2xl font-bold">
                ✓
              </div>
              <h3 className="text-2xl font-bold tracking-tight">Message Sent Successfully</h3>
              <p
                className={`max-w-md text-sm sm:text-base leading-relaxed ${
                  isDark ? "text-white/70" : "text-[#17352c]/80"
                }`}
              >
                Thank you, <strong>{formData.fullName}</strong>. Your inquiry has been routed to our regional supply team. A specialist will follow up shortly.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-6 px-6 py-2.5 rounded-full text-sm font-semibold bg-[#12303a] text-white hover:bg-[#0c2027] transition-colors cursor-pointer"
              >
                Send another message
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
                    Full name
                  </label>
                  <input
                    id="cn"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Your full name"
                    className={`h-[52px] w-full px-4 rounded-[14px] text-base transition-all focus:outline-none focus:ring-2 focus:ring-[#22d36b] ${
                      isDark
                        ? "bg-[#0A1926] border border-white/20 text-white placeholder-white/40"
                        : "bg-white border border-[#6f8a7f] text-[#17352c] placeholder-[#5f7a6f]"
                    }`}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="cp"
                    className="text-sm font-semibold select-none cursor-pointer"
                  >
                    Phone or email
                  </label>
                  <input
                    id="cp"
                    type="text"
                    required
                    value={formData.contactInfo}
                    onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                    placeholder="+998 90 123 45 67"
                    className={`h-[52px] w-full px-4 rounded-[14px] text-base transition-all focus:outline-none focus:ring-2 focus:ring-[#22d36b] ${
                      isDark
                        ? "bg-[#0A1926] border border-white/20 text-white placeholder-white/40"
                        : "bg-white border border-[#6f8a7f] text-[#17352c] placeholder-[#5f7a6f]"
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
                  I am a…
                </label>
                <select
                  id="cr"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className={`h-[52px] w-full px-4 rounded-[14px] text-base transition-all focus:outline-none focus:ring-2 focus:ring-[#22d36b] cursor-pointer ${
                    isDark
                      ? "bg-[#0A1926] border border-white/20 text-white"
                      : "bg-white border border-[#6f8a7f] text-[#17352c]"
                  }`}
                >
                  <option value="Farmer">Farmer</option>
                  <option value="Dairy Industry">Dairy Industry</option>
                  <option value="Driver">Driver</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Row 3: Message Textarea */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="cm"
                  className="text-sm font-semibold select-none cursor-pointer"
                >
                  Message
                </label>
                <textarea
                  id="cm"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we help?"
                  className={`min-h-[130px] p-4 rounded-[14px] text-base resize-y transition-all focus:outline-none focus:ring-2 focus:ring-[#22d36b] ${
                    isDark
                      ? "bg-[#0A1926] border border-white/20 text-white placeholder-white/40"
                      : "bg-white border border-[#6f8a7f] text-[#17352c] placeholder-[#5f7a6f]"
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
                  className="w-5 h-5 rounded mt-0.5 accent-[#12303a] dark:accent-[#087a3c] cursor-pointer flex-shrink-0"
                />
                <span>
                  I agree to the processing of my personal data in line with the{" "}
                  <Link
                    href="#privacy"
                    className="font-bold text-[#087a3c] dark:text-[#4be08a] hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[54px] rounded-full font-bold text-[17px] text-white bg-[#12303a] hover:bg-[#0c2027] active:scale-[0.99] transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending inquiry...</span>
                  </>
                ) : (
                  <span>Send message &rarr;</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
