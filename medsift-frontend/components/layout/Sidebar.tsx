"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Upload, FileText, BarChart3,
  LogOut, ChevronLeft, ChevronRight, Stethoscope, User,
} from "lucide-react";
import type { AuthUser } from "@/types";

interface SidebarProps {
  user: AuthUser;
  onLogout: () => void;
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ user, onLogout, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const isClinician = user.role === "clinician";

  const navItems = isClinician
    ? [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/upload", label: "New Recording", icon: Upload },
        { href: "/visits", label: "Visits", icon: FileText },
        { href: "/analytics", label: "Analytics", icon: BarChart3 },
      ]
    : [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/visits", label: "My Visits", icon: FileText },
      ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen flex flex-col border-r bg-white z-40 transition-all duration-300 ${
        collapsed ? "w-[68px]" : "w-[240px]"
      }`}
    >
      {/* Logo + collapse toggle */}
      <div className="flex items-center justify-between h-16 px-3 border-b">
        <Link href="/" className="flex items-center overflow-hidden">
          {collapsed ? (
            <div className="relative w-9 h-9 shrink-0">
              <Image src="/logo.png" alt="MedSift AI" fill className="object-cover object-center" priority />
            </div>
          ) : (
            <div className="relative w-[140px] h-[40px]">
              <Image src="/logo.png" alt="MedSift AI" fill className="object-cover object-center" priority />
            </div>
          )}
        </Link>
        <button
          onClick={onToggle}
          className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-slate-100 text-slate-400 shrink-0"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-primary" : "text-slate-400"}`} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User section at bottom */}
      <div className="border-t p-3">
        {!collapsed ? (
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              {isClinician ? <Stethoscope className="h-4 w-4 text-primary" /> : <User className="h-4 w-4 text-primary" />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-3" title={user.name}>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              {isClinician ? <Stethoscope className="h-4 w-4 text-primary" /> : <User className="h-4 w-4 text-primary" />}
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className={`text-red-500 hover:text-red-600 hover:bg-red-50 ${collapsed ? "w-full justify-center px-0" : "w-full justify-start gap-2"}`}
          title={collapsed ? "Log out" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && "Log out"}
        </Button>
      </div>
    </aside>
  );
}
