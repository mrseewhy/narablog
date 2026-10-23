import type { ReactNode } from "react";

export const fieldClass = "h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring";

export function PageHeading({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return <header className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-bold tracking-tight">{title}</h1><p className="mt-1 text-muted-foreground">{description}</p></div>{children}</header>;
}

export function Badge({ children }: { children: ReactNode }) {
  return <span className="inline-flex rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">{children}</span>;
}

export function Stats({ items }: { items: { label: string; value: string | number }[] }) {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{items.map(item => <div key={item.label} className="rounded-xl border bg-card p-6 shadow-sm"><p className="text-sm text-muted-foreground">{item.label}</p><p className="mt-2 text-2xl font-bold">{item.value}</p></div>)}</div>;
}
