"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { requestPasswordReset } from "./actions";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await requestPasswordReset(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSent(true);
      }
    });
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Enter your email and we&apos;ll send you a link to set a new password.
      </p>

      {sent && (
        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          If that email is registered, you&apos;ll receive a reset link shortly.
          Check your inbox (and spam folder).
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {!sent && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
          >
            {isPending ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}

      <p className="mt-4 text-sm text-neutral-600">
        <Link href="/login" className="font-medium text-neutral-900 underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
