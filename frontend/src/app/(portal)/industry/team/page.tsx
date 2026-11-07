"use client";

import React, { useEffect, useState } from "react";
import LockedDashboard from "@/components/LockedDashboard";
import StatusPill from "@/components/ui/StatusPill";
import Button from "@/components/ui/Button";

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  sub_role: "DRIVER" | "LAB_TECH" | "GATE_RECEIVER" | string;
  is_active: boolean;
  status: "Active" | "Invited" | "Deactivated";
  last_sign_in_at?: string | null;
}

export default function IndustryTeamPage() {
  const [me, setMe] = useState<any>(null);
  const [team, setTeam] = useState<TeamMember[]>([
    {
      id: "t1",
      full_name: "Jasur Aliyev",
      email: "jasur.driver@toshkentdairy.uz",
      phone_number: "+998 90 123 45 67",
      sub_role: "DRIVER",
      is_active: true,
      status: "Active",
      last_sign_in_at: "Today 08:30 UZT",
    },
    {
      id: "t2",
      full_name: "Nodira Karimova",
      email: "nodira.lab@toshkentdairy.uz",
      phone_number: "+998 93 456 78 90",
      sub_role: "LAB_TECH",
      is_active: true,
      status: "Active",
      last_sign_in_at: "Today 09:12 UZT",
    },
    {
      id: "t3",
      full_name: "Farrukh Usmonov",
      email: "farrukh.gate@toshkentdairy.uz",
      phone_number: "+998 97 111 22 33",
      sub_role: "GATE_RECEIVER",
      is_active: true,
      status: "Active",
      last_sign_in_at: "Yesterday 18:40 UZT",
    },
    {
      id: "t4",
      full_name: "Sherzod Boboev",
      email: "sherzod.driver@toshkentdairy.uz",
      phone_number: "+998 91 999 88 77",
      sub_role: "DRIVER",
      is_active: true,
      status: "Invited",
      last_sign_in_at: null,
    },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deactivatingMember, setDeactivatingMember] = useState<TeamMember | null>(null);

  // Add member modal/form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+998");
  const [subRole, setSubRole] = useState<"DRIVER" | "LAB_TECH" | "GATE_RECEIVER">("DRIVER");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    return <div className="py-20 text-center text-xs text-slate-500 font-mono">Loading staff directory...</div>;
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

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const newMember: TeamMember = {
        id: `t-${Date.now()}`,
        full_name: fullName,
        email,
        phone_number: phone,
        sub_role: subRole,
        is_active: true,
        status: "Invited",
        last_sign_in_at: null,
      };
      setTeam((prev) => [newMember, ...prev]);
      setShowAddModal(false);
      setFullName("");
      setEmail("");
      setPhone("+998");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDeactivate = () => {
    if (!deactivatingMember) return;
    setTeam((prev) =>
      prev.map((m) =>
        m.id === deactivatingMember.id ? { ...m, is_active: false, status: "Deactivated" } : m
      )
    );
    setDeactivatingMember(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Counter per Section 11.4: Title 'Team', counter '12 of 50', primary 'Add team member' */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Team</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-700">
              12 of 50 members
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-based field access for tanker drivers, gate weighbridge operators, and laboratory technicians.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setShowAddModal(true)}
        >
          + Add team member &rarr;
        </Button>
      </div>

      {/* Staff Table per Section 11.4 */}
      <div className="bg-white rounded-[14px] border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 font-mono text-[10px] text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Staff Member</th>
              <th className="py-3 px-3">Role</th>
              <th className="py-3 px-3">Contact</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3 text-right">Last Sign-In</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {team.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50/60 transition">
                <td className="py-3 px-4">
                  <div className="font-extrabold text-slate-900">{member.full_name}</div>
                  <div className="text-[11px] font-mono text-slate-500">{member.email}</div>
                </td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-mono font-bold text-slate-700">
                    {member.sub_role}
                  </span>
                </td>
                <td className="py-3 px-3 font-mono text-slate-700">
                  {member.phone_number}
                </td>
                <td className="py-3 px-3 text-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                      member.status === "Active"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : member.status === "Invited"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-slate-100 text-slate-400 border-slate-200"
                    }`}
                  >
                    {member.status}
                  </span>
                </td>
                <td className="py-3 px-3 text-right font-mono text-slate-500">
                  {member.last_sign_in_at || "Never"}
                </td>
                <td className="py-3 px-4 text-right space-x-2">
                  {member.status === "Invited" && (
                    <button
                      onClick={() => alert(`Invitation resent to ${member.email}`)}
                      className="text-xs font-bold text-teal-700 hover:underline cursor-pointer"
                    >
                      Resend
                    </button>
                  )}
                  {member.status !== "Deactivated" && (
                    <button
                      onClick={() => setDeactivatingMember(member)}
                      className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                    >
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Member Modal with 3 Radio Cards (Section 11.4) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-float">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">Add Team Member</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jasur Aliyev"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-11 px-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="staff@company.uz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-3 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone (+998) *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 px-3 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Three Radio Cards per Section 11.4 */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Role & Partition Access *
                </label>
                {[
                  {
                    role: "DRIVER" as const,
                    title: "Driver",
                    desc: "Pickup queue, barcode scanning, and farm-to-factory route navigation",
                    icon: "🚚",
                  },
                  {
                    role: "LAB_TECH" as const,
                    title: "Lab Tech",
                    desc: "Spectrometer lab form, fat/SNF entries, and automated payout execution",
                    icon: "🔬",
                  },
                  {
                    role: "GATE_RECEIVER" as const,
                    title: "Gate Receiver",
                    desc: "Weighbridge gross/tare scanning and tanker gate arrival registration",
                    icon: "⚖️",
                  },
                ].map((item) => (
                  <div
                    key={item.role}
                    onClick={() => setSubRole(item.role)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                      subRole === item.role
                        ? "border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500/20"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-xs text-slate-900">{item.title}</span>
                        {subRole === item.role && <span className="text-emerald-700 font-bold text-xs">✓</span>}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={isSubmitting}
                  className="flex-1"
                >
                  Send invitation &rarr;
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate Confirm Dialog per Section 11.4 */}
      {deactivatingMember && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-float">
            <h3 className="text-base font-black text-slate-900">Deactivate Staff Access?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to revoke access for <span className="font-bold">{deactivatingMember.full_name}</span>? This person will be signed out immediately and their cryptographic refresh tokens invalidated.
            </p>
            <div className="flex gap-2 pt-2">
              <Button
                variant="danger"
                size="md"
                onClick={handleConfirmDeactivate}
                className="flex-1"
              >
                Deactivate immediately
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setDeactivatingMember(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
