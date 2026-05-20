'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function linkHandler(
  employerId: string,
  handlerEmail: string
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== employerId) {
    return { error: 'Unauthorized.' };
  }

  const { data: handler } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('contact_email', handlerEmail.trim().toLowerCase())
    .maybeSingle();

  if (!handler) {
    return { error: 'No handler found with that email address.' };
  }
  if (handler.role !== 'handler') {
    return { error: 'That profile is not a handler.' };
  }
  if (handler.id === employerId) {
    return { error: 'You cannot link yourself.' };
  }

  const { error } = await supabase
    .from('employer_handlers')
    .insert({ employer_id: employerId, handler_id: handler.id });

  if (error) {
    if (error.code === '23505') return { error: 'That handler is already linked.' };
    return { error: error.message };
  }

  revalidatePath(`/profile/${employerId}`);
  return {};
}

export async function unlinkHandler(
  employerId: string,
  handlerId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== employerId) {
    return { error: 'Unauthorized.' };
  }

  await supabase
    .from('employer_handlers')
    .delete()
    .eq('employer_id', employerId)
    .eq('handler_id', handlerId);

  revalidatePath(`/profile/${employerId}`);
  return {};
}
