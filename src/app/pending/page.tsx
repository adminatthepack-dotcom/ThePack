import Link from 'next/link';

export default function PendingPage() {
  return (
    <div className="mx-auto max-w-lg py-20 text-center">
      <div className="text-5xl">🐾</div>
      <h1 className="mt-6 text-2xl font-bold text-pack-mask">
        Your application is under review.
      </h1>
      <p className="mt-4 text-pack-brown">
        We&apos;ve received your application and our team will review your
        credentials. This typically takes 1–3 business days. You&apos;ll
        receive an email when a decision has been made.
      </p>

      <div className="mt-8 rounded-lg border border-pack-tan/40 bg-white p-6 text-left shadow-sm">
        <p className="mb-3 text-sm font-semibold text-pack-mask">
          In the meantime you can:
        </p>
        <ul className="space-y-2 text-sm text-pack-brown">
          <li>
            <Link
              href="/directory"
              className="underline underline-offset-2 hover:text-pack-mask"
            >
              Browse the public directory
            </Link>
          </li>
          <li>
            <Link
              href="/marketplace"
              className="underline underline-offset-2 hover:text-pack-mask"
            >
              Explore the marketplace
            </Link>
          </li>
        </ul>
      </div>

      <div className="mt-8">
        <Link
          href="/logout"
          className="text-sm text-neutral-400 hover:text-neutral-600"
        >
          Sign out
        </Link>
      </div>
    </div>
  );
}
