"use client";

import { Sidebar, Topbar } from "@/components/layout";
import { useUIStore } from "@/lib/stores";
import { TenantProvider } from "@/lib/hooks";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <TenantProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className={sidebarCollapsed ? "lg:pl-16" : "lg:pl-72"}>
          <Topbar />
          <main className="p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </TenantProvider>
  );
}
