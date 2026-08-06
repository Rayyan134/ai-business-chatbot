import { ArrowUpRight, Calendar, Download, Plus } from "lucide-react";

export function WelcomeSection() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 p-6 text-white shadow-lg sm:p-8">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-indigo-400/20 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-blue-100">
            <Calendar className="h-4 w-4" />
            {today}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Good morning, Sarah
          </h1>
          <p className="mt-2 max-w-xl text-sm text-blue-100">
            Here&apos;s the operational risk posture for Meridian Bank. You
            have{" "}
            <span className="font-semibold text-white">12 items requiring action</span>{" "}
            across exceptions and audit findings ahead of the quarterly review.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-blue-800 shadow-sm transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Risk Entry
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      <div className="relative mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/15 pt-5 text-sm">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-blue-100">Next board review</span>
          <span className="font-semibold">in 12 days</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
          <span className="text-blue-100">3 findings past due</span>
        </div>
        <a
          href="#"
          className="inline-flex items-center gap-1 font-semibold text-white underline-offset-4 hover:underline"
        >
          View risk posture
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}
