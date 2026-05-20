"use client";

// Uploads a dog's avatar to the dog-public bucket at
// `{ownerId}/{dogId}/avatar.{ext}` and writes the URL onto dogs.avatar_url.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DogAvatarUploader({
  ownerId,
  dogId,
  currentUrl,
}: {
  ownerId: string;
  dogId: string;
  currentUrl: string | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB.");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${ownerId}/${dogId}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("dog-public")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;

      const {
        data: { publicUrl },
      } = supabase.storage.from("dog-public").getPublicUrl(path);
      const url = `${publicUrl}?t=${Date.now()}`;

      const { error: dbErr } = await supabase
        .from("dogs")
        .update({ avatar_url: url })
        .eq("id", dogId);
      if (dbErr) throw dbErr;

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function onRemove() {
    setUploading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from("dogs")
        .update({ avatar_url: null })
        .eq("id", dogId);
      if (error) throw error;
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-start gap-4">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-neutral-200">
        {currentUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500">
            No photo
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-block cursor-pointer rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50">
            {uploading ? "Uploading…" : currentUrl ? "Change photo" : "Upload photo"}
            <input
              type="file"
              accept="image/*"
              onChange={onChange}
              disabled={uploading}
              className="hidden"
            />
          </label>
          {currentUrl && (
            <button
              type="button"
              onClick={onRemove}
              disabled={uploading}
              className="text-sm text-neutral-600 underline hover:text-neutral-900 disabled:opacity-50"
            >
              Remove
            </button>
          )}
        </div>
        {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      </div>
    </div>
  );
}
