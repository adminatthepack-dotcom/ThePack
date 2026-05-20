import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) redirect('/');

  return (
    <div>
      <div className="mb-6 border-b border-neutral-200 pb-4">
        <h1 className="text-lg font-semibold text-pack-mask">Admin Panel</h1>
        <nav className="mt-2 flex gap-4 text-sm">
          <a
            href="/admin/applications"
            className="text-pack-brown hover:text-pack-mask"
          >
            Applications
          </a>
        </nav>
      </div>
      {children}
    </div>
  );
}
