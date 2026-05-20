"use client";

// Private vet records. Only the dog's owner sees this whole section.
// Files live in the dog-private bucket; signed URLs are pre-computed
// server-side and passed in.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { DogVetRecordWithUrl } from "@/types/database";

const inputCls =
  "mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900";

export default function DogVetRecordsSection({
  ownerId,
  dogId,
  initial,
}: {
  ownerId: string;
  dogId: string;
  initial: DogVetRecordWithUrl[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [recordDate, setRecordDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);

  function reset() {
    setRecordDate(new Date().toISOString().slice(0, 10));
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
    if (!recordDate) {
      setError("Date is required.");
      return;
    }
    if (file && file.size > 10 * 1024 * 1024) {
      setError("File must be under 10 MB.");
      return;
    }
    setBusy(true);
    try {
      const recordId = crypto.randomUUID();
      let file_path: string | null = null;
      let file_name: string | null = null;
      let file_size: number | null = null;
      let mime_type: string | null = null;

      if (file) {
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
        const path = `${ownerId}/${dogId}/vet-${recordId}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("dog-private")
          .upload(path, file, {
            upsert: false,
            contentType: file.type || undefined,
          });
        if (upErr) throw upErr;
        file_path = path;
        file_name = file.name;
        file_size = file.size;
        mime_type = file.type || null;
      }

      const { error: dbErr } = await supabase.from("dog_vet_records").insert({
        id: recordId,
        dog_id: dogId,
        record_date: recordDate,
        title: title.trim(),
        notes: notes.trim() || null,
        file_path,
        file_name,
        file_size,
        mime_type,
      });

      if (dbErr) {
        if (file_path) {
          await supabase.storage.from("dog-private").remove([file_path]);
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

  async function onDelete(r: DogVetRecordWithUrl) {
    if (!confirm(`Delete "${r.title}"?`)) return;
    setBusy(true);
    setError(null);
    try {
      if (r.file_path) {
        await supabase.storage.from("dog-private").remove([r.file_path]);
      }
      const { error } = await supabase
        .from("dog_vet_records")
        .delete()
        .eq("id", r.id);
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
        <p className="text-sm text-neutral-500">No vet records yet.</p>
      )}

      {initial.length > 0 && (
        <ul className="divide-y divide-neutral-200 rounded-md border border-neutral-200 bg-white">
          {initial.map((r) => (
            <li key={r.id} className="flex items-start justify-between gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="text-xs text-neutral-500">{r.record_date}</div>
                <div className="font-medium">{r.title}</div>
                {r.notes && (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-700">
                    {r.notes}
                  </p>
                )}
                {r.signed_url && (
                  <a
                    href={r.signed_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-xs text-neutral-700 underline hover:text-neutral-900"
                  >
                    View file{r.file_name ? ` (${r.file_name})` : ""}
                  </a>
                )}
              </div>
              <button
                type="button"
                onClick={() => onDelete(r)}
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
          + Add vet record
        </button>
      )}

      {adding && (
        <form
          onSubmit={onAdd}
          className="mt-3 space-y-3 rounded-md border border-neutral-200 bg-neutral-50 p-4"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700">
                Date <span className="text-red-700">*</span>
              </label>
              <input
                type="date"
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-neutral-700">
                Title <span className="text-red-700">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Annual vaccinations, hip x-rays, surgery follow-up"
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
              File (optional)
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
