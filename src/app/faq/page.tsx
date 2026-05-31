export const metadata = {
  title: "FAQ — THE PACK",
};

const FAQS = [
  {
    q: "How do we evaluate and verify providers on the platform?",
    a: `Every provider application is manually reviewed by our team before approval. We examine the credentials and documentation submitted with each application — this includes professional certifications (e.g., NAPWDA, USPCA, AKC titles), state or federal licenses, business registrations, and, where applicable, proof of K9 ownership and partnership.

We cross-reference submitted credentials against the issuing agencies where possible and may follow up directly with applicants for clarification. Applications that cannot be verified or that do not meet our standards are declined, with a reason provided. Our goal is to ensure that every approved provider on The Pack represents a legitimate, qualified professional in the working-dog community.`,
  },
  {
    q: "Who can apply as a provider?",
    a: `The Pack accepts applications from K9 Handlers, Trainers, Breeders, Veterinarians, Transporters, and Employers (agencies or businesses that hire K9 teams). Certification agencies are currently invite-only and not available through the public application flow.

If you are a client — someone looking to hire a provider, purchase a dog, or post a contract — you can sign up instantly with no approval required.`,
  },
  {
    q: "How long does the application review take?",
    a: `Most applications are reviewed within 1–3 business days. You will receive an email at the address you provided when your application is approved or if additional information is needed. If your application is not approved, we will include the reason so you can address any issues and reapply.`,
  },
  {
    q: "What happens if my application is not approved?",
    a: `If we are unable to approve your application, you will receive an email explaining why. Common reasons include unverifiable credentials, incomplete documentation, or a mismatch between the role applied for and the documentation provided.

You are welcome to reapply after addressing the issue — simply start a new application at /apply with updated documentation.`,
  },
  {
    q: "Is my submitted documentation kept secure?",
    a: `Yes. Documents uploaded during the application process are stored in a private, access-controlled storage bucket and are only accessible to our administrative team for review purposes. Once your application is approved, you can upload any certifications and licenses you want the public to see directly to your profile through the standard document manager — you decide what is visible and what stays private.`,
  },
  {
    q: "Can I update my profile after I'm approved?",
    a: `Absolutely. Once approved, you have full access to edit your profile — add a bio, upload certifications and documents, list your dogs, update your location, and more. Your profile is your public-facing presence on the platform, and you control what is shown.`,
  },
  {
    q: "How do I contact support?",
    a: `Reach us at support@thepackk9.com. We aim to respond within one business day.`,
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight text-pack-mask">
        Frequently Asked Questions
      </h1>
      <p className="mt-3 text-pack-brown">
        Questions about how The Pack works, how we vet providers, and what to
        expect after you apply.
      </p>

      <div className="mt-10 divide-y divide-pack-tan/40">
        {FAQS.map(({ q, a }) => (
          <details key={q} className="group py-6">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
              <span className="text-base font-semibold text-pack-mask group-open:text-pack-brown">
                {q}
              </span>
              <span className="mt-0.5 shrink-0 text-pack-tan transition-transform group-open:rotate-45">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </span>
            </summary>
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-neutral-700">
              {a}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
