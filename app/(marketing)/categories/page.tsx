import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { categories } from "../../../lib/data/demo/categories";
import { posts } from "../../../lib/data/demo/posts";

const CategoriesPage = () => {
  return (
    <>
      <header className="mx-auto w-full max-w-7xl px-4 pt-12">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Categories
        </h1>
        <p className="mt-4 max-w-xl font-serif text-lg text-muted-foreground">
          Browse every topic on NaroBlog and find the stories that matter to
          you.
        </p>
      </header>

      <section className="mx-auto mt-10 grid w-full max-w-7xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const count = posts.filter(
            (post) => post.category === category.name,
          ).length;

          return (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group flex flex-col justify-between gap-8 rounded-xl border bg-card p-6 transition-colors hover:border-primary"
            >
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  {category.name}
                </h2>
                <p className="mt-2 font-serif text-muted-foreground">
                  {category.description}
                </p>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {count} {count === 1 ? "post" : "posts"}
                </span>
                <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
            </Link>
          );
        })}
      </section>
    </>
  );
};

export default CategoriesPage;
