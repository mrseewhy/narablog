import Link from "next/link";
import { Tags } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function CategoriesEmptyState({ admin = false }: { admin?: boolean }) {
  return (
    <div className="col-span-full rounded-xl border bg-card px-6 py-12 text-center">
      <span className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
        <Tags className="size-6" aria-hidden="true" />
      </span>
      <h2 className="text-xl font-semibold">No categories yet</h2>
      <p className="mt-2 text-muted-foreground">
        {admin
          ? "Create your first category to start organising stories."
          : "New topics are on the way. Check back soon to explore our categories."}
      </p>
      {admin && (
        <Link href="/admin/categories/create" className={buttonVariants({ className: "mt-6" })}>
          Create category
        </Link>
      )}
    </div>
  );
}
