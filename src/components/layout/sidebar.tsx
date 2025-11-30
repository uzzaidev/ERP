"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronDown, ChevronRight, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { navigation } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { useUIStore } from "@/lib/stores";

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    navigation.reduce((acc, group) => ({ ...acc, [group.title]: true }), {})
  );

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-700/30 bg-slate-900/95 backdrop-blur-xl transition-all duration-200 lg:translate-x-0",
          sidebarCollapsed ? "w-16" : "w-72",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-700/30 px-4">
          {!sidebarCollapsed && (
            <Link href="/dashboard" className="group flex items-center gap-2">
              <span className="text-xl font-semibold text-white group-hover:text-emerald-400 transition-colors">
                {siteConfig.name}
              </span>
            </Link>
          )}
          <button
            onClick={toggleSidebarCollapsed}
            className="hidden lg:block rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
          <button
            onClick={toggleSidebar}
            className="rounded-md p-2 text-emerald-200 hover:bg-white/10 lg:hidden"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          {navigation.map((group) => {
            const isExpanded = expandedGroups[group.title];
            return (
              <div key={group.title} className="mb-4">
                {!sidebarCollapsed ? (
                  <>
                    <button
                      onClick={() => toggleGroup(group.title)}
                      className="mb-2 flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                    >
                      <span>{group.title}</span>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {isExpanded && (
                      <ul className="space-y-1">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = pathname === item.href;
                          return (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                className={cn(
                                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                                  isActive
                                    ? "bg-emerald-500/10 text-emerald-400 font-medium"
                                    : "text-slate-300 hover:bg-slate-800"
                                )}
                              >
                                <Icon className="h-4 w-4" />
                                <span className="flex-1">{item.title}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </>
                ) : (
                  <ul className="space-y-2">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            title={item.title}
                            className={cn(
                              "flex items-center justify-center rounded-lg p-2 transition-all",
                              isActive
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        {!sidebarCollapsed && (
          <div className="border-t border-slate-700/30 p-4 text-center text-xs text-slate-400">
            <p>{siteConfig.description}</p>
          </div>
        )}
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="fixed bottom-4 right-4 z-30 rounded-full bg-primary p-3 text-primary-foreground shadow-lg lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>
    </>
  );
}
