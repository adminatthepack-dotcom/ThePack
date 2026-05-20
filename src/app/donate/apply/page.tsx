import Link from "next/link";
import { submitFundApplication } from "./actions";

export const metadata = { title: "Apply for Relief Funds — THE PACK" };

export default async function WDRFApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string; error?: string }>;
}) {
  const { submitted, error } = await searchParams;

  if (submitted === "1") {
    return (
      <div className="mx-auto max-w-xl text-center">
        <div className="text-5xl">🐾</div>
        <h1 className="mt-4 text-2xl font-bold text-pack-mask">Application received</h1>
        <p className="mt-3 text-pack-brown">
          Thank you for reaching out. Our team will review your application and
          contact you at the email provided. We take every case seriously and
          will respond as quickly as possible.
        </p>
        <Link
          href="/donate"
          className="mt-6 inline-block rounded-md bg-pack-mask px-5 py-2.5 text-sm font-medium text-pack-cream hover:bg-pack-brown"
        >
          Back to the relief fund
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/donate" className="text-sm text-pack-brown hover:text-pack-mask">
        ← Back to Working Dog Relief Fund
      </Link>

      <div className="mt-4">
        <h1 className="text-3xl font-bold tracking-tight text-pack-mask">
          Apply for Relief Funding
        </h1>
        <p className="mt-2 text-pack-brown">
          Fill out the form below to request assistance from the Working Dog
          Relief Fund. Every application is reviewed personally by The Pack team.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5">
        <h2 className="font-semibold text-amber-900">Before you apply</h2>
        <p className="mt-2 text-sm text-amber-800">
          The Working Dog Relief Fund is a limited resource maintained through
          community donations. Distributions are approved based on two primary
          factors:
        </p>
        <ul className="mt-3 space-y-1.5 text-sm text-amber-800">
          <li className="flex gap-2">
            <span className="mt-0.5 shrink-0">•</span>
            <span>
              <strong>Urgency of circumstances</strong> — cases involving
              immediate risk to the dog&apos;s life or welfare are prioritized.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 shrink-0">•</span>
            <span>
              <strong>Assessed treatment outcome</strong> — the fund is intended
              to give dogs a genuine chance at recovery or continued service.
              Cases where intervention is unlikely to meaningfully improve the
              dog&apos;s outcome may not be approved, so that resources remain
              available where they can do the most good.
            </span>
          </li>
        </ul>
        <p className="mt-3 text-sm text-amber-800">
          Availability of funds at the time of review also affects approval.
          Submitting an application does not guarantee a distribution.
        </p>
      </div>

      {error === "missing-fields" && (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-2.5 text-sm text-red-800 border border-red-200">
          Please complete all required fields before submitting.
        </p>
      )}
      {error === "submit-failed" && (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-2.5 text-sm text-red-800 border border-red-200">
          Something went wrong. Please try again or email us directly at adminatthepack@gmail.com.
        </p>
      )}

      <form action={submitFundApplication} className="mt-8 space-y-6">
        {/* Contact info */}
        <fieldset className="rounded-lg border border-pack-tan/40 bg-white p-6">
          <legend className="px-1 text-sm font-semibold text-pack-mask">Your contact information</legend>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-neutral-600">
                Full name <span className="text-red-500">*</span>
              </label>
              <input
                name="contact_name"
                type="text"
                required
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-pack-mask focus:outline-none focus:ring-1 focus:ring-pack-mask"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600">
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                name="contact_email"
                type="email"
                required
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-pack-mask focus:outline-none focus:ring-1 focus:ring-pack-mask"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600">
                Phone number <span className="text-neutral-400">(optional)</span>
              </label>
              <input
                name="contact_phone"
                type="tel"
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-pack-mask focus:outline-none focus:ring-1 focus:ring-pack-mask"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600">
                Dog&apos;s name <span className="text-neutral-400">(optional)</span>
              </label>
              <input
                name="dog_name"
                type="text"
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-pack-mask focus:outline-none focus:ring-1 focus:ring-pack-mask"
              />
            </div>
          </div>
        </fieldset>

        {/* Situation */}
        <fieldset className="rounded-lg border border-pack-tan/40 bg-white p-6">
          <legend className="px-1 text-sm font-semibold text-pack-mask">About your situation</legend>

          <div className="mt-3">
            <label className="block text-xs font-medium text-neutral-600">
              Tell us what happened <span className="text-red-500">*</span>
            </label>
            <p className="mt-0.5 text-xs text-neutral-400">
              Describe the injury or circumstance, how it occurred, and the dog&apos;s current condition.
            </p>
            <textarea
              name="situation"
              rows={5}
              required
              placeholder="e.g. K9 Rico was injured during a building search on May 12th — a suspect struck him with a metal pipe, fracturing his left foreleg. He is currently stable but requires surgical repair and 8–12 weeks of rehabilitation…"
              className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-pack-mask focus:outline-none focus:ring-1 focus:ring-pack-mask"
            />
          </div>

          <div className="mt-4">
            <label className="block text-xs font-medium text-neutral-600">
              What specifically are the funds needed for? <span className="text-red-500">*</span>
            </label>
            <p className="mt-0.5 text-xs text-neutral-400">
              Be as specific as possible — surgery type, medication, rehabilitation, specialist consultations, etc.
            </p>
            <textarea
              name="what_for"
              rows={3}
              required
              placeholder="e.g. Orthopedic surgery ($4,200), post-op pain management and antibiotics ($350), 8 weeks of hydrotherapy rehabilitation ($1,800)…"
              className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-pack-mask focus:outline-none focus:ring-1 focus:ring-pack-mask"
            />
          </div>

          <div className="mt-4">
            <label className="block text-xs font-medium text-neutral-600">
              Amount requested <span className="text-neutral-400">(optional — leave blank if unknown)</span>
            </label>
            <input
              name="amount_requested"
              type="text"
              placeholder="e.g. $6,350 total, or $2,000 toward surgery"
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-pack-mask focus:outline-none focus:ring-1 focus:ring-pack-mask"
            />
          </div>

          <div className="mt-4">
            <label className="block text-xs font-medium text-neutral-600">
              Prognosis and expected outcome <span className="text-red-500">*</span>
            </label>
            <p className="mt-0.5 text-xs text-neutral-400">
              What does your veterinarian say about the dog&apos;s chances of recovery with treatment?
              Include any professional assessments you have received.
            </p>
            <textarea
              name="prognosis"
              rows={3}
              required
              placeholder="e.g. The attending veterinarian believes Rico has an 85–90% chance of full recovery with surgery. Without it, the leg cannot heal correctly and he would be unable to continue working…"
              className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-pack-mask focus:outline-none focus:ring-1 focus:ring-pack-mask"
            />
          </div>
        </fieldset>

        {/* Terms acknowledgement */}
        <div className="rounded-lg border border-pack-tan/40 bg-white p-5">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              name="agreed_to_terms"
              type="checkbox"
              required
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300"
            />
            <span className="text-sm text-neutral-600">
              I understand that submitting this application does not guarantee
              approval or disbursement. I confirm that the information provided
              is accurate to the best of my knowledge. I have read and agree to
              the{" "}
              <Link href="/terms" target="_blank" className="underline text-pack-mask hover:text-pack-brown">
                Working Dog Relief Fund terms
              </Link>
              .
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-pack-mask px-5 py-3 font-medium text-pack-cream hover:bg-pack-brown"
        >
          Submit application
        </button>
      </form>
    </div>
  );
}
