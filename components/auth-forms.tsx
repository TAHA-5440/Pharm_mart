"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions";
import { MarkButton } from "@/components/mark-button";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <form className="space-y-3" action={action}>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {state?.error ? <p className="text-sm text-stop">{state.error}</p> : null}
      <label className="block text-sm">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 h-12 w-full rounded-xl border border-rule bg-paper px-4 outline-none transition hover:border-mark/40 focus:border-mark focus:bg-sheet focus:ring-4 focus:ring-mark/15"
        />
      </label>
      <label className="block text-sm">
        Password
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 h-12 w-full rounded-xl border border-rule bg-paper px-4 outline-none transition hover:border-mark/40 focus:border-mark focus:bg-sheet focus:ring-4 focus:ring-mark/15"
        />
      </label>
      <MarkButton type="submit" className="relative z-10 w-full">
        {pending ? "Signing in…" : "Log in"}
      </MarkButton>
    </form>
  );
}
