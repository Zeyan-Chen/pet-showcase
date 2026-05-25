import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as categoriesModule from "../lib/categories";
import * as productsModule from "../lib/products";
import HomePage from "./page";

vi.mock("../components/storefront-shell", () => ({
  StorefrontShell: ({ categoryNav, children }: { categoryNav?: any; children: any }) => (
    <div>
      {categoryNav}
      {children}
    </div>
  )
}));

vi.mock("../components/category-nav", () => ({
  CategoryNav: ({ categories, activeSlug }: { categories: Array<{ name: string }>; activeSlug?: string }) => (
    <div data-testid="category-nav">
      <span>{activeSlug ?? "all"}</span>
      {categories.map((category) => (
        <span key={category.name}>{category.name}</span>
      ))}
    </div>
  )
}));

describe("HomePage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the storefront shell when no products are available", async () => {
    vi.spyOn(categoriesModule, "getCategories").mockResolvedValueOnce([]);
    vi.spyOn(productsModule, "getPublishedProducts").mockResolvedValueOnce([]);
    const view = await HomePage({
      searchParams: Promise.resolve({})
    });

    render(view);
    expect(screen.getByText("守宮展示目錄")).toBeInTheDocument();
    expect(screen.getAllByText("全部守宮").length).toBeGreaterThan(0);
    expect(screen.getByText("目前還沒有展示中的守宮")).toBeInTheDocument();
  });

  it("renders child-category-aware published products", async () => {
    vi.spyOn(categoriesModule, "getCategories").mockResolvedValueOnce([
      {
        _id: "cat-1",
        name: "Geckos",
        slug: "geckos",
        parentCategoryId: null,
        createdAt: "2026-05-19T00:00:00.000Z",
        updatedAt: "2026-05-19T00:00:00.000Z",
        children: [
          {
            _id: "cat-2",
            name: "Leachianus",
            slug: "leachianus",
            parentCategoryId: "cat-1",
            createdAt: "2026-05-19T00:00:00.000Z",
            updatedAt: "2026-05-19T00:00:00.000Z"
          }
        ]
      }
    ]);
    vi.spyOn(productsModule, "getPublishedProducts").mockResolvedValueOnce([
      {
        _id: "1",
        name: "Milo",
        price: 1200,
        imageUrl: "https://example.com/milo.jpg",
        description: "Friendly pet",
        status: "published",
        mainCategoryId: "cat-1",
        childCategoryId: "cat-2",
        mainCategory: {
          _id: "cat-1",
          name: "Geckos",
          slug: "geckos",
          parentCategoryId: null
        },
        childCategory: {
          _id: "cat-2",
          name: "Leachianus",
          slug: "leachianus",
          parentCategoryId: "cat-1"
        },
        category: {
          _id: "cat-2",
          name: "Leachianus",
          slug: "leachianus",
          parentCategoryId: "cat-1"
        },
        createdAt: "2026-05-19T00:00:00.000Z",
        updatedAt: "2026-05-19T00:00:00.000Z"
      }
    ]);

    const view = await HomePage({
      searchParams: Promise.resolve({})
    });

    render(view);
    expect(screen.getAllByText("Milo").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Leachianus")[0]).toBeInTheDocument();
  });

  it("passes the selected category slug to product loading", async () => {
    vi.spyOn(categoriesModule, "getCategories").mockResolvedValueOnce([
      {
        _id: "cat-1",
        name: "Geckos",
        slug: "geckos",
        parentCategoryId: null,
        createdAt: "2026-05-19T00:00:00.000Z",
        updatedAt: "2026-05-19T00:00:00.000Z",
        children: []
      }
    ]);
    const getPublishedProductsSpy = vi
      .spyOn(productsModule, "getPublishedProducts")
      .mockResolvedValueOnce([]);

    const view = await HomePage({
      searchParams: Promise.resolve({ category: "geckos" })
    });

    render(view);
    expect(getPublishedProductsSpy).toHaveBeenCalledWith("geckos");
    expect(screen.getAllByText("Geckos").length).toBeGreaterThan(0);
  });
});
