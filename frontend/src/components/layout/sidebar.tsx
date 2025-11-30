"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Menu, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { navigation } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { useUIStore } from "@/lib/stores";

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();

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
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/5 bg-[#070d13]/95 backdrop-blur-xl transition-transform duration-200 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex h-20 items-center justify-between border-b border-white/5 px-5">
          <Link href="/dashboard" className="group flex flex-col">
            <span className="text-xs uppercase tracking-[0.5em] text-emerald-300/80">
              {siteConfig.slogan}
            </span>
            <span className="text-2xl font-semibold text-white group-hover:text-emerald-300 transition-colors">
              {siteConfig.name}
            </span>
          </Link>
          <button
            onClick={toggleSidebar}
            className="rounded-md p-2 text-emerald-200 hover:bg-white/10 lg:hidden"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          {navigation.map((group) => (
            <div key={group.title} className="mb-6">
              <h3 className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.4em] text-slate-400">
                {group.title}
              </h3>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm text-slate-200 transition-all",
                          isActive
                            ? "border-emerald-400/40 bg-gradient-to-r from-emerald-400/15 via-emerald-200/10 to-transparent text-white shadow-[0_0_25px_rgba(26,188,156,0.35)]"
                            : "hover:border-white/10 hover:bg-white/5"
                        )}
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-emerald-200">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="flex-1 text-sm font-medium">{item.title}</span>
                        {isActive && (
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-300">
                            ativo
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/5 p-5 text-center text-xs text-slate-400">
          <div className="mb-3 flex items-center justify-center gap-2 text-emerald-200">
            <Sparkles className="h-4 w-4" />
            <span>Capacitor - Supabase - RAG</span>
          </div>
          <p>{siteConfig.description}</p>
        </div>
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
