import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updatePassword } from "./actions";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  // If there's no active session the reset link has already been used or
  // expired — send the user back to start the flow again.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(
      "/forgot-password?error=" +
        encodeURIComponent(
          "That link has expired. Request a new one below."
        )
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold tracking-tight">
        Set a new password
      </h1>
      <p className="mt-2 text-sm text-neutral-600">
        Choose a password you haven&apos;t used before.
      </p>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={updatePassword} className="mt-6 space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
          <p className="mt-1 text-xs text-neutral-500">At least 8 characters.</p>
        </div>

        <div>
          <label
            htmlFor="confirm_password"
            className="block text-sm font-medium"
          >
            Confirm new password
          </label>
          <input
            id="confirm_password"
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Update password
        </button>
      </form>
    </div>
  );
}
