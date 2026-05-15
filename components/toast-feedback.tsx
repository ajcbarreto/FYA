"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

type ToastFeedbackProps = {
  message: string | null;
  variant: "success" | "error";
};

export function ToastFeedback({ message, variant }: ToastFeedbackProps) {
  const lastShown = useRef<string | null>(null);

  useEffect(() => {
    if (!message || lastShown.current === message) return;
    lastShown.current = message;
    if (variant === "error") {
      toast.error(message);
    } else {
      toast.success(message);
    }
  }, [message, variant]);

  return null;
}
