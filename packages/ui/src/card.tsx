import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", ...props }: CardProps) {
  return (
    <div
      {...props}
      className={`rounded-3xl bg-white shadow-sm ring-1 ring-stone-200 ${className}`}
    />
  );
}
