import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="mx-auto mt-6 w-full max-w-7xl px-4">
      <div className="flex min-h-[50vh] w-full flex-col justify-center rounded-2xl bg-[#0B1220] p-8 text-[#ECEFF6] dark:border dark:border-border md:p-16">
        <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
          Stories, ideas, and perspectives{" "}
          <span className="text-[#F5B544]">worth your time.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base text-[#9AA5BA] md:text-lg">
          Read and write across politics, sports, technology, religion, and
          science.
        </p>
        <div className="mt-8">
          <Link
            href="/sign-up"
            className={buttonVariants({
              size: "lg",
              className: "bg-[#F5B544] text-[#0B1220] hover:bg-[#F5B544]/90",
            })}
          >
            Start writing
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
