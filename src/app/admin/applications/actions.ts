'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { sendApprovalEmail, sendRejectionEmail } from '@/lib/email';

export async function approveApplication(
  profileId: string,
  adminNotes: string
) {
  // Verify the caller is actually an admin before using the service client.
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) redirect('/login');
  const { data: callerProfile } = await authClient.from('profiles').select('is_admin').eq('id', user.id).single();
  if (!callerProfile?.is_admin) redirect('/');

  const supabase = createServiceClient();

  await supabase
    .from('profiles')
    .update({ approval_status: 'approved', admin_notes: adminNotes })
    .eq('id', profileId);

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, contact_email, application_data')
    .eq('id', profileId)
    .single();

  if (profile) {
    const dogs: Array<{
      name: string;
      breed: string;
      sex: string;
      dob: string;
    }> = profile.application_data?.dogs ?? [];

    if (Array.isArray(dogs) && dogs.length > 0) {
      await supabase.from('dogs').insert(
        dogs.map((dog) => ({
          owner_id: profileId,
          name: dog.name,
          breed: dog.breed,
          sex: dog.sex,
          date_of_birth: dog.dob || null,
          status: 'active',
        }))
      );
    }

    if (profile.contact_email) {
      await sendApprovalEmail({
        to: profile.contact_email,
        name: profile.full_name ?? '',
        role: profile.role,
      });
    }
  }

  redirect('/admin/applications');
}

export async function rejectApplication(
  profileId: string,
  adminNotes: string
) {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) redirect('/login');
  const { data: callerProfile } = await authClient.from('profiles').select('is_admin').eq('id', user.id).single();
  if (!callerProfile?.is_admin) redirect('/');

  const supabase = createServiceClient();

  await supabase
    .from('profiles')
    .update({ approval_status: 'rejected', admin_notes: adminNotes })
    .eq('id', profileId);

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, contact_email')
    .eq('id', profileId)
    .single();

  if (profile?.contact_email) {
    await sendRejectionEmail({
      to: profile.contact_email,
      name: profile.full_name ?? '',
      adminNotes,
    });
  }

  redirect('/admin/applications');
}
