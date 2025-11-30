"use client";

import { Bell, Search, User } from "lucide-react";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 lg:px-6">
      {/* Search */}
      <div className="flex-1">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar..."
            className="w-full rounded-md border bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="rounded-md p-2 hover:bg-accent">
          <Bell className="h-5 w-5" />
        </button>
        <button className="flex items-center gap-2 rounded-md p-2 hover:bg-accent">
          <User className="h-5 w-5" />
          <span className="hidden text-sm font-medium md:inline">Usuario</span>
        </button>
      </div>
    </header>
  );
}
