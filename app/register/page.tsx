import { PhotoFrame } from "@/components/photo-frame";
import { RegisterForm } from "@/components/auth-forms";

export const metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 md:grid-cols-2 md:px-6">
      <PhotoFrame
        src="/images/hero.jpg"
        alt="Manufacturing plant hall"
        className="min-h-[200px] md:min-h-[560px]"
      />
      <div className="rounded-3xl bg-sheet p-6 md:p-8">
        <h1 className="text-3xl font-semibold">Register</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Choose buyer or supplier. Buyers stay free.
        </p>
        <div className="mt-6">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
