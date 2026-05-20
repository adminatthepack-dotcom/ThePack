import Link from "next/link";
import type { EquipmentListing } from "@/types/database";
import {
  EQUIPMENT_STATUS_BADGE,
  getEquipmentCategoryLabel,
} from "@/lib/gear";

export default function EquipmentCard({ item }: { item: EquipmentListing }) {
  return (
    <Link
      href={`/gear/${item.id}`}
      className="block overflow-hidden rounded-lg border border-pack-tan/40 bg-white transition hover:border-pack-tan hover:shadow-sm"
    >
      <div className="aspect-square w-full bg-pack-sand/40">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl text-pack-brown/40">
            🎒
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 font-semibold text-pack-mask">
            {item.title}
          </h3>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${EQUIPMENT_STATUS_BADGE[item.status]}`}
          >
            {item.status === "sold" ? "Sold" : item.status === "removed" ? "Removed" : "Available"}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-pack-brown">
          {item.pack_tags?.includes("pack-approved") && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
              ✓ Pack Approved
            </span>
          )}
          {item.pack_tags?.includes("custom") && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-pack-sand/60 px-2 py-0.5 text-[10px] font-semibold text-pack-brown ring-1 ring-pack-tan/40">
              ✏︎ Customize
            </span>
          )}
        </div>
        <div className="mt-1 text-xs text-pack-brown">
          {getEquipmentCategoryLabel(item.category)}
          {item.location && <> · 📍 {item.location}</>}
        </div>
        {item.price && (
          <div className="mt-2 font-semibold text-pack-mask">
            {item.price}
          </div>
        )}
      </div>
    </Link>
  );
}
