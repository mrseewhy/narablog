"use client";

import { useState } from "react";
import Link from "next/link";
import { Tags } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { fieldClass, PageHeading } from "@/components/dashboard/ui";

function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function CreateCategoryPage() {
  const [name, setName] = useState("");
  const [customSlug, setCustomSlug] = useState<string | null>(null);
  const slug = customSlug ?? slugify(name);

  return (
    <div className="space-y-8">
      <PageHeading title="Create category" description="Add a topic to organise stories across NaroBlog." />
      <section className="overflow-hidden rounded-xl border bg-card shadow-sm" aria-labelledby="category-details-heading">
        <div className="flex items-center gap-3 border-b p-6"><span className="rounded-lg bg-primary/10 p-3 text-primary"><Tags className="size-5" aria-hidden="true" /></span><h2 id="category-details-heading" className="font-semibold">Category details</h2></div>
        <form onSubmit={event => event.preventDefault()} className="space-y-6 p-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2"><label htmlFor="category-name" className="text-sm font-medium">Name</label><input id="category-name" name="name" required maxLength={80} pattern=".*\S.*" placeholder="e.g. Technology" value={name} onChange={event => setName(event.target.value)} className={fieldClass} /></div>
            <div className="space-y-2"><label htmlFor="category-slug" className="text-sm font-medium">Slug</label><input id="category-slug" name="slug" required maxLength={100} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="e.g. technology" aria-describedby="category-slug-help" value={slug} onChange={event => setCustomSlug(event.target.value)} className={fieldClass} /><p id="category-slug-help" className="text-xs text-muted-foreground">Lowercase letters, numbers, and hyphens. Used in /categories/{slug || "your-topic"}.</p></div>
          </div>
          <div className="space-y-2"><label htmlFor="category-description" className="text-sm font-medium">Description</label><textarea id="category-description" name="description" rows={5} required maxLength={500} placeholder="Describe the stories readers will find in this category" className={`${fieldClass} h-auto resize-y py-3`} /></div>
          <div className="flex justify-end gap-3 border-t pt-6"><Link href="/admin/categories" className={buttonVariants({ variant: "outline" })}>Cancel</Link><Button type="submit">Create category</Button></div>
        </form>
      </section>
    </div>
  );
}
