import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { SlideViewer } from "@/components/presentations/slide-viewer";
import { deckSlides, presentationMeta } from "@/lib/presentation-data";

export const metadata: Metadata = {
  title: "Board Presentation Preview · Risk Copilot",
  description:
    "AI-generated board presentation preview for Meridian Bank, July 2026.",
};

export default async function PresentationsPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ runId?: string; resultId?: string }>;
}) {
  const params = await searchParams;
  return (
    <AppShell title="Board Presentation Preview">
      <SlideViewer
        slides={deckSlides}
        meta={presentationMeta}
        runId={params.runId ?? null}
        resultId={params.resultId ?? null}
      />
    </AppShell>
  );
}
