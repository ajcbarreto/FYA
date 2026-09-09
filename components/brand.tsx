import { PawPrint } from "lucide-react";
export function Brand() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <PawPrint className="size-5" />
      </span>
      <span className="text-2xl font-extrabold tracking-tighter">
        fya<span className="text-accent">.</span>
      </span>
    </span>
  );
}
