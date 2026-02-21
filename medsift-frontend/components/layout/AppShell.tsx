"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import type { AuthUser } from "@/types";

const PUBLIC_PATHS = ["/", "/login"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("medsift_user");
    setUser(stored ? JSON.parse(stored) : null);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("medsift_user");
    setUser(null);
    router.push("/login");
  };

  const isPublic = PUBLIC_PATHS.includes(pathname);

  // Public pages: top navbar
  if (isPublic || !user) {
    return (
      <>
        <Navbar />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      </>
    );
  }

  // Authenticated pages: sidebar layout
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        user={user}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? 68 : 240 }}
      >
        {children}
      </main>
    </div>
  );
}
