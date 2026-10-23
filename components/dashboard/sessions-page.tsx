import { Monitor, Smartphone } from "lucide-react";
import { DataTable } from "./data-table";
import { Badge, PageHeading, Stats } from "./ui";

const sessions = [
  { id: 1, name: "Administrator", email: "admin@example.com", device: "Chrome on macOS", location: "Lagos, Nigeria", ip: "192.0.2.24", lastActive: "Just now", status: "Current", mobile: false },
  { id: 2, name: "Olusegun", email: "olusegun@example.com", device: "Safari on iPhone", location: "Abuja, Nigeria", ip: "192.0.2.36", lastActive: "12 minutes ago", status: "Active", mobile: true },
  { id: 3, name: "Ngozi Eze", email: "ngozi@example.com", device: "Firefox on Windows", location: "Enugu, Nigeria", ip: "198.51.100.12", lastActive: "35 minutes ago", status: "Active", mobile: false },
  { id: 4, name: "Amara Okafor", email: "amara@example.com", device: "Chrome on Android", location: "Lagos, Nigeria", ip: "203.0.113.18", lastActive: "Oct 20, 2026", status: "Expired", mobile: true },
];

export function SessionsPage() {
  return <div className="space-y-8"><PageHeading title="Session" description="View account sessions, devices, and recent sign-in activity." /><Stats items={[{ label: "Total sessions", value: sessions.length }, { label: "Active sessions", value: 3 }, { label: "Mobile devices", value: 2 }, { label: "Expired sessions", value: 1 }]} /><DataTable label="Sessions" filters={["Current", "Active", "Expired"]} columns={["User", "Device", "Location", "IP address", "Last active", "Status"]} rows={sessions.map(session => ({ id: session.id, search: `${session.name} ${session.email} ${session.device} ${session.location} ${session.ip}`, filter: session.status, cells: [<div key="user"><p className="font-medium">{session.name}</p><p className="mt-1 text-xs text-muted-foreground">{session.email}</p></div>, <span key="device" className="inline-flex items-center gap-2 whitespace-nowrap">{session.mobile ? <Smartphone className="size-4 text-muted-foreground" /> : <Monitor className="size-4 text-muted-foreground" />}{session.device}</span>, session.location, <span key="ip" className="font-mono text-xs">{session.ip}</span>, session.lastActive, <Badge key="status">{session.status}</Badge>] }))} /></div>;
}
