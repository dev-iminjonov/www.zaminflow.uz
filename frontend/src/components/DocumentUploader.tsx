"use client";

import React, { useRef, useState } from "react";

interface DocumentUploaderProps {
  docType: string;
  title?: string;
  label?: string;
  description?: string;
  existingFilename?: string | null;
  uploadedAt?: string | null;
  disabled?: boolean;
  onUploaded?: () => void;
  onDeleted?: () => void;
}

export default function DocumentUploader({
  docType,
  title,
  label,
  description,
  existingFilename,
  uploadedAt,
  disabled = false,
  onUploaded,
  onDeleted,
}: DocumentUploaderProps) {
  const displayTitle = title || label || docType;
  const displayDescription = description || "PDF, JPG, or PNG up to 5 MB.";
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5242880) {
      setErrorMsg("File size exceeds maximum 5 MB limit");
      return;
    }

    const validExtensions = [".pdf", ".jpg", ".jpeg", ".png"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!validExtensions.includes(ext)) {
      setErrorMsg("Unsupported file format. Please upload PDF, JPG or PNG.");
      return;
    }

    setErrorMsg(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/v1/profile/documents?doc_type=${encodeURIComponent(docType)}`, {
        method: "POST",
        body: formData,
        headers: {
          // fetch automatically sets boundary
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to upload document");
      }

      if (onUploaded) onUploaded();
    } catch (err: any) {
      setErrorMsg(err.message || "Upload error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    if (disabled) return;
    try {
      const res = await fetch(`/api/v1/profile/documents/${encodeURIComponent(docType)}`, {
        method: "DELETE",
      });
      if (res.ok && onDeleted) onDeleted();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete document");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-bold text-sm text-slate-900">{displayTitle}</div>
          <div className="text-xs text-slate-500 mt-0.5">{displayDescription}</div>
        </div>
        {existingFilename ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            ✓ Verified File
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
            Required
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
          ⚠️ {errorMsg}
        </div>
      )}

      {existingFilename ? (
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-lg">📄</span>
            <div className="truncate">
              <span className="font-mono font-medium text-slate-800">{existingFilename}</span>
              {uploadedAt && (
                <span className="block text-[10px] text-slate-400">
                  Uploaded: {new Date(uploadedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleDelete}
              className="text-xs font-semibold text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition"
            >
              Remove
            </button>
          )}
        </div>
      ) : (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            disabled={disabled || isUploading}
            className="hidden"
          />
          <button
            type="button"
            disabled={disabled || isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 border-2 border-dashed border-slate-300 hover:border-cyan-500 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-600 hover:text-cyan-700 transition bg-slate-50/50 hover:bg-cyan-50/20 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            <span className="text-lg">📁</span>
            <span className="text-xs font-semibold">
              {isUploading ? "Uploading document..." : "Click to select document (PDF, JPG, PNG up to 5 MB)"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
