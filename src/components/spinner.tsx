import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("size-4 animate-spin", className)} />;
}

export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3 animate-fade-in">
        <Spinner className="size-7 text-primary" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
}
