import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      {...props}
      className={`min-h-11 w-full rounded-3xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none ring-0 placeholder:text-stone-400 focus:border-bark ${className}`}
    />
  );
}
