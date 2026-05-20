import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className = "", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`min-h-11 rounded-3xl bg-bark px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 ${className}`}
    />
  );
}
