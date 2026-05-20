import Link from "next/link";

export const metadata = {
  title: "About — THE PACK",
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-2xl space-y-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-pack-fawn">
          About
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-pack-mask">
          About THE PACK
        </h1>
        <p className="mt-3 text-lg text-pack-brown">
          [Replace with your one-line mission statement.]
        </p>
      </header>

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          Our story
        </h2>
        <p className="mt-2 whitespace-pre-wrap text-pack-mask">
          [Placeholder paragraph. Write a few sentences about why you started
          THE PACK, the problem you saw in the working-dog industry, and what
          you hope this community becomes.]
        </p>
      </section>

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          What we&apos;re building
        </h2>
        <p className="mt-2 whitespace-pre-wrap text-pack-mask">
          [Placeholder paragraph. Describe the directory, dog profiles,
          marketplace, education hub, events, and gear listings — and how they
          fit together.]
        </p>
      </section>

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          The team
        </h2>
        <p className="mt-2 whitespace-pre-wrap text-pack-mask">
          [Placeholder paragraph. Introduce yourselves — names, K9-industry
          background, and how to reach you.]
        </p>
      </section>

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          Contact
        </h2>
        <p className="mt-2 text-pack-mask">
          [Placeholder contact email or form.]
        </p>
      </section>

      {/* WDRF callout */}
      <section className="rounded-lg border border-pack-tan/40 bg-pack-sand/30 p-6">
        <div className="flex items-start gap-4">
          <span className="text-3xl">🐾</span>
          <div className="flex-1">
            <h2 className="font-semibold text-pack-mask">Working Dog Relief Fund</h2>
            <p className="mt-1 text-sm text-pack-brown">
              The Pack maintains a relief fund for working dogs injured in the
              line of duty. Community donations go directly toward emergency
              veterinary care, surgery, and rehabilitation for dogs that need it most.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Link
                href="/donate"
                className="rounded-md bg-pack-mask px-4 py-2 text-sm font-medium text-pack-cream hover:bg-pack-brown"
              >
                Donate to the fund
              </Link>
              <Link
                href="/donate/apply"
                className="rounded-md border border-pack-tan/40 bg-white px-4 py-2 text-sm font-medium text-pack-mask hover:border-pack-tan hover:bg-pack-sand/40"
              >
                Apply for assistance
              </Link>
            </div>
          </div>
        </div>
      </section>

      <p className="text-xs text-pack-brown/70">
        Edit this page at <code>src/app/about/page.tsx</code>.
      </p>
    </article>
  );
}
