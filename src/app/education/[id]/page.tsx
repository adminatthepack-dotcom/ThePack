import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ROLE_BADGE_CLASSES, ROLE_LABELS } from "@/lib/roles";
import type { Article, Profile } from "@/types/database";
import { deleteArticle } from "../new/actions";

export default async function ArticleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .maybeSingle<Article>();
  if (!article) notFound();

  const { data: author } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", article.author_id)
    .maybeSingle<Profile>();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthor = user?.id === article.author_id;

  return (
    <article className="mx-auto max-w-2xl">
      <Link
        href="/education"
        className="text-sm text-pack-brown hover:text-pack-mask"
      >
        ← Back to education
      </Link>

      {article.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.image_url}
          alt=""
          className="mt-4 h-56 w-full rounded-lg object-cover"
        />
      )}

      <h1 className="mt-4 text-4xl font-bold tracking-tight text-pack-mask">
        {article.title}
      </h1>

      <div className="mt-2 text-sm text-pack-brown">
        Published{" "}
        {new Date(article.published_at).toLocaleDateString(undefined, {
          dateStyle: "long",
        })}
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {decodeURIComponent(error)}
        </div>
      )}

      {author && (
        <div className="mt-6 flex items-center gap-3 rounded-lg border border-pack-tan/40 bg-white p-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-pack-sand">
            {author.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={author.avatar_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-pack-brown">
                {(author.full_name ?? "?").slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs uppercase tracking-wide text-pack-brown/70">
              Written by
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/profile/${author.id}`}
                className="font-medium hover:underline"
              >
                {author.full_name ?? "Unknown"}
              </Link>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${ROLE_BADGE_CLASSES[author.role]}`}
              >
                {ROLE_LABELS[author.role]}
              </span>
            </div>
          </div>
        </div>
      )}

      {article.summary && (
        <p className="mt-6 text-lg italic text-pack-brown">
          {article.summary}
        </p>
      )}

      <div className="mt-6 whitespace-pre-wrap text-pack-mask leading-relaxed">
        {article.body}
      </div>

      {isAuthor && (
        <section className="mt-12 rounded-md border border-red-200 bg-red-50 p-4">
          <h3 className="text-sm font-semibold text-red-900">Author tools</h3>
          <form action={deleteArticle} className="mt-2">
            <input type="hidden" name="id" value={article.id} />
            <button
              type="submit"
              className="rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              Delete this article
            </button>
          </form>
        </section>
      )}
    </article>
  );
}
