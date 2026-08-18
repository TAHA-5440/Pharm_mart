import Link from "next/link";
import { PhotoFrame } from "@/components/photo-frame";
import { LoginForm } from "@/components/auth-forms";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 md:grid-cols-2 md:px-6">
      <PhotoFrame
        src="/images/workshop.jpg"
        alt="Workshop steel and tools"
        className="min-h-[220px] md:min-h-[480px]"
      />
      <div className="rounded-3xl bg-sheet p-6 md:p-8">
        <h1 className="text-3xl font-semibold">Log in</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Demo: maria.s@example.com / password123
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
        <p className="mt-6 text-sm">
          New here?{" "}
          <Link href="/register" className="text-steel">
            Register as buyer or supplier
          </Link>
        </p>
      </div>
    </div>
  );
}
