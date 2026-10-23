"use client";

import { useState } from "react";
import { Mail, X } from "lucide-react";
import { contacts } from "@/lib/data/demo/dashboard";
import { Button } from "@/components/ui/button";
import { DataTable } from "./data-table";
import { Badge, PageHeading, Stats } from "./ui";

export function ContactsPage() {
  const [selected, setSelected] = useState<number | null>(null);
  const message = contacts.find(contact => contact.id === selected);
  return <div className="space-y-8"><PageHeading title="Contacts" description="Read enquiries, feedback, and messages from your community." /><Stats items={[{ label: "Total messages", value: contacts.length }, { label: "Unread", value: contacts.filter(item => item.status === "Unread").length }, { label: "Read", value: contacts.filter(item => item.status === "Read").length }, { label: "Replied", value: contacts.filter(item => item.status === "Replied").length }]} />
    {message && <section className="rounded-xl border bg-card p-6 shadow-sm" aria-labelledby="message-heading"><div className="flex items-start justify-between gap-4"><div><div className="mb-3 flex items-center gap-2 text-primary"><Mail className="size-4" /><Badge>{message.status}</Badge></div><h2 id="message-heading" className="text-xl font-semibold">{message.subject}</h2><p className="mt-2 text-sm text-muted-foreground">{message.name} · {message.email} · {message.date}</p></div><Button variant="ghost" size="icon" aria-label="Close message" onClick={() => setSelected(null)}><X className="size-4" /></Button></div><p className="mt-6 max-w-3xl leading-7">{message.message}</p></section>}
    <DataTable label="Contacts" filters={["Unread", "Read", "Replied"]} columns={["Sender", "Subject", "Received", "Status", "Action"]} rows={contacts.map(contact => ({ id: contact.id, search: `${contact.name} ${contact.email} ${contact.subject} ${contact.message}`, filter: contact.status, cells: [<div key="sender"><p className="font-medium">{contact.name}</p><p className="mt-1 text-xs text-muted-foreground">{contact.email}</p></div>, contact.subject, contact.date, <Badge key="status">{contact.status}</Badge>, <Button key="open" variant="link" onClick={() => setSelected(contact.id)} aria-expanded={selected === contact.id}>Read message</Button>] }))} />
  </div>;
}
