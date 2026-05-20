import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  EQUIPMENT_CATEGORIES,
  PACK_TAGS,
  isEquipmentCategory,
  isPackTag,
  type EquipmentCategory,
  type PackTag,
} from "@/lib/gear";
import type { EquipmentListing } from "@/types/database";
import EquipmentCard from "@/components/equipment-card";

export default async function GearPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tag?: string }>;
}) {
  const { category, tag } = await searchParams;
  const activeCategory: EquipmentCategory | null = isEquipmentCategory(category)
    ? category
    : null;
  const activeTag: PackTag | null = isPackTag(tag) ? tag : null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("equipment_listings")
    .select("*")
    .neq("status", "removed")
    .order("created_at", { ascending: false });

  if (activeTag) {
    query = query.contains("pack_tags", [activeTag]);
  } else if (activeCategory) {
    query = query.eq("category", activeCategory);
  }

  const { data: items } = await query.returns<EquipmentListing[]>();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-pack-mask">
            Equipment
          </h1>
          <p className="mt-1 text-sm text-pack-brown">
            Buy, sell, and customize working-dog equipment. Posted by community members.
          </p>
        </div>
        {user && (
          <Link
            href="/gear/new"
            className="rounded-md bg-pack-mask px-4 py-2 text-sm font-semibold text-pack-cream transition hover:bg-pack-brown"
          >
            + List an item
          </Link>
        )}
      </div>

      {/* Featured filter pills */}
      <div className="mt-6 space-y-3">
        <div className="flex flex-wrap gap-2">
          <FilterPill
            href="/gear"
            active={!activeTag && !activeCategory}
          >
            All Equipment
          </FilterPill>
          {PACK_TAGS.map((t) => (
            <FilterPill
              key={t.value}
              href={`/gear?tag=${t.value}`}
              active={activeTag === t.value}
              featured
            >
              {t.value === "pack-approved" ? "✓ " : "✏︎ "}
              {t.label}
            </FilterPill>
          ))}
        </div>

        {/* Category sub-filters — only shown when not on a special tag */}
        {!activeTag && (
          <div className="flex flex-wrap gap-1.5">
            {EQUIPMENT_CATEGORIES.map((c) => (
              <FilterPill
                key={c.value}
                href={`/gear?category=${c.value}`}
                active={activeCategory === c.value}
                small
              >
                {c.label}
              </FilterPill>
            ))}
          </div>
        )}
      </div>

      {/* Active filter description */}
      {activeTag === "pack-approved" && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <strong>Pack Approved</strong> — Products vetted and recommended by The Pack team. Trusted gear used by working-dog professionals.
        </div>
      )}
      {activeTag === "custom" && (
        <div className="mt-4 rounded-lg border border-pack-tan/40 bg-pack-sand/30 px-4 py-3 text-sm text-pack-brown">
          <strong>Customize Your Equipment</strong> — Work with vendors to build gear tailored to your dog, unit, or style. Reach out directly to discuss specs and lead times.
        </div>
      )}

      <div className="mt-6">
        {!items || items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-pack-tan/40 bg-white p-8 text-center text-sm text-pack-brown">
            No listings in this category yet.
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <li key={item.id}>
                <EquipmentCard item={item} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function FilterPill({
  href,
  active,
  children,
  featured,
  small,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  featured?: boolean;
  small?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full ring-1 ring-inset transition ${
        small ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm"
      } ${
        active
          ? "bg-pack-mask text-pack-cream ring-pack-mask"
          : featured
            ? "bg-white font-medium text-pack-mask ring-pack-mask/40 hover:bg-pack-sand/60"
            : "bg-white text-pack-brown ring-pack-tan/40 hover:bg-pack-sand/60"
      }`}
    >
      {children}
    </Link>
  );
}
