import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CreateCategoryInput } from "@/lib/data/validation/category.validate";

type Category = Omit<CreateCategoryInput, "description"> & {
  publicId: string;
  publishedCount: number;
  description: string | null;
  slug: string;
};

const CategoryCard = ({ category }: { category: Category }) => {
  const count = category.publishedCount;
  return (
    <>
      <Link
        href={`/categories/${category.slug}`}
        className="group flex flex-col justify-between gap-8 rounded-xl border bg-card p-6 transition-colors hover:border-primary"
      >
        <div>
          <h2 className="text-xl font-bold tracking-tight">{category.name}</h2>
          <p className="mt-2 font-serif text-muted-foreground">
            {category.description}
          </p>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {count === 0
              ? "No posts yet"
              : `${count} ${count === 1 ? "post" : "posts"}`}
          </span>
          <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
        </div>
      </Link>
    </>
  );
};

export default CategoryCard;
