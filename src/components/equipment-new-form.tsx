"use client";

// Client form for new gear listings. Uploads the photo to Supabase Storage,
// then inserts the row. Lives at /gear/new.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_CONDITIONS,
  EQUIPMENT_CONDITION_LABELS,
  isEquipmentCategory,
} from "@/lib/gear";

const inputCls =
  "mt-1 block w-full rounded-md border border-pack-tan/40 bg-white px-3 py-2 text-sm focus:border-pack-mask focus:outline-none focus:ring-1 focus:ring-pack-mask";

export default function EquipmentNewForm({ userId }: { userId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [file, setFile] = useState<File | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) return setError("Title is required.");
    if (!description.trim()) return setError("Description is required.");
    if (!isEquipmentCategory(category)) return setError("Pick a category.");
    if (file && file.size > 10 * 1024 * 1024) {
      return setError("Image must be under 10 MB.");
    }
    if (file && !file.type.startsWith("image/")) {
      return setError("Please upload an image file.");
    }

    setBusy(true);
    try {
      const listingId = crypto.randomUUID();
      let image_url: string | null = null;

      if (file) {
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `${userId}/${listingId}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("equipment-images")
          .upload(path, file, { upsert: false, contentType: file.type });
        if (upErr) throw upErr;
        const {
          data: { publicUrl },
        } = supabase.storage.from("equipment-images").getPublicUrl(path);
        image_url = publicUrl;
      }

      const { error: insertErr } = await supabase
        .from("equipment_listings")
        .insert({
          id: listingId,
          seller_id: userId,
          title: title.trim(),
          description: description.trim(),
          category,
          condition: condition || null,
          price: price.trim() || null,
          location: location.trim() || null,
          image_url,
        });
      if (insertErr) throw insertErr;

      router.push(`/gear/${listingId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create listing.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium">
          Title <span className="text-red-700">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={inputCls}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">
            Category <span className="text-red-700">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className={inputCls}
          >
            <option value="" disabled>
              Pick a category…
            </option>
            {EQUIPMENT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Condition</label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className={inputCls}
          >
            <option value="">—</option>
            {EQUIPMENT_CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {EQUIPMENT_CONDITION_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">
          Description <span className="text-red-700">*</span>
        </label>
        <textarea
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className={inputCls}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Price</label>
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g., $180, OBO, trade"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ships from / pickup city"
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mt-1 w-full text-sm"
        />
        <p className="mt-1 text-xs text-pack-brown/70">
          JPG, PNG, or GIF. Max 10 MB.
        </p>
      </div>

      <button
        type="submit"
        disabled={busy}
        className="rounded-md bg-pack-mask px-5 py-2 text-sm font-semibold text-pack-cream hover:bg-pack-brown disabled:opacity-50"
      >
        {busy ? "Listing…" : "List item"}
      </button>
    </form>
  );
}
