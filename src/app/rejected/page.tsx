import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@k9platform.com';

export default async function RejectedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let adminNotes: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('admin_notes')
      .eq('id', user.id)
      .single();
    adminNotes = profile?.admin_notes ?? null;
  }

  return (
    <div className="mx-auto max-w-lg py-20 text-center">
      <h1 className="text-2xl font-bold text-pack-mask">
        Application Not Approved
      </h1>
      <p className="mt-4 text-pack-brown">
        Unfortunately your application was not approved at this time.
      </p>

      {adminNotes && (
        <div className="mt-6 rounded-md border border-neutral-200 bg-neutral-50 p-4 text-left">
          <p className="mb-2 text-sm font-semibold text-pack-mask">
            Reason provided:
          </p>
          <p className="text-sm text-neutral-600">{adminNotes}</p>
        </div>
      )}

      <div className="mt-8 space-y-3 text-sm text-pack-brown">
        <p>
          <Link
            href="/apply"
            className="font-medium text-pack-mask underline underline-offset-2 hover:text-pack-brown"
          >
            You may reapply by submitting a new application.
          </Link>
        </p>
        <p>
          If you believe this was an error, contact us at{' '}
          <a
            href={`mailto:${ADMIN_EMAIL}`}
            className="underline underline-offset-2 hover:text-pack-mask"
          >
            {ADMIN_EMAIL}
          </a>
        </p>
      </div>

      <div className="mt-10">
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
