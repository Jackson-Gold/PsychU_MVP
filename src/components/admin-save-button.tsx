"use client";

import { useFormStatus } from "react-dom";

export function AdminSaveButton({ label = "Save change" }: { label?: string }) {
  const { pending } = useFormStatus();

  return (
    <button className="button button-primary" type="submit" disabled={pending}>
      {pending ? "Saving..." : label}
    </button>
  );
}

