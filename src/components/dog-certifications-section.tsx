"use client";

// Public certifications for a dog. Anyone can view; only the dog's owner sees
// add/delete controls.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { DogCertification } from "@/types/database";

const inputCls =
  "mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900";

export default function DogCertificationsSection({
  ownerId,
  dogId,
  isOwner,
  initial,
}: {
  ownerId: string;
  dogId: string;
  isOwner: boolean;
  initial: DogCertification[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issuedDate, setIssuedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);

  function reset() {
    setTitle("");
    setIssuer("");
    setIssuedDate("");
    setNotes("");
    setFile(null);
    setError(null);
  }

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (file && file.size > 10 * 1024 * 1024) {
      setError("File must be under 10 MB.");
      return;
    }

    setBusy(true);
    try {
      const certId = crypto.randomUUID();
      let file_path: string | null = null;
      let file_url: string | null = null;
      let file_name: string | null = null;
      let file_size: number | null = null;
      let mime_type: string | null = null;

      if (file) {
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
        const path = `${ownerId}/${dogId}/cert-${certId}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("dog-public")
          .upload(path, file, {
            upsert: false,
            contentType: file.type || undefined,
          });
        if (upErr) throw upErr;
        const {
          data: { publicUrl },
        } = supabase.storage.from("dog-public").getPublicUrl(path);
        file_path = path;
        file_url = publicUrl;
        file_name = file.name;
        file_size = file.size;
        mime_type = file.type || null;
      }

      const { error: dbErr } = await supabase
        .from("dog_certifications")
        .insert({
          id: certId,
          dog_id: dogId,
          title: title.trim(),
          issuer: issuer.trim() || null,
          issued_date: issuedDate || null,
          notes: notes.trim() || null,
          file_url,
          file_path,
          file_name,
          file_size,
          mime_type,
        });

      if (dbErr) {
        if (file_path) {
          await supabase.storage.from("dog-public").remove([file_path]);
        }
        throw dbErr;
      }

      reset();
      setAdding(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add.");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(c: DogCertification) {
    if (!confirm(`Delete "${c.title}"?`)) return;
    setBusy(true);
    setError(null);
    try {
      if (c.file_path) {
        await supabase.storage.from("dog-public").remove([c.file_path]);
      }
      const { error } = await supabase
        .from("dog_certifications")
        .delete()
        .eq("id", c.id);
      if (error) throw error;
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
        <p className="text-sm text-neutral-500">No certifications listed.</p>
      )}

      {initial.length > 0 && (
        <ul className="divide-y divide-neutral-200 rounded-md border border-neutral-200 bg-white">
          {initial.map((c) => (
            <li key={c.id} className="flex items-start justify-between gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="font-medium">{c.title}</div>
                {(c.issuer || c.issued_date) && (
                  <div className="mt-0.5 text-xs text-neutral-600">
                    {[c.issuer, c.issued_date].filter(Boolean).join(" · ")}
                  </div>
                )}
                {c.notes && (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-700">
                    {c.notes}
                  </p>
                )}
                {c.file_url && (
                  <a
                    href={c.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-xs text-neutral-700 underline hover:text-neutral-900"
                  >
                    View document
                  </a>
                )}
              </div>
              {isOwner && (
                <button
                  type="button"
                  onClick={() => onDelete(c)}
                  disabled={busy}
                  className="shrink-0 text-xs text-red-700 underline hover:text-red-900 disabled:opacity-50"
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {isOwner && !adding && (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-3 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50"
        >
          + Add certification
        </button>
      )}

      {isOwner && adding && (
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
              placeholder="e.g., NNDDA Narcotics — Single Purpose"
              className={inputCls}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-neutral-700">
                Issuer
              </label>
              <input
                type="text"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700">
                Date issued
              </label>
              <input
                type="date"
                value={issuedDate}
                onChange={(e) => setIssuedDate(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700">
              Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700">
              File (optional)
            </label>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1 w-full text-sm"
            />
            <p className="mt-1 text-xs text-neutral-500">PDF or image. Max 10 MB.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
            >
              {busy ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                reset();
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
