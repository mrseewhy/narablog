import React from "react";
import type { Viewport } from "next";
import { AdminShell } from "@/components/site/AdminShell";

export const viewport: Viewport = { interactiveWidget: "resizes-content" };

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminShell role="admin" userName="Administrator">
      {children}
    </AdminShell>
  );
}
