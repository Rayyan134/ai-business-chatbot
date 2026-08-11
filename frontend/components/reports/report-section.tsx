import type { ReactNode } from "react";

interface ReportSectionProps {
  number: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export function ReportSection({
  number,
  title,
  description,
  children,
}: ReportSectionProps) {
  return (
    <section>
      <div className="flex items-baseline gap-2 border-b-2 border-foreground pb-2">
        <span className="text-lg font-bold text-foreground">{number}.</span>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
      </div>
      {description ? (
        <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}
