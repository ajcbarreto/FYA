import Image from "next/image";

// Source files for every logo variant live in public/brand/.
export function Brand() {
  return (
    <Image
      src="/brand/fya-logo-compacto.svg"
      alt="FYA"
      width={94}
      height={40}
      className="h-10 w-auto"
      priority
    />
  );
}
