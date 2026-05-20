import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ROLE_LABELS, ROLE_BADGE_CLASSES, isRole } from '@/lib/roles';
import { approveApplication, rejectApplication } from '../actions';

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
  approved: 'bg-green-100 text-green-800 ring-green-200',
  rejected: 'bg-red-100 text-red-800 ring-red-200',
};

const GOAL_LABELS: Record<string, string> = {
  'looking-for-work': 'Looking for work or contracts',
  'looking-for-certifications': 'Looking for certification opportunities',
  'looking-for-connections': 'Networking and building connections',
  'looking-for-equipment': 'Finding equipment and gear',
  'sharing-knowledge': 'Sharing knowledge and resources',
};

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (!profile) notFound();

  const appData = profile.application_data ?? {};

  const profileRole = profile.role as string;
  const roleLabel = isRole(profileRole)
    ? ROLE_LABELS[profileRole]
    : profileRole;
  const roleBadge = isRole(profileRole)
    ? ROLE_BADGE_CLASSES[profileRole]
    : 'bg-neutral-100 text-neutral-600 ring-neutral-200';
  const statusBadge =
    STATUS_BADGE[profile.approval_status] ??
    'bg-neutral-100 text-neutral-600 ring-neutral-200';

  const submittedDate = new Date(profile.created_at).toLocaleDateString(
    'en-US',
    { month: 'long', day: 'numeric', year: 'numeric' }
  );

  const docPaths: string[] = appData.cert_doc_paths ?? [];
  const signedUrls: { path: string; url: string }[] = [];
  for (const path of docPaths) {
    const { data } = await supabase.storage
      .from('application-docs')
      .createSignedUrl(path, 3600);
    if (data?.signedUrl) {
      signedUrls.push({ path, url: data.signedUrl });
    }
  }

  const dogs: Array<{
    name: string;
    breed: string;
    sex: string;
    dob: string;
  }> = appData.dogs ?? [];

  const goals: string[] = appData.goals ?? [];
  const certAgencies: string[] = appData.cert_agencies ?? [];
  const references: Array<{ name: string; relationship: string; phone: string; email: string }> =
    appData.references ?? [];

  async function handleApprove(fd: FormData) {
    'use server';
    await approveApplication(id, (fd.get('admin_notes') as string) ?? '');
  }

  async function handleReject(fd: FormData) {
    'use server';
    await rejectApplication(id, (fd.get('admin_notes') as string) ?? '');
  }

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-pack-mask">
              {profile.full_name ?? 'Unnamed Applicant'}
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              {profile.contact_email} · Submitted {submittedDate}
            </p>
          </div>
          <div className="flex gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${roleBadge}`}
            >
              {roleLabel}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusBadge}`}
            >
              {profile.approval_status}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-pack-mask">
          Application Details
        </h3>

        <div className="space-y-5 text-sm">
          {certAgencies.length > 0 && (
            <div>
              <p className="mb-2 font-medium text-neutral-700">
                Certifications held
              </p>
              <div className="flex flex-wrap gap-2">
                {certAgencies.map((a) => (
                  <span
                    key={a}
                    className="rounded-full bg-neutral-100 px-3 py-0.5 text-xs text-neutral-700"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {appData.other_cert_agency && (
            <div>
              <p className="mb-1 font-medium text-neutral-700">
                Other certification
              </p>
              <p className="text-neutral-600">{appData.other_cert_agency}</p>
            </div>
          )}

          {appData.experience_description && (
            <div>
              <p className="mb-1 font-medium text-neutral-700">
                Experience description
              </p>
              <p className="whitespace-pre-wrap rounded-md bg-neutral-50 p-3 text-neutral-600">
                {appData.experience_description}
              </p>
            </div>
          )}

          {appData.has_own_dog !== undefined && (
            <div>
              <p className="mb-1 font-medium text-neutral-700">Has own dog</p>
              <p className="text-neutral-600">
                {appData.has_own_dog ? 'Yes' : 'No'}
              </p>
            </div>
          )}

          {goals.length > 0 && (
            <div>
              <p className="mb-2 font-medium text-neutral-700">Goals</p>
              <ul className="list-inside list-disc space-y-1 text-neutral-600">
                {goals.map((g) => (
                  <li key={g}>{GOAL_LABELS[g] ?? g}</li>
                ))}
              </ul>
            </div>
          )}

          {appData.how_found_us && (
            <div>
              <p className="mb-1 font-medium text-neutral-700">
                How they found us
              </p>
              <p className="text-neutral-600">{appData.how_found_us}</p>
            </div>
          )}

          {references.length > 0 && (
            <div>
              <p className="mb-2 font-medium text-neutral-700">References</p>
              <table className="w-full text-xs">
                <thead className="bg-neutral-50 text-left text-neutral-500">
                  <tr>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Relationship</th>
                    <th className="px-3 py-2">Phone</th>
                    <th className="px-3 py-2">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {references.map((ref, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2">{ref.name || '—'}</td>
                      <td className="px-3 py-2">{ref.relationship || '—'}</td>
                      <td className="px-3 py-2">{ref.phone || '—'}</td>
                      <td className="px-3 py-2">{ref.email || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {dogs.length > 0 && (
            <div>
              <p className="mb-2 font-medium text-neutral-700">
                Dogs submitted
              </p>
              <table className="w-full text-xs">
                <thead className="bg-neutral-50 text-left text-neutral-500">
                  <tr>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Breed</th>
                    <th className="px-3 py-2">Sex</th>
                    <th className="px-3 py-2">DOB</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {dogs.map((dog, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2">{dog.name || '—'}</td>
                      <td className="px-3 py-2">{dog.breed || '—'}</td>
                      <td className="px-3 py-2">{dog.sex || '—'}</td>
                      <td className="px-3 py-2">{dog.dob || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {signedUrls.length > 0 && (
            <div>
              <p className="mb-2 font-medium text-neutral-700">
                Documents uploaded
              </p>
              <ul className="space-y-1">
                {signedUrls.map(({ path, url }) => (
                  <li key={path}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pack-brown underline underline-offset-2 hover:text-pack-mask"
                    >
                      {path.split('/').pop()}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {profile.approval_status === 'pending' && (
        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-pack-mask">
            Decision
          </h3>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Admin notes (optional for approval, encouraged for rejection)
              </label>
            </div>
            <div className="flex gap-3">
              <form action={handleApprove}>
                <textarea
                  name="admin_notes"
                  rows={4}
                  className="mb-3 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-pack-mask focus:outline-none focus:ring-1 focus:ring-pack-mask"
                  placeholder="Reason for decision, missing documents, etc."
                />
                <button
                  type="submit"
                  className="rounded-md bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
                >
                  Approve
                </button>
              </form>
              <form action={handleReject}>
                <textarea
                  name="admin_notes"
                  rows={4}
                  className="mb-3 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-pack-mask focus:outline-none focus:ring-1 focus:ring-pack-mask"
                  placeholder="Reason for decision, missing documents, etc."
                />
                <button
                  type="submit"
                  className="rounded-md bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
                >
                  Reject
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
