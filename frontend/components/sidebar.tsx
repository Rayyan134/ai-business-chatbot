"use client";

import { usePathname } from "next/navigation";
import {
  BadgeCheck,
  ClipboardCheck,
  FileText,
  FileWarning,
  HelpCircle,
  LayoutDashboard,
  ScrollText,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      { label: "Upload Documents", href: "/upload", icon: UploadCloud },
      { label: "Risk Register", href: "#", icon: ShieldAlert },
      { label: "Exceptions", href: "#", icon: FileWarning },
    ],
  },
  {
    label: "Governance",
    items: [
      { label: "Audit Findings", href: "#", icon: ClipboardCheck },
      { label: "Compliance", href: "#", icon: BadgeCheck },
      { label: "Policies", href: "#", icon: ScrollText },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { label: "AI Analysis", href: "/analysis/results", icon: Sparkles },
      { label: "Reports", href: "#", icon: FileText },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Settings", href: "#", icon: Settings },
      { label: "Help & Support", href: "#", icon: HelpCircle },
    ],
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  function isActive(item: NavItem) {
    return item.href !== "#" && pathname === item.href;
  }

  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col border-r border-border-subtle bg-surface transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between gap-3 border-b border-border-subtle px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-foreground">
                Risk Copilot
              </p>
              <p className="text-xs text-muted-foreground">
                Meridian Bank · Operational Risk
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-elevated hover:text-foreground lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navSections.map((section) => (
            <div key={section.label} className="mb-5">
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.label}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item);
                  return (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-border-subtle p-4">
          <div className="rounded-lg bg-surface-elevated p-4">
            <p className="text-xs font-semibold text-foreground">
              Quarterly Risk Review
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              78% of actions on track for the Q3 board submission.
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border-subtle">
              <div className="h-full w-[78%] rounded-full bg-primary" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
