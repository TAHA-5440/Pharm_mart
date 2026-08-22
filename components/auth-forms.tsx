"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions";
import { MarkButton } from "@/components/mark-button";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <form className="space-y-4" action={action}>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {state?.error ? (
        <div className="animate-in fade-in slide-in-from-top-2 rounded-xl border border-stop/20 bg-stop/10 p-3 text-sm font-medium text-stop">
          {state.error}
        </div>
      ) : null}
      <div className="space-y-1">
        <label className="pl-1 text-xs font-semibold uppercase tracking-wider text-ink-soft">
          Email Address
        </label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="name@company.com"
          className="h-12 w-full rounded-xl border border-rule/60 bg-paper/50 px-4 text-ink placeholder:text-ink-soft/40 outline-none backdrop-blur-sm transition-all hover:bg-paper/80 hover:border-mark/40 focus:border-mark focus:bg-sheet focus:ring-4 focus:ring-mark/15"
        />
      </div>
      <div className="space-y-1">
        <label className="pl-1 text-xs font-semibold uppercase tracking-wider text-ink-soft">
          Password
        </label>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="h-12 w-full rounded-xl border border-rule/60 bg-paper/50 px-4 text-ink placeholder:text-ink-soft/40 outline-none backdrop-blur-sm transition-all hover:bg-paper/80 hover:border-mark/40 focus:border-mark focus:bg-sheet focus:ring-4 focus:ring-mark/15"
        />
      </div>
      <div className="pt-2">
        <MarkButton
          type="submit"
          className="relative z-10 h-12 w-full text-base font-semibold shadow-lg shadow-mark/20 transition-all hover:-translate-y-0.5 hover:shadow-mark/30"
        >
          {pending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
              </svg>
              Signing in...
            </span>
          ) : (
            "Log in"
          )}
        </MarkButton>
      </div>
    </form>
  );
}
