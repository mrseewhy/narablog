"use client";

import { useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import { fieldClass } from "./ui";

type Row = { id: string | number; search: string; filter?: string; cells: ReactNode[] };

export function DataTable({ columns, rows, label, filters = [] }: { columns: string[]; rows: Row[]; label: string; filters?: string[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const visible = rows.filter(row => row.search.toLowerCase().includes(query.toLowerCase()) && (filter === "All" || row.filter === filter));
  return <section className="overflow-hidden rounded-xl border bg-card shadow-sm" aria-label={label}>
    <div className="flex flex-wrap gap-3 border-b p-4 sm:p-6">
      <div className="relative min-w-0 flex-1 sm:max-w-sm"><Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" aria-hidden="true" /><input type="search" aria-label={`Search ${label}`} placeholder={`Search ${label.toLowerCase()}...`} value={query} onChange={event => setQuery(event.target.value)} className={`${fieldClass} pl-9`} /></div>
      {filters.length > 0 && <select aria-label={`Filter ${label}`} className={`${fieldClass} sm:max-w-48`} value={filter} onChange={event => setFilter(event.target.value)}>{["All", ...filters].map(value => <option key={value}>{value}</option>)}</select>}
    </div>
    <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="sr-only">{label}</caption><thead className="bg-muted/50 text-xs uppercase text-muted-foreground"><tr>{columns.map(column => <th key={column} scope="col" className="whitespace-nowrap px-6 py-4 font-semibold">{column}</th>)}</tr></thead><tbody className="divide-y">{visible.map(row => <tr key={row.id} className="hover:bg-muted/30">{row.cells.map((cell, index) => <td key={index} className="px-6 py-4 align-top">{cell}</td>)}</tr>)}{visible.length === 0 && <tr><td colSpan={columns.length} className="px-6 py-12 text-center text-muted-foreground">No matching results. Try another search or filter.</td></tr>}</tbody></table></div>
    <p className="border-t px-6 py-4 text-sm text-muted-foreground" aria-live="polite">Showing {visible.length} of {rows.length} results</p>
  </section>;
}
