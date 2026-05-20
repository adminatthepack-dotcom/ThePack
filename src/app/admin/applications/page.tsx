import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ROLE_LABELS, ROLE_BADGE_CLASSES, isRole } from '@/lib/roles';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
  approved: 'bg-green-100 text-green-800 ring-green-200',
  rejected: 'bg-red-100 text-red-800 ring-red-200',
};

const FILTERS: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: rawStatus } = await searchParams;
  const statusFilter: StatusFilter =
    rawStatus === 'all' ||
    rawStatus === 'approved' ||
    rawStatus === 'rejected'
      ? rawStatus
      : 'pending';

  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from('profiles')
    .select(
      'id, full_name, role, contact_email, approval_status, created_at, is_admin'
    )
    .neq('role', 'customer')
    .neq('is_admin', true)
    .order('created_at', { ascending: false });

  const allProfiles = profiles ?? [];

  const filtered =
    statusFilter === 'all'
      ? allProfiles
      : allProfiles.filter((p) => p.approval_status === statusFilter);

  const pendingCount = allProfiles.filter(
    (p) => p.approval_status === 'pending'
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-pack-mask">Applications</h2>
          {pendingCount > 0 && (
            <p className="mt-1 text-sm text-yellow-700">
              {pendingCount} pending{' '}
              {pendingCount === 1 ? 'application' : 'applications'} awaiting
              review
            </p>
          )}
        </div>
        <Link
          href="/admin/instructors"
          className="rounded-md border border-pack-tan/40 px-3 py-1.5 text-sm text-pack-brown hover:border-pack-tan hover:text-pack-mask"
        >
          Instructor requests →
        </Link>
      </div>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={
              f.value === 'pending'
                ? '/admin/applications'
                : `/admin/applications?status=${f.value}`
            }
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              statusFilter === f.value
                ? 'bg-pack-mask text-pack-cream'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-neutral-500">No applications found.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((p) => {
                const roleLabel = isRole(p.role)
                  ? ROLE_LABELS[p.role]
                  : p.role;
                const roleBadge = isRole(p.role)
                  ? ROLE_BADGE_CLASSES[p.role]
                  : 'bg-neutral-100 text-neutral-600 ring-neutral-200';
                const statusBadge =
                  STATUS_BADGE[p.approval_status] ??
                  'bg-neutral-100 text-neutral-600 ring-neutral-200';
                const submittedDate = new Date(p.created_at).toLocaleDateString(
                  'en-US',
                  { month: 'short', day: 'numeric', year: 'numeric' }
                );
                return (
                  <tr key={p.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium text-pack-mask">
                      {p.full_name ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${roleBadge}`}
                      >
                        {roleLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {p.contact_email ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-neutral-500">
                      {submittedDate}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusBadge}`}
                      >
                        {p.approval_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/applications/${p.id}`}
                        className="text-pack-brown underline-offset-2 hover:text-pack-mask hover:underline"
                      >
                        Review →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
