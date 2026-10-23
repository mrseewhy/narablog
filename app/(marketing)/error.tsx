"use client";

import { Button } from "@/components/ui/button";

const PostError = ({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-24 text-center">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        We could not load this post. Please try again.
      </p>
      <Button className="mt-8" onClick={reset}>
        Try again
      </Button>
    </section>
  );
};

export default PostError;
