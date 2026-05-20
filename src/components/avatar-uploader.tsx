"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Client-side avatar uploader. Uploads to Supabase Storage's "avatars" bucket
// at the path `{userId}/avatar.{ext}`, then writes the public URL onto the
// user's profile row and refreshes the page.
export default function AvatarUploader({
  userId,
  currentUrl,
}: {
  userId: string;
  currentUrl: string | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB.");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const filePath = `${userId}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // Cache-bust so the new image shows up immediately.
      const url = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", userId);
      if (updateError) throw updateError;

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      // Reset the input so picking the same file twice still triggers change.
      e.target.value = "";
    }
  }

  async function onRemove() {
    setError(null);
    setUploading(true);
    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", userId);
      if (updateError) throw updateError;
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
            alt="Your avatar"
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
            {uploading
              ? "Uploading…"
              : currentUrl
                ? "Change photo"
                : "Upload photo"}
            <input
              type="file"
              accept="image/*"
              onChange={onFileChange}
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
        <p className="mt-1 text-xs text-neutral-500">
          JPG, PNG, or GIF. Max 5 MB.
        </p>
      </div>
    </div>
  );
}
