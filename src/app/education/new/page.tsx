import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createArticle } from "./actions";

const inputCls =
  "mt-1 block w-full rounded-md border border-pack-tan/40 bg-white px-3 py-2 text-sm focus:border-pack-mask focus:outline-none focus:ring-1 focus:ring-pack-mask";

export default async function NewArticlePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/education/new");

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/education" className="text-sm text-pack-brown hover:text-pack-mask">
        ← Back to education
      </Link>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-pack-mask">
        Write an article
      </h1>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={createArticle} className="mt-6 space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            Title <span className="text-red-700">*</span>
          </label>
          <input id="title" name="title" required type="text" className={inputCls} />
        </div>
        <div>
          <label htmlFor="summary" className="block text-sm font-medium">
            Summary (1–2 sentences shown on the list)
          </label>
          <textarea
            id="summary"
            name="summary"
            rows={2}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="image_url" className="block text-sm font-medium">
            Cover image URL (optional)
          </label>
          <input
            id="image_url"
            name="image_url"
            type="url"
            placeholder="https://example.com/cover.jpg"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="body" className="block text-sm font-medium">
            Body <span className="text-red-700">*</span>
          </label>
          <textarea
            id="body"
            name="body"
            rows={14}
            required
            placeholder="Write your article here. Line breaks are preserved."
            className={inputCls}
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-pack-mask px-4 py-2 text-sm font-semibold text-pack-cream hover:bg-pack-brown"
        >
          Publish
        </button>
      </form>
    </div>
  );
}
