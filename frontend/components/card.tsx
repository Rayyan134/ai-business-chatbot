import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-border-subtle bg-surface shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function CardHeader({
  title,
  subtitle,
  action,
  className = "",
}: CardHeaderProps) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-5 py-4 ${className}`}
    >
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {subtitle ? (
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
