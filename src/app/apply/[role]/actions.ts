'use server';

import { createClient } from '@/lib/supabase/server';
import { isProviderRole } from '@/lib/apply-config';
import { sendNewApplicationNotification } from '@/lib/email';

export async function submitApplication(
  formData: FormData
): Promise<{ error?: string }> {
  const role = formData.get('role');
  if (!isProviderRole(role)) {
    return { error: 'Invalid role.' };
  }

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const full_name = formData.get('full_name') as string;
  const location = formData.get('location') as string;
  const bio = formData.get('bio') as string;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name } },
  });

  if (error) return { error: error.message };
  if (!data.user) return { error: 'Account creation failed.' };

  const userId = data.user.id;

  const certFiles = (formData.getAll('cert_doc') as File[]).filter(
    (f) => f.size > 0
  );
  const cert_doc_paths: string[] = [];
  for (const file of certFiles) {
    const path = `${userId}/${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('application-docs')
      .upload(path, file);
    if (!uploadError) {
      cert_doc_paths.push(path);
    }
  }

  const dogs: Array<Record<string, unknown>> = JSON.parse(
    (formData.get('dogs_json') as string) || '[]'
  );

  // Upload any per-dog documents (proof of ownership, vet records, etc.)
  const dogsWithDocs = await Promise.all(
    dogs.map(async (dog, i) => {
      const dogFiles = (formData.getAll(`dog_doc_${i}`) as File[]).filter(
        (f) => f.size > 0
      );
      const dogDocPaths: string[] = [];
      for (const file of dogFiles) {
        const path = `${userId}/dog_${i}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('application-docs')
          .upload(path, file);
        if (!uploadError) {
          dogDocPaths.push(path);
        }
      }
      return { ...dog, doc_paths: dogDocPaths };
    })
  );

  const references = JSON.parse(
    (formData.get('references_json') as string) || '[]'
  );

  const application_data = {
    role,
    has_own_dog: formData.get('has_own_dog') === 'yes',
    cert_agencies: formData.getAll('cert_agencies') as string[],
    other_cert_agency: formData.get('other_cert_agency') as string,
    experience_description: formData.get('experience_description') as string,
    goals: formData.getAll('goals') as string[],
    how_found_us: formData.get('how_found_us') as string,
    references,
    dogs: dogsWithDocs,
    cert_doc_paths,
    submitted_at: new Date().toISOString(),
  };

  const { error: profileError } = await supabase.from('profiles').insert({
    id: userId,
    role,
    full_name: full_name || null,
    contact_email: email,
    location: location || null,
    bio: bio || null,
    approval_status: 'pending',
    application_data,
  });

  if (profileError) return { error: profileError.message };

  await sendNewApplicationNotification({
    applicantName: full_name || email,
    applicantEmail: email,
    role,
    profileId: userId,
  });

  return {};
}
