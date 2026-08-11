import { Sparkles } from "lucide-react";
import { Badge } from "@/components/badge";
import { Card, CardHeader } from "@/components/card";
import type { ExecutiveSummary } from "@/lib/analysis-types";

interface ExecutiveSummaryProps {
  summary: ExecutiveSummary;
}

export function ExecutiveSummary({ summary }: ExecutiveSummaryProps) {
  return (
    <Card>
      <CardHeader
        title="Executive Summary"
        subtitle={`AI-generated on ${summary.generatedAt}`}
        action={
          <Badge tone="blue">
            <Sparkles className="h-3 w-3" />
            AI generated
          </Badge>
        }
      />
      <div className="space-y-3 px-5 py-5">
        {summary.paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className={`text-sm leading-relaxed ${
              index === 0 ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {paragraph}
          </p>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-border-subtle px-5 py-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Sources
        </span>
        {summary.sources.map((source) => (
          <Badge key={source.label} tone="slate">
            {source.label} · {source.count}
          </Badge>
        ))}
      </div>
    </Card>
  );
}
