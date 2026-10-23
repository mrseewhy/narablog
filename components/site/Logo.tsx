import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "text-2xl font-bold tracking-tight text-foreground",
        className,
      )}
    >
      NaroBlog<span className="text-primary">.</span>
    </span>
  );
}
