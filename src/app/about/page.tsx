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
          Built by K9 handlers, for the entire working-dog community.
        </p>
      </header>

      {/* Pull quote */}
      <blockquote className="border-l-4 border-pack-tan pl-5">
        <p className="text-xl font-medium italic leading-relaxed text-pack-mask">
          &ldquo;When the cold winds blow, the lone wolf dies — but the pack survives.&rdquo;
        </p>
        <footer className="mt-2 text-sm text-pack-brown">— Eddard Stark</footer>
      </blockquote>

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          Our story
        </h2>
        <p className="mt-2 text-pack-mask leading-relaxed">
          The Pack was started by a group of K9 handlers who sought to help fill gaps in the industry.
          Our aim was, and still is to this day, to improve the lives of K9 professionals everywhere
          by making it easy to find connections and profitable employment.
        </p>
      </section>

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          What we&apos;re building
        </h2>
        <p className="mt-2 text-pack-mask leading-relaxed">
          We are building a platform with everything K9 all in one place. A place where K9
          professionals old and new can find work, help, or equipment when and wherever they need.
        </p>
      </section>

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          The team
        </h2>
        <div className="mt-4 grid gap-8 sm:grid-cols-2">

          {/* Alex */}
          <div className="flex flex-col items-center text-center">
            <img
              src="https://api.dicebear.com/9.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4&clothingColor=262e33&top=shortHair&accessories=none"
              alt="Alex"
              className="h-28 w-28 rounded-full border-4 border-pack-tan/40 bg-pack-sand"
            />
            <h3 className="mt-3 text-lg font-semibold text-pack-mask">Alex</h3>
            <p className="mt-1 text-sm text-pack-brown leading-relaxed">
              K9 handler with 2 years of hands-on field experience spanning
              explosive and narcotics detection across multiple operational
              environments. Co-founder of The Pack and passionate advocate for
              connecting K9 professionals with the resources they deserve.
            </p>
            {/* Alex's dogs */}
            <div className="mt-4 w-full rounded-lg border border-pack-tan/30 bg-pack-sand/30 px-4 py-3 text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">K9 Partners</p>
              <div className="space-y-1 text-sm text-pack-mask">
                <div className="flex items-center gap-2">
                  <span>🐾</span>
                  <span><span className="font-medium">Max</span> — Narcotics Detection (2023–present)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Jeremy */}
          <div className="flex flex-col items-center text-center">
            <img
              src="https://api.dicebear.com/9.x/avataaars/svg?seed=Jeremy&backgroundColor=d1d4f9&clothingColor=3c4f5c&top=shortHairShortFlat&accessories=none"
              alt="Jeremy"
              className="h-28 w-28 rounded-full border-4 border-pack-tan/40 bg-pack-sand"
            />
            <h3 className="mt-3 text-lg font-semibold text-pack-mask">Jeremy</h3>
            <p className="mt-1 text-sm text-pack-brown leading-relaxed">
              Former law enforcement officer with a distinguished background
              as both a K9 handler and certified trainer. Jeremy brings
              real-world patrol, detection, and instructor experience to The
              Pack — ensuring the platform is built to meet the standards
              professionals actually work by.
            </p>
            {/* Jeremy's dogs */}
            <div className="mt-4 w-full rounded-lg border border-pack-tan/30 bg-pack-sand/30 px-4 py-3 text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">K9 Partners</p>
              <div className="space-y-1 text-sm text-pack-mask">
                <div className="flex items-center gap-2">
                  <span>🐾</span>
                  <span><span className="font-medium">Butta</span> — Explosives Detection (2010–2023)</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          Contact
        </h2>
        <div className="mt-2 space-y-1 text-pack-mask">
          <p>
            <a href="tel:+15043306647" className="hover:underline">
              (504) 330-6647
            </a>
          </p>
          <p>
            <a href="mailto:adminatthepack@gmail.com" className="hover:underline text-pack-brown">
              adminatthepack@gmail.com
            </a>
          </p>
        </div>
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
              veterinary care, surgery, and rehabilitation for dogs that need it most.{" "}
              <Link href="/terms" className="underline hover:text-pack-mask">
                Terms &amp; conditions apply.
              </Link>
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

    </article>
  );
}
