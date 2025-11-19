"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function EnterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/auth/viewer", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
        return;
      }

      const data = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;
      setError(data?.error || "Incorrect password. Please try again.");
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-rose-50 to-white px-4 py-12 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
      <div className="mx-auto flex max-w-md flex-col items-center gap-8">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-gradient-to-br from-rose-400 via-pink-400 to-fuchsia-400 p-4 shadow-lg shadow-rose-300/50 dark:shadow-rose-900/50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-8 w-8 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-pink-500 dark:text-pink-300">
            Ludovica's Little Moments
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-rose-900 dark:text-rose-100">
            Welcome!
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-rose-700/80 dark:text-rose-100/70">
            This is a private space filled with precious moments.
            <br />
            Please enter the password to continue.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full rounded-3xl border border-rose-100 bg-white/80 p-6 shadow-[0_18px_45px_rgba(244,114,182,0.25)] backdrop-blur dark:border-rose-900/40 dark:bg-slate-900/70 dark:shadow-[0_18px_45px_rgba(15,23,42,0.85)]"
        >
          <label className="block text-xs font-medium uppercase tracking-[0.2em] text-rose-400 dark:text-rose-300">
            Password
          </label>
          <div className="relative mt-2">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              className="w-full rounded-2xl border border-rose-100 bg-rose-50/60 px-3 py-2 pr-10 text-sm text-rose-950 outline-none ring-0 placeholder:text-rose-300 focus:border-rose-400 focus:bg-white focus:text-rose-950 focus:ring-2 focus:ring-rose-200 dark:border-rose-900/60 dark:bg-slate-800 dark:text-rose-50 dark:placeholder:text-slate-500 dark:focus:border-rose-400 dark:focus:bg-slate-800 dark:focus:text-rose-50 dark:focus:ring-rose-500/40"
              placeholder="Enter password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-400 hover:text-rose-600 dark:text-rose-500 dark:hover:text-rose-300"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              )}
            </button>
          </div>

          {error && (
            <p className="mt-3 text-xs text-rose-500 dark:text-rose-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-rose-400 via-pink-400 to-fuchsia-400 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-300/60 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70 dark:from-rose-500 dark:via-pink-500 dark:to-fuchsia-500 dark:shadow-rose-900/70"
          >
            {loading ? "Checking..." : "Enter"}
          </button>
        </form>

        <div className="rounded-2xl border border-rose-100 bg-rose-50/50 px-4 py-3 text-center text-xs text-rose-500 dark:border-rose-900/50 dark:bg-slate-900/50 dark:text-rose-300">
          <p className="font-medium">💝 A note from the family</p>
          <p className="mt-1 leading-relaxed">
            This password was shared with you to keep these precious moments
            private. Please don't share it with others.
          </p>
        </div>
      </div>
    </div>
  );
}
