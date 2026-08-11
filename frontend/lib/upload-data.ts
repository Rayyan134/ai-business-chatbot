import {
  BarChart3,
  ClipboardCheck,
  FileText,
  FileWarning,
  ShieldAlert,
} from "lucide-react";
import type { DocTypeDefinition, DocTypeId, RecentUploadRow } from "@/lib/upload-types";

export const DOC_TYPES: DocTypeDefinition[] = [
  {
    id: "risk-register",
    label: "Risk Register",
    description: "Upload monthly operational risk register.",
    required: true,
    icon: ShieldAlert,
  },
  {
    id: "audit-findings",
    label: "Audit Findings",
    description: "Internal Audit / GIA findings.",
    required: true,
    icon: ClipboardCheck,
  },
  {
    id: "exception-log",
    label: "Exception Log",
    description: "Operational process exceptions.",
    required: true,
    icon: FileWarning,
  },
  {
    id: "mis",
    label: "Operational MIS",
    description: "Monthly management information report.",
    required: true,
    icon: BarChart3,
  },
  {
    id: "policy",
    label: "Policy Documents",
    description: "Policies and SOPs.",
    required: false,
    icon: FileText,
  },
];

export const DOC_TYPE_LABELS: Record<DocTypeId, string> = {
  "risk-register": "Risk Register",
  "audit-findings": "Audit Findings",
  "exception-log": "Exception Log",
  mis: "Operational MIS",
  policy: "Policy Documents",
};

export const initialRecentUploads: RecentUploadRow[] = [
  {
    id: "row-1",
    filename: "Risk_Register_July_2026.xlsx",
    docType: "risk-register",
    uploadedBy: "Sarah Chen",
    time: "2 mins ago",
    status: "Ready",
  },
  {
    id: "row-2",
    filename: "Audit_Findings_Q2.pdf",
    docType: "audit-findings",
    uploadedBy: "Sarah Chen",
    time: "1 hr ago",
    status: "Ready",
  },
  {
    id: "row-3",
    filename: "Exception_Log.xlsx",
    docType: "exception-log",
    uploadedBy: "Daniel Park",
    time: "Yesterday",
    status: "Ready",
  },
  {
    id: "row-4",
    filename: "MIS_July_2026.xlsx",
    docType: "mis",
    uploadedBy: "Sarah Chen",
    time: "Yesterday",
    status: "Ready",
  },
  {
    id: "row-5",
    filename: "Policy_Manual_2026.pdf",
    docType: "policy",
    uploadedBy: "Aisha Bello",
    time: "Aug 1",
    status: "Ready",
  },
];
