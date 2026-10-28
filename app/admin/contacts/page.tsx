import { Suspense } from "react";
import { ContactsPage } from "@/components/dashboard/contacts-page";
import { DashboardPageSkeleton } from "@/components/dashboard/page-skeleton";
import { getAdminContactsDAL } from "@/lib/data/dal/contact.dal";

async function Content() {
  return <ContactsPage contacts={await getAdminContactsDAL()} />;
}

export default function Page() {
  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <Content />
    </Suspense>
  );
}
