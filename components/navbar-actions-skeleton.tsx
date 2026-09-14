import { SketchSkeleton } from "@/components/ui/sketch-skeleton";

export function NavbarActionsSkeleton() {
  return (
    <>
      <SketchSkeleton className="hidden h-10 w-10 rounded-full sm:inline-flex" />
      <SketchSkeleton className="hidden h-10 w-10 rounded-full sm:inline-flex" delay={40} />
      <SketchSkeleton className="h-10 w-10 rounded-full lg:hidden" delay={60} />
    </>
  );
}
