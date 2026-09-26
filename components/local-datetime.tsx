"use client";
import { useState } from "react";
export function LocalDateTime({
  name,
  required = true,
}: {
  name: string;
  required?: boolean;
}) {
  const [value, setValue] = useState("");
  const date = value ? new Date(value) : null;
  return (
    <>
      <input
        aria-label="Data e hora local / Local date and time"
        className="block w-full rounded-lg border border-border bg-background p-3"
        type="datetime-local"
        required={required}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <input
        type="hidden"
        name={name}
        value={date && !Number.isNaN(date.getTime()) ? date.toISOString() : ""}
      />
    </>
  );
}
