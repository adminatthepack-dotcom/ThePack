import Link from "next/link";
import { signup } from "./actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold tracking-tight">
        Sign up as a Client
      </h1>
      <p className="mt-2 text-sm text-neutral-600">
        Create a client account to contact providers, post contracts on the
        marketplace, and browse the directory. No approval required.
      </p>
      <p className="mt-1 text-sm text-neutral-500">
        Are you a handler, trainer, breeder, vet, transporter, or employer?{" "}
        <Link href="/apply" className="font-medium text-neutral-900 underline">
          Apply as a provider instead →
        </Link>
      </p>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={signup} className="mt-6 space-y-5">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium">
            Full name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
        </div>

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

        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
          <p className="mt-1 text-xs text-neutral-500">At least 8 characters.</p>
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Create account
        </button>
      </form>

      <p className="mt-4 text-sm text-neutral-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-neutral-900 underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
