import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Article } from "@/types/database";
import ArticleCard from "@/components/article-card";

export default async function EducationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: articles } = await supabase
    .from("articles")
    .select("*")
    .order("published_at", { ascending: false })
    .returns<Article[]>();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-pack-mask">
            Education
          </h1>
          <p className="mt-1 text-sm text-pack-brown">
            Articles, guides, and how-tos from the K9 community.
          </p>
        </div>
        {user && (
          <Link
            href="/education/new"
            className="rounded-md bg-pack-mask px-4 py-2 text-sm font-semibold text-pack-cream transition hover:bg-pack-brown"
          >
            + Write an article
          </Link>
        )}
      </div>

      <div className="mt-8">
        {!articles || articles.length === 0 ? (
          <div className="rounded-lg border border-dashed border-pack-tan/40 bg-white p-8 text-center text-sm text-pack-brown">
            No articles yet.
            {user && (
              <>
                {" "}
                <Link
                  href="/education/new"
                  className="font-medium text-pack-mask underline"
                >
                  Write the first one
                </Link>
                .
              </>
            )}
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <li key={a.id}>
                <ArticleCard article={a} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
