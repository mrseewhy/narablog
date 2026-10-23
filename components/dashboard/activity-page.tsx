import { activities } from "@/lib/data/demo/dashboard";
import { DataTable } from "./data-table";
import { Badge, PageHeading, Stats } from "./ui";

export function ActivityPage({ admin = false }: { admin?: boolean }) {
  const items = admin ? activities : activities.filter(item => item.user === "Olusegun");
  return <div className="space-y-8"><PageHeading title={admin ? "Activities" : "Activity"} description={admin ? "Follow account, publishing, and security activity across NaroBlog." : "A timeline of your recent publishing and account activity."} /><Stats items={[{ label: "Total activities", value: items.length }, { label: "Post updates", value: items.filter(item => item.type === "Posts").length }, { label: "Account updates", value: items.filter(item => item.type === "Account").length }, { label: "Security events", value: items.filter(item => item.type === "Security").length }]} /><DataTable label="Activities" filters={["Posts", "Account", "Security"]} columns={[...(admin ? ["User"] : []), "Activity", "Details", "Type", "Date"]} rows={items.map(item => ({ id: item.id, search: `${item.user} ${item.action} ${item.detail}`, filter: item.type, cells: [...(admin ? [item.user] : []), <span key="action" className="font-medium">{item.action}</span>, item.detail, <Badge key="type">{item.type}</Badge>, item.date] }))} /></div>;
}
