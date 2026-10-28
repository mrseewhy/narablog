"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { deleteCategoryAction } from "@/lib/data/actions/category.actions";

export function CategoryDeleteButton({
  publicId,
  name,
  totalCount,
}: {
  publicId: string;
  name: string;
  totalCount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function remove() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await deleteCategoryAction(publicId);
      if (!result.success) {
        setError(result.message);
        return;
      }
      setOpen(false);
      toast.success(result.message);
      router.refresh();
    } catch {
      setError("Unable to delete this category. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-2">
      <Dialog.Root
        open={open}
        onOpenChange={(next) => {
          if (!busy) {
            setOpen(next);
            setError(null);
          }
        }}
      >
        <Dialog.Trigger
          disabled={totalCount > 0}
          aria-label={`Delete ${name}`}
          aria-describedby={
            totalCount > 0 ? `category-blocked-${publicId}` : undefined
          }
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Delete
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-6 shadow-xl">
            <Dialog.Title className="text-xl font-semibold">
              Delete category?
            </Dialog.Title>
            <Dialog.Description className="mt-3 text-sm text-muted-foreground">
              Delete “{name}” permanently? Categories with assigned posts cannot
              be deleted.
            </Dialog.Description>
            {error && (
              <p role="alert" className="mt-4 text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <Dialog.Close
                disabled={busy}
                className={buttonVariants({ variant: "outline" })}
              >
                Cancel
              </Dialog.Close>
              <Button variant="destructive" disabled={busy} onClick={remove}>
                {busy ? "Deleting..." : "Delete category"}
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
      {totalCount > 0 && (
        <p
          id={`category-blocked-${publicId}`}
          className="text-xs text-muted-foreground"
        >
          Move or delete assigned posts before deleting this category.
        </p>
      )}
    </div>
  );
}
