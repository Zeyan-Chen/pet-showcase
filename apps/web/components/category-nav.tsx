import Link from "next/link";
import type { CategoryRecord } from "@pet-showcase/shared";

type CategoryNavProps = {
  categories: CategoryRecord[];
  activeSlug?: string;
};

export function CategoryNav({ categories, activeSlug }: CategoryNavProps) {
  return (
    <nav
      aria-label="分類導覽"
      className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible"
    >
      <Link href="/" className={activeSlug ? "store-pill" : "store-pill store-pill-active"}>
        全部守宮
      </Link>
      {categories.map((category) => (
        <Link
          key={category._id}
          href={`/?category=${category.slug}`}
          className={activeSlug === category.slug ? "store-pill store-pill-active" : "store-pill"}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
