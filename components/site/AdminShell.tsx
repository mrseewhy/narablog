"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Popover } from "@base-ui/react/popover";
import {
  LayoutDashboard,
  Users,
  Mail,
  Tags,
  Monitor,
  Activity,
  FilePlus,
  LogOut,
  FileText,
  ExternalLink,
  User,
  ChevronDown
} from "lucide-react";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { Logo } from "@/components/site/Logo";
import { ROLES, type Role } from "@/lib/roles";
import { signOutAction } from "@/lib/data/actions/auth.actions";
import { toast } from "sonner";

interface SidebarProps {
  role: Role;
  userName?: string;
  userEmail?: string;
  children: React.ReactNode;
}

export function AdminShell({ role, userName = "User", userEmail = "user@example.com", children }: SidebarProps) {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      const result = await signOutAction();
      if (!result.success) {
        toast.error(result.message);
        setIsSigningOut(false);
        return;
      }
      // Discard cached protected screens and client session state.
      window.location.replace("/sign-in");
    } catch {
      toast.error("Unable to sign out. Please try again.");
      setIsSigningOut(false);
    }
  }

  const navItems = role === ROLES.ADMIN
    ? [
        { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { label: "Contacts", href: "/admin/contacts", icon: Mail },
        { label: "Users", href: "/admin/users", icon: Users },
        { label: "Categories", href: "/admin/categories", icon: Tags },
        { label: "Posts", href: "/admin/posts", icon: FileText },
        { label: "Session", href: "/admin/session", icon: Monitor },
        { label: "Activities", href: "/admin/activities", icon: Activity },
      ]
    : [
        { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { label: "My Posts", href: "/dashboard/posts", icon: FileText },
        { label: "Create Posts", href: "/dashboard/posts/create", icon: FilePlus },
        { label: "Activity", href: "/dashboard/activity", icon: Activity },
      ];

  const userType = role === ROLES.ADMIN ? "Administrator" : "Author";
  const formTitles: Record<string, string> = {
    "/admin/users/create": "Create user",
    "/admin/categories/create": "Create category",
    "/admin/posts/create": "Create post",
    "/dashboard/posts/edit": "Edit Post",
    "/dashboard/profile": "My Profile",
    "/admin/settings": "Profile Settings",
  };
  const activeItem = [...navItems]
    .sort((a, b) => b.href.length - a.href.length)
    .find(item => pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`)));

  return (
    <div className="flex min-h-screen bg-background w-full">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-sidebar text-sidebar-foreground flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <Link href="/" aria-label="NaroBlog home" className="inline-flex items-baseline gap-2">
            <Logo />
            <span className="text-xs font-normal text-muted-foreground">{role}</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeItem?.href === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Account
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium">
            <div className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]">
              {userName[0]}
            </div>
            {userName}
          </div>
          <div className="px-2 py-1 space-y-1">
             <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <ExternalLink className="size-4" />
              Visit Website
            </Link>
            <Link
              href={role === ROLES.ADMIN ? "/admin/settings" : "/dashboard/profile"}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <User className="size-4" />
              Profile Settings
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
            >
              <LogOut className="size-4" />
              {isSigningOut ? "Signing out..." : "Logout"}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="min-w-0 flex-1 flex flex-col">
        <header className="h-16 border-b bg-card flex items-center justify-between px-6">
          <h2 className="font-semibold text-foreground">
            {formTitles[pathname] || activeItem?.label || "Dashboard"}
          </h2>
          <div className="flex items-center gap-4">
            <ThemeToggle />

            <Popover.Root open={isProfileOpen} onOpenChange={setIsProfileOpen}>
              <Popover.Trigger
                aria-label="Account menu"
                className="flex items-center gap-2 p-1 rounded-full hover:bg-muted transition-colors"
              >
                <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold border-2 border-background">
                  {userName[0]}
                </div>
                <ChevronDown className={`size-4 text-muted-foreground transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </Popover.Trigger>

              <Popover.Portal>
                <Popover.Positioner align="end" sideOffset={8} className="z-50">
                  <Popover.Popup aria-label="Account menu" className="w-64 overflow-hidden rounded-xl border bg-card shadow-lg outline-none">
                  <div className="p-4 border-b bg-muted/30">
                    <p className="text-sm font-bold">{userName}</p>
                    <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                    <p className="text-[10px] font-semibold uppercase text-primary mt-1">{userType}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    <Link
                      onClick={() => setIsProfileOpen(false)}
                      href="/"
                      target="_blank"
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="size-4" />
                      Visit Website
                    </Link>
                    <Link
                      onClick={() => setIsProfileOpen(false)}
                      href={role === ROLES.ADMIN ? "/admin/settings" : "/dashboard/profile"}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <User className="size-4" />
                      Profile Settings
                    </Link>
                    <div className="h-px bg-border my-1" />
                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                    >
                      <LogOut className="size-4" />
                      {isSigningOut ? "Signing out..." : "Logout"}
                    </button>
                  </div>
                  </Popover.Popup>
                </Popover.Positioner>
              </Popover.Portal>
            </Popover.Root>
          </div>
        </header>
        <main className="min-w-0 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
