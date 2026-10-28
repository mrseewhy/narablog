"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  categorySchema,
  createCategorySlug,
  type CategoryErrors,
} from "@/lib/data/validation/category.validate";
import {
  createCategoryAction,
  updateCategoryAction,
} from "@/lib/data/actions/category.actions";
import { fieldClass, PageHeading } from "./ui";

type Category = {
  publicId: string;
  name: string;
  description: string | null;
  slug: string;
};
export function CategoryForm({ category }: { category?: Category }) {
  const router = useRouter();
  const [name, setName] = useState(category?.name ?? "");
  const [errors, setErrors] = useState<CategoryErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const parsed = categorySchema.safeParse(
      Object.fromEntries(new FormData(event.currentTarget).entries()),
    );
    setMessage(null);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const result = category
        ? await updateCategoryAction(category.publicId, parsed.data)
        : await createCategoryAction(parsed.data);
      if (!result.success) {
        setMessage(result.message);
        if (result.error) setErrors(result.error);
        return;
      }
      toast.success(result.message);
      router.replace("/admin/categories");
    } catch {
      setMessage("Unable to save this category. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-8">
      <PageHeading
        title={category ? "Edit category" : "Create category"}
        description="Organise the topics readers can explore."
      />
      <form
        onSubmit={submit}
        aria-busy={busy}
        className="space-y-6 rounded-xl border bg-card p-6"
      >
        <div className="space-y-2">
          <label htmlFor="category-name" className="text-sm font-medium">
            Name
          </label>
          <input
            id="category-name"
            name="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((p) => ({ ...p, name: undefined }));
              setMessage(null);
            }}
            required
            minLength={2}
            maxLength={70}
            disabled={busy}
            aria-invalid={Boolean(errors.name?.length)}
            aria-describedby={
              errors.name?.length ? "category-name-error" : "category-url-help"
            }
            className={fieldClass}
          />
          {errors.name?.[0] && (
            <p id="category-name-error" className="text-sm text-destructive">
              {errors.name[0]}
            </p>
          )}
        </div>
        <p
          id="category-url-help"
          className="break-all text-sm text-muted-foreground"
        >
          {category
            ? `The category URL stays /categories/${category.slug} when its name changes.`
            : `Public URL: /categories/${createCategorySlug(name) || "your-category"}`}
        </p>
        <div className="space-y-2">
          <label htmlFor="category-description" className="text-sm font-medium">
            Description
          </label>
          <textarea
            id="category-description"
            name="description"
            defaultValue={category?.description ?? ""}
            rows={5}
            maxLength={500}
            disabled={busy}
            onChange={() => {
              setErrors((p) => ({ ...p, description: undefined }));
              setMessage(null);
            }}
            aria-invalid={Boolean(errors.description?.length)}
            aria-describedby={
              errors.description?.length
                ? "category-description-error"
                : undefined
            }
            className={`${fieldClass} h-auto resize-y py-3`}
          />
          {errors.description?.[0] && (
            <p
              id="category-description-error"
              className="text-sm text-destructive"
            >
              {errors.description[0]}
            </p>
          )}
        </div>
        {message && (
          <p role="alert" className="text-sm text-destructive">
            {message}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <Link
            href="/admin/categories"
            className={buttonVariants({ variant: "outline" })}
          >
            Cancel
          </Link>
          <Button type="submit" disabled={busy}>
            {busy ? "Saving..." : category ? "Save changes" : "Create category"}
          </Button>
        </div>
      </form>
    </div>
  );
}
