"use client";

import { useState } from "react";
import { loginAction, registerAction } from "@/app/actions";
import { MarkButton } from "@/components/mark-button";
import { CITIES } from "@/lib/utils";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="space-y-3"
      action={async (fd) => {
        const res = await loginAction(fd);
        if (res?.error) setError(res.error);
      }}
    >
      {error ? <p className="text-sm text-stop">{error}</p> : null}
      <label className="block text-sm">
        Email
        <input
          name="email"
          type="email"
          required
          className="mt-1 h-11 w-full rounded-full border border-rule bg-paper px-4"
        />
      </label>
      <label className="block text-sm">
        Password
        <input
          name="password"
          type="password"
          required
          className="mt-1 h-11 w-full rounded-full border border-rule bg-paper px-4"
        />
      </label>
      <MarkButton type="submit">Log in</MarkButton>
    </form>
  );
}

export function RegisterForm() {
  const [role, setRole] = useState<"buyer" | "supplier">("buyer");
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="space-y-3"
      action={async (fd) => {
        fd.set("role", role);
        const res = await registerAction(fd);
        if (res?.error) setError(res.error);
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setRole("buyer")}
          className={`rounded-3xl border p-4 text-left ${role === "buyer" ? "border-ink bg-paper" : "border-rule bg-sheet"}`}
        >
          <p className="font-medium">Buyer organisation</p>
          <p className="mt-1 text-sm text-ink-soft">Post RFQs. Free.</p>
        </button>
        <button
          type="button"
          onClick={() => setRole("supplier")}
          className={`rounded-3xl border p-4 text-left ${role === "supplier" ? "border-ink bg-paper" : "border-rule bg-sheet"}`}
        >
          <p className="font-medium">Supplier organisation</p>
          <p className="mt-1 text-sm text-ink-soft">Receive matched industrial RFQs.</p>
        </button>
      </div>
      {error ? <p className="text-sm text-stop">{error}</p> : null}
      <label className="block text-sm">
        Your name
        <input name="name" required className="mt-1 h-11 w-full rounded-full border border-rule bg-paper px-4" />
      </label>
      <label className="block text-sm">
        Company
        <input name="company" required className="mt-1 h-11 w-full rounded-full border border-rule bg-paper px-4" />
      </label>
      <label className="block text-sm">
        Email
        <input name="email" type="email" required className="mt-1 h-11 w-full rounded-full border border-rule bg-paper px-4" />
      </label>
      <label className="block text-sm">
        Phone
        <input name="phone" required className="mt-1 h-11 w-full rounded-full border border-rule bg-paper px-4" />
      </label>
      <label className="block text-sm">
        City
        <select name="city" className="mt-1 h-11 w-full rounded-full border border-rule bg-paper px-4">
          {CITIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        Industry
        <select name="industry" className="mt-1 h-11 w-full rounded-full border border-rule bg-paper px-4">
          <option value="pharmaceutical">Pharmaceutical</option>
          <option value="food_beverage">Food & Beverage</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label className="block text-sm">
        Password (8+ characters)
        <input name="password" type="password" required minLength={8} className="mt-1 h-11 w-full rounded-full border border-rule bg-paper px-4" />
      </label>
      <MarkButton type="submit">Create account</MarkButton>
    </form>
  );
}
