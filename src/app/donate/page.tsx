import { createClient } from "@/lib/supabase/server";
import { submitPledge } from "./actions";

const DONATION_AMOUNTS = [25, 50, 100, 250, 500];

export default async function DonatePage({
  searchParams,
}: {
  searchParams: Promise<{ pledged?: string; error?: string }>;
}) {
  const { pledged, error } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role ?? null;
  }

  const isVet = role === "veterinarian";

  return (
    <div className="mx-auto max-w-3xl">
      {/* Hero */}
      <div className="rounded-2xl bg-pack-mask px-8 py-10 text-center text-pack-cream">
        <div className="text-5xl">🐾</div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">
          Working Dog Relief Fund
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-pack-sand">
          Working dogs give everything in service to their handlers and communities.
          When they&apos;re injured in the line of duty, the costs of care can be
          overwhelming. This fund exists to make sure no working dog goes without
          the treatment they&apos;ve earned.
        </p>
      </div>

      {pledged === "1" && (
        <div className="mt-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800 border border-emerald-200">
          Thank you for your pledge — our team will be in touch to confirm the details and add you to the provider network.
        </div>
      )}
      {error && (
        <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 border border-red-200">
          Please fill in all fields before submitting.
        </div>
      )}

      {/* What the fund covers */}
      <section className="mt-10">
        <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          What we cover
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: "🏥",
              title: "Emergency care",
              body: "Immediate treatment for dogs injured on active duty — surgery, stabilization, critical care.",
            },
            {
              icon: "🦴",
              title: "Rehabilitation",
              body: "Physical therapy, orthopedic follow-up, and recovery support to get dogs back on their feet.",
            },
            {
              icon: "🏠",
              title: "Retirement support",
              body: "Ongoing care for retired working dogs whose handlers need help with medical costs.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-pack-tan/40 bg-white p-5"
            >
              <div className="text-2xl">{item.icon}</div>
              <h3 className="mt-2 font-semibold text-pack-mask">{item.title}</h3>
              <p className="mt-1 text-sm text-pack-brown">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Donate section */}
      <section className="mt-10">
        <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          Make a donation
        </h2>
        <div className="mt-4 rounded-lg border border-pack-tan/40 bg-white p-6">
          <p className="text-sm text-pack-brown">
            Select an amount below. You&apos;ll be taken to a secure checkout.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {DONATION_AMOUNTS.map((amount) => (
              <a
                key={amount}
                href={`/api/donate?amount=${amount * 100}`}
                className="rounded-md border border-pack-tan/40 bg-pack-sand/40 px-5 py-2.5 text-sm font-semibold text-pack-mask transition hover:border-pack-tan hover:bg-pack-sand"
              >
                ${amount}
              </a>
            ))}
          </div>
          <p className="mt-4 text-xs text-neutral-400">
            Custom amounts: contact us at{" "}
            <a
              href="mailto:adminatthepack@gmail.com"
              className="underline hover:text-pack-mask"
            >
              adminatthepack@gmail.com
            </a>
            . All donations go directly to veterinary care for working dogs in need.
          </p>
        </div>
      </section>

      {/* Vet pledge section */}
      {isVet && (
        <section className="mt-10">
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
            Pledge your time
          </h2>
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🩺</span>
              <div>
                <h3 className="font-semibold text-emerald-900">
                  Veterinarians: offer pro bono care
                </h3>
                <p className="mt-1 text-sm text-emerald-800">
                  As a verified veterinarian on The Pack, you can pledge discounted
                  or pro bono services for working dogs referred through the relief
                  fund. Your pledge is listed in our provider network so handlers
                  and fund coordinators can reach you directly.
                </p>
                <form action={submitPledge} className="mt-4 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-emerald-900">
                      What are you able to offer?
                    </label>
                    <textarea
                      name="offer"
                      rows={3}
                      required
                      placeholder="e.g. Free initial assessment, 50% discount on surgery for fund-referred cases, pro bono rehab sessions…"
                      className="mt-1 w-full rounded-md border border-emerald-300 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-emerald-900">
                      Geographic coverage
                    </label>
                    <input
                      name="coverage"
                      type="text"
                      required
                      placeholder="e.g. Greater Dallas area, nationwide telemedicine"
                      className="mt-1 w-full rounded-md border border-emerald-300 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
                  >
                    Submit my pledge
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Non-vet prompt to share */}
      {!isVet && (
        <section className="mt-10 rounded-lg border border-pack-tan/40 bg-white p-6 text-center">
          <p className="text-sm text-pack-brown">
            Are you a veterinarian?{" "}
            <a href="/apply/veterinarian" className="font-medium text-pack-mask underline">
              Join as a vet provider
            </a>{" "}
            to pledge pro bono care through the fund.
          </p>
        </section>
      )}

      {/* Apply for funding */}
      <section className="mt-6 rounded-lg border border-pack-tan/40 bg-white p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-pack-mask">Need help for your working dog?</h3>
            <p className="mt-1 text-sm text-pack-brown">
              Handlers whose dogs were injured in the line of duty can apply to
              receive financial assistance from the fund.
            </p>
          </div>
          <a
            href="/donate/apply"
            className="mt-3 shrink-0 rounded-md border border-pack-tan/40 px-4 py-2 text-sm font-medium text-pack-mask transition hover:border-pack-tan hover:bg-pack-sand/40 sm:mt-0"
          >
            Apply for assistance →
          </a>
        </div>
      </section>

      {/* Terms link */}
      <p className="mt-6 text-center text-xs text-neutral-400">
        By donating you agree to the{" "}
        <a href="/terms" className="underline hover:text-pack-mask">
          Working Dog Relief Fund terms
        </a>
        .
      </p>
    </div>
  );
}
