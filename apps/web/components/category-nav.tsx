import Link from "next/link";
import type { CategoryRecord } from "@pet-showcase/shared";

type CategoryNavProps = {
  categories: CategoryRecord[];
  activeSlug?: string;
};

export function CategoryNav({ categories, activeSlug }: CategoryNavProps) {
  return (
    <div className="store-nav-wrap">
      <nav aria-label="品種分類導覽" className="store-nav-strip">
        <Link
          href="/"
          className={activeSlug ? "store-nav-link" : "store-nav-link store-nav-link-active"}
        >
          <span>全部</span>
        </Link>
        {categories.map((category) => (
          <Link
            key={category._id}
            href={`/?category=${category.slug}`}
            className={
              activeSlug === category.slug
                ? "store-nav-link store-nav-link-active"
                : "store-nav-link"
            }
          >
            <span>{category.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
