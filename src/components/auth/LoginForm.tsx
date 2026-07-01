"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    startTransition(async () => {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        setError("Invalid email or password.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-white/80">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@galaxy.com"
          className="w-full rounded-xl border border-white/10 bg-space-700/70 px-4 py-3 text-white placeholder-white/30 outline-none transition focus:border-starlight focus:shadow-glow"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-white/80">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="w-full rounded-xl border border-white/10 bg-space-700/70 px-4 py-3 text-white placeholder-white/30 outline-none transition focus:border-starlight focus:shadow-glow"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-gradient-to-r from-midnight-400 to-starlight px-4 py-3 font-semibold text-space-900 transition hover:shadow-glow disabled:opacity-60"
      >
        {isPending ? "Signing in…" : "Log in"}
      </button>

      <p className="text-center text-sm text-white/60">
        New to TAARAA?{" "}
        <Link href="/signup" className="font-semibold text-starlight hover:text-starlight-glow">
          Create an account
        </Link>
      </p>
    </form>
  );
}
