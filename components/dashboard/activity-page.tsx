import { getRecentActivityDAL } from "@/lib/data/dal/activity.dal";
import { DataTable } from "./data-table";
import { Badge, PageHeading, Stats } from "./ui";

export async function ActivityPage({ admin = false }: { admin?: boolean }) {
  const items = await getRecentActivityDAL(admin);
  return (
    <div className="space-y-8">
      <PageHeading
        title={admin ? "Activities" : "Activity"}
        description="Recent activity based on current account, post, and active session records."
      />
      <Stats items={[
        { label: "Recent activities", value: items.length },
        { label: "Post events", value: items.filter(item => item.type === "Posts").length },
        { label: "Account events", value: items.filter(item => item.type === "Account").length },
        { label: "Session starts", value: items.filter(item => item.type === "Security").length },
      ]} />
      <DataTable
        label="Activities"
        filters={["Posts", "Account", "Security"]}
        columns={[...(admin ? ["User"] : []), "Activity", "Details", "Type", "Date"]}
        rows={items.map(item => ({
          id: item.id,
          search: `${item.user} ${item.action} ${item.detail}`,
          filter: item.type,
          cells: [
            ...(admin ? [item.user] : []),
            <span key="action" className="font-medium">{item.action}</span>,
            item.detail,
            <Badge key="type">{item.type}</Badge>,
            new Date(item.date).toLocaleString("en-US", { timeZone: "UTC", dateStyle: "medium", timeStyle: "short" }) + " UTC",
          ],
        }))}
      />
    </div>
  );
}
