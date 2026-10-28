"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setContactReadAction } from "@/lib/data/actions/contact.actions";
import type { getAdminContactsDAL } from "@/lib/data/dal/contact.dal";
import { DataTable } from "./data-table";
import { Badge, PageHeading, Stats } from "./ui";

type Contact = Awaited<ReturnType<typeof getAdminContactsDAL>>[number];

function received(date: Date) {
  return new Date(date).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  });
}

export function ContactsPage({ contacts }: { contacts: Contact[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [readOverride, setReadOverride] = useState<{
    source: Contact[];
    values: Record<string, boolean>;
  }>({ source: contacts, values: {} });
  const readOverrides = readOverride.source === contacts ? readOverride.values : {};
  const rows = contacts.map((contact) => ({
    ...contact,
    isRead: readOverrides[contact.publicId] ?? contact.isRead,
  }));
  const message = rows.find((contact) => contact.publicId === selected);
  const unread = rows.filter((contact) => !contact.isRead).length;

  async function changeRead(contact: Contact, isRead: boolean) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await setContactReadAction(contact.publicId, isRead);
      if (!result.success) {
        setError(result.message);
        return;
      }
      setReadOverride({
        source: contacts,
        values: { ...readOverrides, [contact.publicId]: isRead },
      });
      router.refresh();
    } catch {
      setError("Unable to update the message. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function open(contact: Contact) {
    setSelected(contact.publicId);
    setError("");
    if (!contact.isRead) void changeRead(contact, true);
  }

  return (
    <div className="space-y-8">
      <PageHeading
        title="Contacts"
        description="Read enquiries, feedback, and messages from your community."
      />
      <Stats
        items={[
          { label: "Total messages", value: rows.length },
          { label: "Unread", value: unread },
          { label: "Read", value: rows.length - unread },
        ]}
      />
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {message && (
        <section
          id="contact-detail"
          className="rounded-xl border bg-card p-6 shadow-sm"
          aria-labelledby="message-heading"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 flex items-center gap-2 text-primary">
                <Mail className="size-4" aria-hidden="true" />
                <Badge>{message.isRead ? "Read" : "Unread"}</Badge>
              </div>
              <h2 id="message-heading" className="text-xl font-semibold">
                {message.subject}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {message.name} · {message.email} · {received(message.createdAt)}{" "}
                UTC
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close message"
              onClick={() => setSelected(null)}
            >
              <X className="size-4" />
            </Button>
          </div>
          <p className="mt-6 whitespace-pre-wrap break-words leading-7">
            {message.message}
          </p>
          <div className="mt-6">
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => changeRead(message, !message.isRead)}
            >
              {busy
                ? "Updating..."
                : message.isRead
                  ? "Mark as unread"
                  : "Mark as read"}
            </Button>
          </div>
        </section>
      )}
      {rows.length === 0 ? (
        <section className="rounded-xl border bg-card px-6 py-12 text-center">
          <h2 className="text-xl font-semibold">No messages yet</h2>
          <p className="mt-2 text-muted-foreground">
            Contact form submissions will appear here.
          </p>
        </section>
      ) : (
        <DataTable
          label="Contacts"
          filters={["Unread", "Read"]}
          columns={["Sender", "Subject", "Received", "Status", "Action"]}
          rows={rows.map((contact) => ({
            id: contact.publicId,
            search: `${contact.name} ${contact.email} ${contact.subject} ${contact.message}`,
            filter: contact.isRead ? "Read" : "Unread",
            cells: [
              <div key="sender">
                <p className="font-medium">{contact.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {contact.email}
                </p>
              </div>,
              contact.subject,
              <span key="date">{received(contact.createdAt)} UTC</span>,
              <Badge key="status">{contact.isRead ? "Read" : "Unread"}</Badge>,
              <Button
                key="open"
                variant="link"
                disabled={busy}
                onClick={() => open(contact)}
                aria-expanded={selected === contact.publicId}
                aria-controls={
                  selected === contact.publicId ? "contact-detail" : undefined
                }
              >
                Read message
              </Button>,
            ],
          }))}
        />
      )}
    </div>
  );
}
