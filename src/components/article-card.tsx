import Link from "next/link";
import type { Article } from "@/types/database";

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/education/${article.id}`}
      className="block overflow-hidden rounded-lg border border-pack-tan/40 bg-white transition hover:border-pack-tan hover:shadow-sm"
    >
      {article.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.image_url}
          alt=""
          className="h-40 w-full object-cover"
        />
      )}
      <div className="p-5">
        <div className="text-xs text-pack-brown/70">
          {new Date(article.published_at).toLocaleDateString(undefined, {
            dateStyle: "medium",
          })}
        </div>
        <h3 className="mt-1 text-lg font-semibold text-pack-mask">
          {article.title}
        </h3>
        {article.summary && (
          <p className="mt-2 line-clamp-3 text-sm text-pack-mask/80">
            {article.summary}
          </p>
        )}
      </div>
    </Link>
  );
}
