"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { registerUser } from "@/app/actions/auth";

export default function SignupForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string[] | undefined>
  >({});

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    startTransition(async () => {
      const res = await registerUser(formData);
      if (!res.success) {
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        if (res.error) setError(res.error);
        return;
      }
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (signInRes?.error) {
        router.push("/login");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    });
  }

  const fieldError = (key: string) =>
    fieldErrors[key]?.[0] ? (
      <p className="text-xs text-red-300">{fieldErrors[key]?.[0]}</p>
    ) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-white/80">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Stargazer"
          className="w-full rounded-xl border border-white/10 bg-space-700/70 px-4 py-3 text-white placeholder-white/30 outline-none transition focus:border-starlight focus:shadow-glow"
        />
        {fieldError("name")}
      </div>

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
        {fieldError("email")}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-white/80">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="At least 8 characters"
          className="w-full rounded-xl border border-white/10 bg-space-700/70 px-4 py-3 text-white placeholder-white/30 outline-none transition focus:border-starlight focus:shadow-glow"
        />
        {fieldError("password")}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-gradient-to-r from-midnight-400 to-starlight px-4 py-3 font-semibold text-space-900 transition hover:shadow-glow disabled:opacity-60"
      >
        {isPending ? "Creating account…" : "Sign up"}
      </button>

      <p className="text-center text-sm text-white/60">
        Already orbiting TAARAA?{" "}
        <Link href="/login" className="font-semibold text-starlight hover:text-starlight-glow">
          Log in
        </Link>
      </p>
    </form>
  );
}
