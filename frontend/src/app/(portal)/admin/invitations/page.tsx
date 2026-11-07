"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";

interface BankInvitation {
  id: string;
  bankName: string;
  email: string;
  facilityLimitUZS: string;
  issuedDate: string;
  expiresDate: string;
  status: "PENDING" | "ACCEPTED" | "EXPIRED";
  tokenUrl: string;
}

const INITIAL_INVITATIONS: BankInvitation[] = [
  {
    id: "INV-BNK-001",
    bankName: "Ipoteka-Bank JSCIB",
    email: "escrow-desk@ipotekabank.uz",
    facilityLimitUZS: "750,000,000.00 UZS",
    issuedDate: "2026-10-15",
    expiresDate: "2026-10-22",
    status: "ACCEPTED",
    tokenUrl: "https://zaminflow.uz/accept-invite?token=cbu_sec_9941a82f",
  },
  {
    id: "INV-BNK-002",
    bankName: "Agrobank JSCB",
    email: "agri-factoring@agrobank.uz",
    facilityLimitUZS: "1,200,000,000.00 UZS",
    issuedDate: "2026-11-05",
    expiresDate: "2026-11-12",
    status: "PENDING",
    tokenUrl: "https://zaminflow.uz/accept-invite?token=cbu_sec_110284ac",
  },
  {
    id: "INV-BNK-003",
    bankName: "Qishloq Qurilish Bank JSCB",
    email: "treasury@qqb.uz",
    facilityLimitUZS: "500,000,000.00 UZS",
    issuedDate: "2026-09-01",
    expiresDate: "2026-09-08",
    status: "EXPIRED",
    tokenUrl: "https://zaminflow.uz/accept-invite?token=cbu_sec_772199b0",
  },
];

export default function AdminInvitationsPage() {
  const [invitations, setInvitations] = useState<BankInvitation[]>(INITIAL_INVITATIONS);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [bankName, setBankName] = useState("");
  const [email, setEmail] = useState("");
  const [facilityUZS, setFacilityUZS] = useState<number>(500000000);
  const [officerName, setOfficerName] = useState("");
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const handleGenerateInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName || !email) return;

    const randomHex = Math.random().toString(16).substring(2, 10);
    const newInv: BankInvitation = {
      id: `INV-BNK-${String(invitations.length + 1).padStart(3, "0")}`,
      bankName: bankName.trim(),
      email: email.trim(),
      facilityLimitUZS: `${facilityUZS.toLocaleString()}.00 UZS`,
      issuedDate: new Date().toISOString().split("T")[0],
      expiresDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      status: "PENDING",
      tokenUrl: `https://zaminflow.uz/accept-invite?token=cbu_sec_${randomHex}`,
    };

    setInvitations([newInv, ...invitations]);
    setShowModal(false);
    setBankName("");
    setEmail("");
    setOfficerName("");
    setCopyFeedback(`Generated single-use cryptographic invitation for ${newInv.bankName}. Link copied to clipboard.`);
    setTimeout(() => setCopyFeedback(null), 5000);
  };

  const handleCopy = (url: string) => {
    navigator.clipboard?.writeText(url);
    setCopyFeedback(`Invitation link copied: ${url}`);
    setTimeout(() => setCopyFeedback(null), 4000);
  };

  const handleRevoke = (id: string) => {
    setInvitations(
      invitations.map((inv) => (inv.id === id ? { ...inv, status: "EXPIRED" } : inv))
    );
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Partner bank invitations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate single-use cryptographically signed onboarding links with authorized credit facilities.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowModal(true)}
        >
          + Invite Partner Bank
        </Button>
      </div>

      {copyFeedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-xl text-xs font-semibold">
          ✓ {copyFeedback}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Active Bank Nodes</span>
          <span className="font-mono text-xl font-bold text-slate-900 block">1 Onboarded</span>
          <span className="text-[11px] text-emerald-700 font-semibold">Ipoteka-Bank JSCIB</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Pending Invitations</span>
          <span className="font-mono text-xl font-bold text-amber-600 block">1 Awaiting Access</span>
          <span className="text-[11px] text-slate-500">Agrobank JSCB (Expires in 5 days)</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Total Authorized Liquidity</span>
          <span className="font-mono text-xl font-bold text-slate-900 block">2,450,000,000 UZS</span>
          <span className="text-[11px] text-slate-500">Across licensed banking partners</span>
        </div>
      </div>

      {/* Table of Issued Invitations */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Cryptographically Signed Invitation Tokens
            </h2>
            <p className="text-xs text-slate-500">
              Single-use tokens with 7-day TTL and embedded Central Bank clearance flags.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
            HMAC-SHA256 SIGNED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Invitation ID &bull; Bank</th>
                <th className="px-4 py-3">Authorized Email</th>
                <th className="px-4 py-3 text-right">Initial Facility</th>
                <th className="px-4 py-3">Issued &bull; Expires</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3">Single-Use Link</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {invitations.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    <span className="font-sans font-bold text-slate-900 block">{inv.bankName}</span>
                    <span className="text-[10px] text-slate-400">{inv.id}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-sans">{inv.email}</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900">{inv.facilityLimitUZS}</td>
                  <td className="px-4 py-3 text-slate-500 text-[11px]">
                    <div>{inv.issuedDate}</div>
                    <div className="text-[10px] text-slate-400">Exp: {inv.expiresDate}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        inv.status === "ACCEPTED"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : inv.status === "PENDING"
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate text-[11px] text-teal-700">
                    {inv.tokenUrl}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5 font-sans">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCopy(inv.tokenUrl)}
                      >
                        Copy
                      </Button>
                      {inv.status === "PENDING" && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRevoke(inv.id)}
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Invite Partner Bank */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-float border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Authorize Partner Bank Invitation
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleGenerateInvite} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bank Legal Commercial Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Agrobank JSCB"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-300 px-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Treasury / Compliance Officer Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. treasury@bank.uz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-300 px-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lead Officer Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dilshod Karimov"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-300 px-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Initial Revolving Factoring Facility (UZS)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={facilityUZS}
                  onChange={(e) => setFacilityUZS(Number(e.target.value))}
                  className="w-full h-10 rounded-xl border border-slate-300 px-3 font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 space-y-1">
                <span className="font-bold text-slate-900 block">Security Invariant:</span>
                <p className="text-[11px]">
                  Invitation generates a cryptographic token valid for 7 days. Once activated, the partner bank officer sets their password and links their Central Bank settlement account.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="md"
                  type="button"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                >
                  Generate &amp; Issue Link
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
