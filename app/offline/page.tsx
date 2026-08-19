import { MarkButton } from "@/components/mark-button";

export const metadata = { title: "Offline", robots: { index: false, follow: false } };

export default function OfflinePage() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-16">
      <p className="text-[11px] font-medium tracking-[0.16em] text-mark uppercase">ProcureX</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">You are offline</h1>
      <p className="mt-3 text-sm text-ink-soft">
        This desk needs a connection to load RFQs, quotes, and listings. Reconnect and try again.
      </p>
      <div className="mt-8">
        <MarkButton href="/">Back to home</MarkButton>
      </div>
    </div>
  );
}
