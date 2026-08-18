"use client";

import { useState } from "react";
import { loginAction } from "@/app/actions";
import { MarkButton } from "@/components/mark-button";

export function LoginForm({ next }: { next?: string }) {
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="space-y-3"
      action={async (fd) => {
        const res = await loginAction(fd);
        if (res?.error) setError(res.error);
      }}
    >
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {error ? <p className="text-sm text-stop">{error}</p> : null}
      <label className="block text-sm">
        Email
        <input
          name="email"
          type="email"
          required
          className="mt-1 h-12 w-full rounded-xl border border-[#b7c9be] bg-[#e7efe9] px-4 outline-none transition hover:border-[#8fa89a] focus:border-mark focus:bg-[#f3f8f5] focus:ring-4 focus:ring-mark/15"
        />
      </label>
      <label className="block text-sm">
        Password
        <input
          name="password"
          type="password"
          required
          className="mt-1 h-12 w-full rounded-xl border border-[#b7c9be] bg-[#e7efe9] px-4 outline-none transition hover:border-[#8fa89a] focus:border-mark focus:bg-[#f3f8f5] focus:ring-4 focus:ring-mark/15"
        />
      </label>
      <MarkButton type="submit" className="w-full">
        Log in
      </MarkButton>
    </form>
  );
}
