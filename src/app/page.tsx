import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Logo from "@/components/logo";

function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="group relative ml-1.5 inline-block">
      <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-pack-tan/60 text-[10px] font-bold text-pack-mask">
        ?
      </span>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-64 -translate-x-1/2 rounded-md bg-pack-mask px-3 py-2 text-xs leading-relaxed text-pack-cream opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        {text}
      </span>
    </span>
  );
}

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-16">
      <section className="text-center">
        <div className="mx-auto flex justify-center">
          <Logo className="h-24 w-auto drop-shadow-sm" />
        </div>
        <h1 className="mt-4 text-5xl font-bold tracking-tight text-pack-mask sm:text-6xl">
          {user ? "Welcome back." : "Find your pack."}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-pack-brown">
          {user
            ? "Let's get you what you need."
            : "The home for K9 professionals across the country. Connect with the working-dog community."}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/find"
            className="rounded-md bg-pack-mask px-7 py-3.5 text-base font-semibold tracking-wide text-pack-cream shadow-sm transition hover:bg-pack-brown"
          >
            What do you want to accomplish today? →
          </Link>
        </div>
        <div className="mt-4 flex justify-center">
          <Link
            href="/find?intent=find-vet&spec=emergency"
            className="inline-flex items-center gap-2 rounded-full border border-red-300 bg-red-50 px-4 py-1.5 text-sm font-medium text-red-700 shadow-sm transition hover:bg-red-100 hover:border-red-400"
          >
            <span className="text-base leading-none">🚨</span>
            Vet Emergency — find help near you
          </Link>
        </div>
      </section>

      {!user && (
        <>
          <section className="mx-auto max-w-2xl">
            <h2 className="text-center text-2xl font-bold tracking-tight text-pack-mask">
              Join the Pack
            </h2>
            <p className="mt-2 text-center text-sm text-pack-brown">
              Choose the path that describes you.
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {/* Provider path */}
              <div className="flex flex-col rounded-xl border-2 border-pack-tan bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-pack-mask">
                    Apply to be a Provider
                  </h3>
                  <InfoTooltip
                    text={
                      "Applications are reviewed for credential and license validity. Provider types include: K9 Handler, Trainer, Breeder, Veterinarian, Transporter, and Employer."
                    }
                  />
                </div>
                <p className="mt-2 flex-1 text-sm text-pack-brown">
                  Join as a professional — handlers, trainers, breeders,
                  veterinarians, transporters, and employers.
                </p>
                <Link
                  href="/apply"
                  className="mt-5 rounded-md bg-pack-mask px-4 py-2.5 text-center text-sm font-semibold text-pack-cream transition hover:bg-pack-brown"
                >
                  Start application →
                </Link>
              </div>

              {/* Customer path */}
              <div className="flex flex-col rounded-xl border-2 border-pack-tan bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-pack-mask">
                    Sign Up as a Client
                  </h3>
                  <InfoTooltip
                    text={
                      "Sign up to contact providers, post contracts on the marketplace, and browse the directory."
                    }
                  />
                </div>
                <p className="mt-2 flex-1 text-sm text-pack-brown">
                  Looking for dogs, services, or trained partners? Create a
                  client account in seconds — no approval needed.
                </p>
                <Link
                  href="/signup"
                  className="mt-5 rounded-md border-2 border-pack-mask px-4 py-2.5 text-center text-sm font-semibold text-pack-mask transition hover:bg-pack-mask hover:text-pack-cream"
                >
                  Sign up free →
                </Link>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-center text-xs font-bold uppercase tracking-[0.25em] text-pack-fawn">
              Who&apos;s in the pack
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PACK_MEMBERS.map(({ label, description }) => (
                <div
                  key={label}
                  className="rounded-lg border border-pack-tan/40 bg-white p-5 shadow-sm"
                >
                  <div className="font-semibold text-pack-mask">{label}</div>
                  <p className="mt-2 text-sm text-pack-brown">{description}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

const PACK_MEMBERS = [
  {
    label: "K9 Handlers",
    description:
      "Professionals who work alongside dogs in law enforcement, search & rescue, protection, and sport.",
  },
  {
    label: "Trainers",
    description:
      "Experts who train dogs and teach handlers across every working-dog discipline.",
  },
  {
    label: "Breeders",
    description:
      "Responsible breeders producing working and sport dogs with verified health and lineage.",
  },
  {
    label: "Veterinarians",
    description:
      "Vets specializing in working dogs — from performance care to orthopedics.",
  },
  {
    label: "Transporters",
    description:
      "Licensed professionals who move working dogs safely across the country.",
  },
  {
    label: "Employers",
    description:
      "Agencies, businesses, and organizations that hire K9 teams and support staff.",
  },
];
