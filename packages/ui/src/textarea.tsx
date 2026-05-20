import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className = "", ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      className={`min-h-32 w-full rounded-3xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none placeholder:text-stone-400 focus:border-bark ${className}`}
    />
  );
}
