"use client";

import { Bell, ChevronDown, Menu, Search } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface TopBarProps {
  onMenuClick: () => void;
  title?: string;
}

export function TopBar({ onMenuClick, title = "Dashboard" }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border-subtle bg-background/80 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground lg:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2">
        <h1 className="text-base font-semibold text-foreground sm:text-lg">
          {title}
        </h1>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search risks, findings, exceptions…"
            className="h-9 w-64 rounded-lg border border-border-subtle bg-surface pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <ThemeToggle />

        <button
          type="button"
          aria-label="Notifications"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-background" />
        </button>

        <div className="hidden items-center gap-3 border-l border-border-subtle pl-3 sm:flex sm:pl-4">
          <div className="text-right leading-tight">
            <p className="text-sm font-medium text-foreground">Sarah Chen</p>
            <p className="text-xs text-muted-foreground">
              Operational Risk Manager
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            SC
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}
