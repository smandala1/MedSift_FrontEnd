"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MedSiftLogo } from "@/components/MedSiftLogo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, LayoutDashboard, Stethoscope, Bell } from "lucide-react";
import type { AuthUser } from "@/types";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("medsift_user");
    if (stored) setUser(JSON.parse(stored));

    // Check pending approvals count (clinician only)
    const pending = JSON.parse(localStorage.getItem("medsift_pending") || "[]") as number[];
    setPendingCount(pending.length);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("medsift_user");
    router.push("/login");
  };

  const isPublic = pathname === "/" || pathname === "/login";
  const isClinician = user?.role === "clinician";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:bg-slate-950/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex h-16 items-center justify-between">
        {/* Logo — white pill wrapper handles dark mode */}
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
          <div className="dark:bg-white dark:rounded-xl dark:px-2 dark:py-0.5">
            <MedSiftLogo height={36} />
          </div>
        </Link>

        {!isPublic && user && (
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <NavLink href="/dashboard" label="Dashboard" pathname={pathname} />
            {/* Clinician-only nav items */}
            {isClinician && (
              <>
                <NavLink href="/upload" label="New Recording" pathname={pathname} />
                <NavLink href="/visits" label="Visits" pathname={pathname} />
                <NavLink href="/analytics" label="Analytics" pathname={pathname} />
              </>
            )}
            {/* Patient-only nav items */}
            {!isClinician && (
              <NavLink href="/visits" label="My Visits" pathname={pathname} />
            )}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {/* Pending approvals bell (clinician only) */}
          {isClinician && pendingCount > 0 && (
            <Link href="/visits" className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4 text-amber-600" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-bold">
                  {pendingCount}
                </span>
              </Button>
            </Link>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 text-sm">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                    {isClinician ? (
                      <Stethoscope className="h-4 w-4 text-primary" />
                    ) : (
                      <User className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <span className="hidden sm:inline">{user.name}</span>
                  <Badge
                    variant="outline"
                    className={isClinician
                      ? "border-blue-300 text-blue-700 text-[10px] px-1.5"
                      : "border-green-300 text-green-700 text-[10px] px-1.5"}
                  >
                    {user.role}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs text-muted-foreground">{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button size="sm" className="bg-primary hover:bg-primary/90">Sign in</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, label, pathname }: { href: string; label: string; pathname: string }) {
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-md transition-colors ${
        active
          ? "bg-primary/10 text-primary font-semibold"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      {label}
    </Link>
  );
}
