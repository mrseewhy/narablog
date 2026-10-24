"use client";

import { useState } from "react";
import Link from "next/link";
import { Tags } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { fieldClass, PageHeading } from "@/components/dashboard/ui";

import { categorySchema } from "@/lib/data/validation/category.validate";
import { type CategoryErrors } from "@/lib/data/validation/category.validate";
import { createCategoryAction } from "@/lib/data/actions/category.actions";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

export default function CreateCategoryPage() {
  const [errors, setErrors] = useState<CategoryErrors>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    //prevent defualt
    e.preventDefault();

    //get for data
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // validate form data
    const validated = categorySchema.safeParse(data);

    //check if validation is successful
    if (!validated.success) {
      setErrors(validated.error.flatten().fieldErrors);
      return;
    }
    //reset loading state and error state
    setErrors({});
    setLoading(true);

    try {
      //send to server action
      const result = await createCategoryAction(validated.data);

      //check if it successfully connect with server action
      if (!result.success) {
        toast.error(result.message);

        //check error and display error message
        if (result.error) {
          setErrors(result.error);
        }
        return;
      }

      //if successful reset for, send toast and redirect
      form.reset();
      toast.success(result.message);

      router.push("/admin/categories");
    } catch (error) {
      // if unsuccessfull log the error and send toast
      console.error(error);
      toast.error("Something went wrong while creating category");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-8">
      <PageHeading
        title="Create category"
        description="Add a topic to organise stories across NaroBlog."
      />
      <section
        className="overflow-hidden rounded-xl border bg-card shadow-sm"
        aria-labelledby="category-details-heading"
      >
        <div className="flex items-center gap-3 border-b p-6">
          <span className="rounded-lg bg-primary/10 p-3 text-primary">
            <Tags className="size-5" aria-hidden="true" />
          </span>
          <h2 id="category-details-heading" className="font-semibold">
            Category details
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="space-y-2">
            <label htmlFor="category-name" className="text-sm font-medium">
              Name
            </label>
            <input
              id="category-name"
              name="name"
              required
              minLength={2}
              maxLength={70}
              pattern=".*\S.*"
              placeholder="e.g. Technology"
              className={fieldClass}
            />
            {errors.name?.[0] && (
              <p className="text-xs text-red-500">{errors.name[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="category-description"
              className="text-sm font-medium"
            >
              Description
            </label>
            <textarea
              id="category-description"
              name="description"
              rows={5}
              maxLength={500}
              placeholder="Describe the stories readers will find in this category"
              className={`${fieldClass} h-auto resize-y py-3`}
            />
            {errors.description?.[0] && (
              <p className="text-xs text-red-500">{errors.description[0]}</p>
            )}
          </div>
          <div className="flex justify-end gap-3 border-t pt-6">
            <Link
              href="/admin/categories"
              className={buttonVariants({ variant: "outline" })}
            >
              Cancel
            </Link>
            <Button disabled={loading} type="submit">
              {loading ? "Creating" : "Create category"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
