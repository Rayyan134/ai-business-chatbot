import type { ReactNode } from "react";

interface PresentationShellProps {
  children: ReactNode;
}

export function PresentationShell({ children }: PresentationShellProps) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-elevated/60 p-4 shadow-inner sm:p-6 lg:p-8">
      {children}
    </div>
  );
}
