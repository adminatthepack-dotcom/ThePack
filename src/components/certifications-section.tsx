"use client";

// Manages the user's own certifications: lists them, supports add (file upload
// + metadata) and delete. Used inside /profile/edit.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Certification } from "@/types/database";

export default function CertificationsSection({
  userId,
  initial,
}: {
  userId: string;
  initial: Certification[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for new cert
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issuedDate, setIssuedDate] = useState("");
  const [file, setFile] = useState<File | null>(null);

  function resetForm() {
    setTitle("");
    setIssuer("");
    setIssuedDate("");
    setFile(null);
    setError(null);
  }

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }
    if (!file) {
      setError("Please choose a file to upload.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File must be under 10 MB.");
      return;
    }

    setBusy(true);
    try {
      const certId = crypto.randomUUID();
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
      const filePath = `${userId}/${certId}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("certifications")
        .upload(filePath, file, {
          upsert: false,
          contentType: file.type || undefined,
        });
      if (upErr) throw upErr;

      const {
        data: { publicUrl },
      } = supabase.storage.from("certifications").getPublicUrl(filePath);

      const { error: insertErr } = await supabase
        .from("certifications")
        .insert({
          id: certId,
          profile_id: userId,
          title: title.trim(),
          issuer: issuer.trim() || null,
          issued_date: issuedDate || null,
          file_url: publicUrl,
          file_path: filePath,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type || null,
        });
      if (insertErr) {
        // Best-effort cleanup if DB insert fails after upload.
        await supabase.storage.from("certifications").remove([filePath]);
        throw insertErr;
      }

      resetForm();
      setAdding(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(cert: Certification) {
    if (!confirm(`Delete "${cert.title}"? This can't be undone.`)) return;
    setBusy(true);
    setError(null);
    try {
      await supabase.storage
        .from("certifications")
        .remove([cert.file_path]);
      const { error: delErr } = await supabase
        .from("certifications")
        .delete()
        .eq("id", cert.id);
      if (delErr) throw delErr;
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {initial.length === 0 && !adding && (
        <p className="text-sm text-neutral-600">
          No documents yet. Add a resume, certification, license, or anything
          else you want visible on your profile.
        </p>
      )}

      {initial.length > 0 && (
        <ul className="divide-y divide-neutral-200 rounded-md border border-neutral-200 bg-white">
          {initial.map((c) => (
            <li
              key={c.id}
              className="flex items-start justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="font-medium">{c.title}</div>
                <div className="mt-0.5 text-xs text-neutral-600">
                  {[c.issuer, c.issued_date].filter(Boolean).join(" · ") ||
                    "No issuer/date listed"}
                </div>
                <a
                  href={c.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block truncate text-xs text-neutral-700 underline hover:text-neutral-900"
                >
                  {c.file_name}
                </a>
              </div>
              <button
                type="button"
                onClick={() => onDelete(c)}
                disabled={busy}
                className="shrink-0 text-xs text-red-700 underline hover:text-red-900 disabled:opacity-50"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {!adding && (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-3 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50"
        >
          + Add document
        </button>
      )}

      {adding && (
        <form
          onSubmit={onAdd}
          className="mt-3 space-y-3 rounded-md border border-neutral-200 bg-neutral-50 p-4"
        >
          <div>
            <label className="block text-xs font-medium text-neutral-700">
              Title <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='e.g., "Resume", "NNDDA Narcotics Detection Certification"'
              className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-neutral-700">
                Issuer <span className="text-neutral-400">(optional)</span>
              </label>
              <input
                type="text"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="e.g., NNDDA"
                className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700">
                Date <span className="text-neutral-400">(optional)</span>
              </label>
              <input
                type="date"
                value={issuedDate}
                onChange={(e) => setIssuedDate(e.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700">
              File <span className="text-red-700">*</span>
            </label>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1 w-full text-sm"
            />
            <p className="mt-1 text-xs text-neutral-500">
              PDF or image. Max 10 MB.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
            >
              {busy ? "Uploading…" : "Save document"}
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                resetForm();
              }}
              disabled={busy}
              className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
