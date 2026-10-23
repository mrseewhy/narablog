import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

const PostNotFound = () => {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-24 text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
        Post not found
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        This post may have been moved or removed, or the link may be incorrect.
      </p>
      <Link href="/" className={buttonVariants({ className: "mt-8" })}>
        Back to home
      </Link>
    </section>
  );
};

export default PostNotFound;
