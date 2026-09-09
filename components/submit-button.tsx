"use client";
import type { ButtonHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";
export function SubmitButton({
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { pending } = useFormStatus();
  return (
    <button
      {...props}
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending}
    >
      {pending && (
        <LoaderCircle
          aria-hidden="true"
          className="mr-2 inline size-4 animate-spin"
        />
      )}
      {children}
    </button>
  );
}
