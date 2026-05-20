"use client";

// Private documents: ownership proof, breeding records, other. Files live in
// the dog-private bucket; signed URLs are pre-computed server-side.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  DOC_TYPES,
  DOC_TYPE_LABELS,
  isDocType,
  type DocType,
} from "@/lib/dogs";
import type { DogDocumentWithUrl } from "@/types/database";

const inputCls =
  "mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900";

export default function DogDocumentsSection({
  ownerId,
  dogId,
  initial,
}: {
  ownerId: string;
  dogId: string;
  initial: DogDocumentWithUrl[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [docType, setDocType] = useState<DocType>("ownership");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);

  function reset() {
    setDocType("ownership");
    setTitle("");
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
    if (!file) {
      setError("Please attach a file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File must be under 10 MB.");
      return;
    }
    if (!isDocType(docType)) {
      setError("Invalid document type.");
      return;
    }
    setBusy(true);
    try {
      const docId = crypto.randomUUID();
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
      const path = `${ownerId}/${dogId}/doc-${docId}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("dog-private")
        .upload(path, file, {
          upsert: false,
          contentType: file.type || undefined,
        });
      if (upErr) throw upErr;

      const { error: dbErr } = await supabase.from("dog_documents").insert({
        id: docId,
        dog_id: dogId,
        doc_type: docType,
        title: title.trim(),
        notes: notes.trim() || null,
        file_path: path,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type || null,
      });

      if (dbErr) {
        await supabase.storage.from("dog-private").remove([path]);
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

  async function onDelete(d: DogDocumentWithUrl) {
    if (!confirm(`Delete "${d.title}"?`)) return;
    setBusy(true);
    setError(null);
    try {
      await supabase.storage.from("dog-private").remove([d.file_path]);
      const { error } = await supabase
        .from("dog_documents")
        .delete()
        .eq("id", d.id);
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
        <p className="text-sm text-neutral-500">No documents uploaded.</p>
      )}

      {initial.length > 0 && (
        <ul className="divide-y divide-neutral-200 rounded-md border border-neutral-200 bg-white">
          {initial.map((d) => (
            <li key={d.id} className="flex items-start justify-between gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-700 ring-1 ring-inset ring-neutral-200">
                    {DOC_TYPE_LABELS[d.doc_type]}
                  </span>
                </div>
                <div className="mt-0.5 font-medium">{d.title}</div>
                {d.notes && (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-700">
                    {d.notes}
                  </p>
                )}
                {d.signed_url && (
                  <a
                    href={d.signed_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-xs text-neutral-700 underline hover:text-neutral-900"
                  >
                    View file ({d.file_name})
                  </a>
                )}
              </div>
              <button
                type="button"
                onClick={() => onDelete(d)}
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
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-neutral-700">
                Type <span className="text-red-700">*</span>
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocType)}
                className={inputCls}
              >
                {DOC_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {DOC_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700">
                Title <span className="text-red-700">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Bill of sale, AKC registration, Litter record"
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700">
              Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={inputCls}
            />
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
              PDF or image. Max 10 MB. Files are private to you.
            </p>
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
