"use client";

// Public training log entries (text only, no files).
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { DogTrainingEntry } from "@/types/database";

const inputCls =
  "mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900";

export default function DogTrainingLogSection({
  dogId,
  isOwner,
  initial,
}: {
  dogId: string;
  isOwner: boolean;
  initial: DogTrainingEntry[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [entryDate, setEntryDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  function reset() {
    setEntryDate(new Date().toISOString().slice(0, 10));
    setTitle("");
    setNotes("");
    setError(null);
  }

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!entryDate) {
      setError("Date is required.");
      return;
    }
    setBusy(true);
    try {
      const { error: dbErr } = await supabase.from("dog_training_entries").insert({
        dog_id: dogId,
        entry_date: entryDate,
        title: title.trim(),
        notes: notes.trim() || null,
      });
      if (dbErr) throw dbErr;
      reset();
      setAdding(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add.");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(entry: DogTrainingEntry) {
    if (!confirm(`Delete "${entry.title}"?`)) return;
    setBusy(true);
    setError(null);
    try {
      const { error } = await supabase
        .from("dog_training_entries")
        .delete()
        .eq("id", entry.id);
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
        <p className="text-sm text-neutral-500">No training entries yet.</p>
      )}

      {initial.length > 0 && (
        <ol className="space-y-3 border-l-2 border-neutral-200 pl-4">
          {initial.map((entry) => (
            <li key={entry.id} className="relative">
              <span className="absolute -left-[1.4rem] top-1.5 h-2.5 w-2.5 rounded-full bg-neutral-400" />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-neutral-500">
                    {entry.entry_date}
                  </div>
                  <div className="mt-0.5 font-medium">{entry.title}</div>
                  {entry.notes && (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-700">
                      {entry.notes}
                    </p>
                  )}
                </div>
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => onDelete(entry)}
                    disabled={busy}
                    className="shrink-0 text-xs text-red-700 underline hover:text-red-900 disabled:opacity-50"
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}

      {isOwner && !adding && (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-3 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50"
        >
          + Add entry
        </button>
      )}

      {isOwner && adding && (
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
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
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
                placeholder="e.g., Box drill, off-leash heeling, 2-hour aged track…"
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
              placeholder="What you worked on, what went well, what to improve next time."
              className={inputCls}
            />
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
