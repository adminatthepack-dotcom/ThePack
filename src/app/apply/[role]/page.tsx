'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { APPLY_CONFIGS, isProviderRole } from '@/lib/apply-config';
import { submitApplication } from './actions';

type Dog = {
  name: string;
  breed: string;
  sex: string;
  dob: string;
  isCertDog: '' | 'yes' | 'no';
};

type Reference = {
  name: string;
  relationship: string;
  phone: string;
  email: string;
};

const GOALS = [
  { value: 'looking-for-work', label: 'Looking for work or contracts' },
  {
    value: 'looking-for-certifications',
    label: 'Looking for certification opportunities',
  },
  {
    value: 'looking-for-connections',
    label: 'Networking and building connections',
  },
  { value: 'looking-for-equipment', label: 'Finding equipment and gear' },
  { value: 'sharing-knowledge', label: 'Sharing knowledge and resources' },
];

function Required() {
  return <span className="ml-0.5 text-red-500">*</span>;
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="group relative ml-1.5 inline-block align-middle">
      <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-pack-tan/60 text-[10px] font-bold text-pack-mask">
        ?
      </span>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-64 -translate-x-1/2 rounded-md bg-pack-mask px-3 py-2 text-xs leading-relaxed text-pack-cream opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        {text}
      </span>
    </span>
  );
}

function StepIndicator({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((label, i) => {
        const isCompleted = i < current;
        const isCurrent = i === current;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  isCompleted
                    ? 'bg-pack-mask text-pack-cream'
                    : isCurrent
                      ? 'bg-pack-mask text-pack-cream ring-2 ring-pack-mask ring-offset-2'
                      : 'bg-neutral-100 text-neutral-400'
                }`}
              >
                {isCompleted ? '✓' : i + 1}
              </div>
              <span
                className={`mt-1 max-w-[72px] text-center text-xs ${
                  isCurrent
                    ? 'font-semibold text-pack-mask'
                    : isCompleted
                      ? 'text-pack-brown'
                      : 'text-neutral-400'
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mb-5 h-px w-8 flex-shrink-0 ${
                  i < current ? 'bg-pack-mask' : 'bg-neutral-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ApplyRolePage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role: rawRole } = use(params);
  const router = useRouter();

  if (!isProviderRole(rawRole)) {
    return (
      <div className="py-16 text-center text-pack-brown">Role not found.</div>
    );
  }

  const role = rawRole;
  const config = APPLY_CONFIGS[role];

  const [step, setStep] = useState(0);
  const [hasOwnDog, setHasOwnDog] = useState<boolean | null>(null);
  const [certAgencies, setCertAgencies] = useState<string[]>([]);
  const [otherCertAgency, setOtherCertAgency] = useState('');
  const [experienceDescription, setExperienceDescription] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [howFoundUs, setHowFoundUs] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [dogs, setDogs] = useState<Dog[]>([
    { name: '', breed: '', sex: '', dob: '', isCertDog: '' },
  ]);
  const [dogDocs, setDogDocs] = useState<File[][]>([[]]);
  const [references, setReferences] = useState<Reference[]>([
    { name: '', relationship: '', phone: '', email: '' },
  ]);
  const [certFiles, setCertFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const steps =
    config.includeDogsStep && !(role === 'handler' && hasOwnDog === false)
      ? config.stepLabels
      : config.stepLabels.filter((s) => s !== 'Dog Profiles');

  const isLastStep = step === steps.length - 1;

  function toggleCertAgency(agency: string) {
    setCertAgencies((prev) =>
      prev.includes(agency) ? prev.filter((a) => a !== agency) : [...prev, agency]
    );
  }

  function toggleGoal(value: string) {
    setGoals((prev) =>
      prev.includes(value) ? prev.filter((g) => g !== value) : [...prev, value]
    );
  }

  function updateDog(index: number, field: keyof Dog, value: string) {
    setDogs((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function updateDogDocs(index: number, files: File[]) {
    setDogDocs((prev) => {
      const next = [...prev];
      next[index] = files;
      return next;
    });
  }

  function addDog() {
    setDogs((prev) => [...prev, { name: '', breed: '', sex: '', dob: '', isCertDog: '' }]);
    setDogDocs((prev) => [...prev, []]);
  }

  function removeDog(index: number) {
    setDogs((prev) => prev.filter((_, i) => i !== index));
    setDogDocs((prev) => prev.filter((_, i) => i !== index));
  }

  function updateReference(index: number, field: keyof Reference, value: string) {
    setReferences((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function addReference() {
    if (references.length < 3) {
      setReferences((prev) => [...prev, { name: '', relationship: '', phone: '', email: '' }]);
    }
  }

  function removeReference(index: number) {
    if (references.length > 1) {
      setReferences((prev) => prev.filter((_, i) => i !== index));
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);

    const fd = new FormData();
    fd.append('role', role);
    fd.append('full_name', fullName);
    fd.append('email', email);
    fd.append('password', password);
    fd.append('location', location);
    fd.append('bio', bio);
    fd.append('has_own_dog', hasOwnDog === true ? 'yes' : 'no');
    certAgencies.forEach((a) => fd.append('cert_agencies', a));
    fd.append('other_cert_agency', otherCertAgency);
    fd.append('experience_description', experienceDescription);
    goals.forEach((g) => fd.append('goals', g));
    fd.append('how_found_us', howFoundUs);
    fd.append('dogs_json', JSON.stringify(dogs));
    fd.append('references_json', JSON.stringify(references.filter((r) => r.name.trim())));
    certFiles.forEach((f) => fd.append('cert_doc', f));
    dogs.forEach((_, i) => {
      (dogDocs[i] ?? []).forEach((f) => fd.append(`dog_doc_${i}`, f));
    });

    const result = await submitApplication(fd);
    if (result.error) {
      setSubmitError(result.error);
      setSubmitting(false);
    } else {
      router.push('/pending');
    }
  }

  const inputCls =
    'w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-pack-mask focus:outline-none focus:ring-1 focus:ring-pack-mask';
  const labelCls = 'mb-1 block text-sm font-medium text-pack-mask';

  const certStepReady =
    !config.hasOwnDogQuestion ||
    hasOwnDog !== null;

  const handlerNoDog = role === 'handler' && hasOwnDog === false;

  return (
    <div className="mx-auto max-w-2xl py-10">
      <h1 className="mb-2 text-2xl font-bold text-pack-mask">
        Apply as {config.label}
      </h1>
      <div className="mb-8 mt-4 overflow-x-auto pb-2">
        <StepIndicator steps={steps} current={step} />
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        {/* Step 0 — Certifications */}
        {step === 0 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-pack-mask">
              {config.certLabel}
            </h2>

            {config.hasOwnDogQuestion && (
              <div>
                <p className={labelCls}>
                  Do you have your own dog?<Required />
                </p>
                <div className="flex gap-4">
                  {(['yes', 'no'] as const).map((v) => (
                    <label
                      key={v}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <input
                        type="radio"
                        name="has_own_dog"
                        value={v}
                        checked={hasOwnDog === (v === 'yes')}
                        onChange={() => setHasOwnDog(v === 'yes')}
                        className="accent-pack-mask"
                      />
                      {v === 'yes' ? 'Yes' : 'No'}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {certStepReady && (
              <>
                {handlerNoDog && (
                  <div>
                    <label className={labelCls}>
                      Describe your prior experience working with K9s<Required />
                    </label>
                    <textarea
                      rows={4}
                      value={experienceDescription}
                      onChange={(e) => setExperienceDescription(e.target.value)}
                      className={inputCls}
                      placeholder="Describe your training, handling history, or programs attended..."
                    />
                  </div>
                )}

                <div>
                  <p className={labelCls}>
                    {config.certLabel}
                    {!handlerNoDog && (
                      <>
                        <Required />
                        <span className="ml-1 text-xs font-normal text-neutral-500">
                          (select at least one)
                        </span>
                      </>
                    )}
                  </p>
                  <div className="space-y-2">
                    {config.certAgencies.map((agency) => (
                      <label
                        key={agency}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={certAgencies.includes(agency)}
                          onChange={() => toggleCertAgency(agency)}
                          className="accent-pack-mask"
                        />
                        {agency}
                      </label>
                    ))}
                  </div>
                </div>

                {!handlerNoDog && (
                  <div>
                    <label className={labelCls}>Other certification</label>
                    <input
                      type="text"
                      value={otherCertAgency}
                      onChange={(e) => setOtherCertAgency(e.target.value)}
                      className={inputCls}
                      placeholder="Enter any other certification..."
                    />
                  </div>
                )}

                <div>
                  <label className={labelCls}>
                    Upload supporting documents
                    {handlerNoDog && (
                      <span className="ml-1 text-xs font-normal text-neutral-500">
                        (optional)
                      </span>
                    )}
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) =>
                      setCertFiles(Array.from(e.target.files ?? []))
                    }
                    className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-md file:border file:border-neutral-300 file:bg-neutral-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-pack-mask hover:file:bg-neutral-100"
                  />
                  {certFiles.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {certFiles.map((f, i) => (
                        <li key={i} className="text-xs text-neutral-500">
                          {f.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <p className="rounded-md bg-pack-sand/20 px-3 py-2 text-xs text-neutral-600">
                  {config.certNotes}
                </p>
              </>
            )}
          </div>
        )}

        {/* Step 1 — Goals */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-pack-mask">
              {steps[1]}
            </h2>

            <div>
              <p className={labelCls}>
                What are you hoping to accomplish on The Pack?
              </p>
              <div className="space-y-2">
                {GOALS.map((g) => (
                  <label
                    key={g.value}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={goals.includes(g.value)}
                      onChange={() => toggleGoal(g.value)}
                      className="accent-pack-mask"
                    />
                    {g.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>
                How did you hear about The Pack?
              </label>
              <input
                type="text"
                value={howFoundUs}
                onChange={(e) => setHowFoundUs(e.target.value)}
                className={inputCls}
                placeholder="Word of mouth, social media, search engine..."
              />
            </div>
          </div>
        )}

        {/* Step 2 — References */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-pack-mask">References</h2>
            <p className="text-sm text-pack-brown">
              Provide up to 3 professional references who can speak to your
              work with K9s. At least one reference is strongly encouraged.
              References may be contacted during the review process.
            </p>

            {references.map((ref, i) => (
              <div key={i} className="rounded-md border border-neutral-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-pack-mask">
                    Reference {i + 1}
                  </span>
                  {references.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeReference(i)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Full name</label>
                    <input
                      type="text"
                      value={ref.name}
                      onChange={(e) => updateReference(i, 'name', e.target.value)}
                      className={inputCls}
                      placeholder="Jane Smith"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Relationship / Title</label>
                    <input
                      type="text"
                      value={ref.relationship}
                      onChange={(e) => updateReference(i, 'relationship', e.target.value)}
                      className={inputCls}
                      placeholder="Former supervisor, Certifying trainer…"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Phone</label>
                    <input
                      type="tel"
                      value={ref.phone}
                      onChange={(e) => updateReference(i, 'phone', e.target.value)}
                      className={inputCls}
                      placeholder="(555) 000-0000"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Email</label>
                    <input
                      type="email"
                      value={ref.email}
                      onChange={(e) => updateReference(i, 'email', e.target.value)}
                      className={inputCls}
                      placeholder="jane@example.com"
                    />
                  </div>
                </div>
              </div>
            ))}

            {references.length < 3 && (
              <button
                type="button"
                onClick={addReference}
                className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-pack-mask hover:bg-neutral-50"
              >
                + Add another reference
              </button>
            )}
          </div>
        )}

        {/* Step 3 — Create Profile */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-pack-mask">
              Create Your Profile
            </h2>

            <div>
              <label className={labelCls}>
                Full name<Required />
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>
                Email<Required />
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>
                Password<Required />
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
              />
              <p className="mt-1 text-xs text-neutral-500">At least 8 characters</p>
            </div>

            <div>
              <label className={labelCls}>Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={inputCls}
                placeholder="City, State"
              />
            </div>

            <div>
              <label className={labelCls}>Bio</label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className={inputCls}
                placeholder="Tell the community about yourself..."
              />
            </div>
          </div>
        )}

        {/* Step 4 — Dog Profiles */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-pack-mask">
              Dog Profiles
            </h2>
            <p className="rounded-md bg-pack-sand/20 px-3 py-2 text-xs text-neutral-600">
              Your dog profiles will be fully created after your application is
              approved. You can add photos and more details then.
            </p>

            {dogs.map((dog, i) => (
              <div
                key={i}
                className="rounded-md border border-neutral-200 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-pack-mask">
                    Dog {i + 1}
                  </span>
                  {dogs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDog(i)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Name<Required /></label>
                    <input
                      type="text"
                      value={dog.name}
                      onChange={(e) => updateDog(i, 'name', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Breed<Required /></label>
                    <input
                      type="text"
                      value={dog.breed}
                      onChange={(e) => updateDog(i, 'breed', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Sex<Required /></label>
                    <select
                      value={dog.sex}
                      onChange={(e) => updateDog(i, 'sex', e.target.value)}
                      className={inputCls}
                    >
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Unknown">Unknown</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Date of Birth (optional)</label>
                    <input
                      type="date"
                      value={dog.dob}
                      onChange={(e) => updateDog(i, 'dob', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Is this the certified dog? */}
                {role === 'handler' && (
                  <div className="mt-3">
                    <p className={labelCls}>
                      Is this the dog you are currently certified with?<Required />
                    </p>
                    <div className="flex gap-4">
                      {(['yes', 'no'] as const).map((v) => (
                        <label
                          key={v}
                          className="flex cursor-pointer items-center gap-2 text-sm"
                        >
                          <input
                            type="radio"
                            name={`isCertDog_${i}`}
                            value={v}
                            checked={dog.isCertDog === v}
                            onChange={() => updateDog(i, 'isCertDog', v)}
                            className="accent-pack-mask"
                          />
                          {v === 'yes' ? 'Yes' : 'No'}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Optional dog documents */}
                <div className="mt-3">
                  <label className={labelCls}>
                    Dog documents
                    <span className="ml-1 text-xs font-normal text-neutral-500">(optional)</span>
                    <InfoTooltip text="Upload proof of ownership (AKC registration, microchip records) and any relevant vet records. These help us verify your K9 partnership and will be reviewed alongside your application." />
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) =>
                      updateDogDocs(i, Array.from(e.target.files ?? []))
                    }
                    className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-md file:border file:border-neutral-300 file:bg-neutral-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-pack-mask hover:file:bg-neutral-100"
                  />
                  {(dogDocs[i] ?? []).length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {(dogDocs[i] ?? []).map((f, j) => (
                        <li key={j} className="text-xs text-neutral-500">
                          {f.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addDog}
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-pack-mask hover:bg-neutral-50"
            >
              Add Another Dog
            </button>
          </div>
        )}

        {submitError && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {submitError}
          </p>
        )}

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-pack-mask disabled:cursor-not-allowed disabled:opacity-40 hover:bg-neutral-50"
          >
            Back
          </button>

          {isLastStep ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-md bg-pack-mask px-6 py-2 text-sm font-semibold text-pack-cream shadow-sm disabled:opacity-60 hover:bg-pack-brown"
            >
              {submitting ? 'Submitting…' : 'Submit Application'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (!certStepReady) return;
                setStep((s) => s + 1);
              }}
              disabled={!certStepReady}
              className="rounded-md bg-pack-mask px-6 py-2 text-sm font-semibold text-pack-cream shadow-sm disabled:opacity-40 hover:bg-pack-brown"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
