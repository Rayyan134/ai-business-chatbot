import { CheckCircle2, Clock, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { RecentStatus } from "@/lib/upload-types";
import { Badge } from "@/components/badge";
import type { BadgeTone } from "@/components/badge";

const statusConfig: Record<RecentStatus, { tone: BadgeTone; icon: LucideIcon }> = {
  Ready: { tone: "emerald", icon: CheckCircle2 },
  Processing: { tone: "blue", icon: Clock },
  Failed: { tone: "rose", icon: XCircle },
};

interface UploadStatusBadgeProps {
  status: RecentStatus;
}

export function UploadStatusBadge({ status }: UploadStatusBadgeProps) {
  const { tone, icon: Icon } = statusConfig[status];
  return (
    <Badge tone={tone}>
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
}
