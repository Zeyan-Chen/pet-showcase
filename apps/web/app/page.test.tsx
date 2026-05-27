import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as categoriesModule from "../lib/categories";
import * as productsModule from "../lib/products";
import HomePage from "./page";

vi.mock("../components/storefront-shell", () => ({
  StorefrontShell: ({ categoryNav, children }: { categoryNav?: React.ReactNode; children: React.ReactNode }) => (
    <div>
      {categoryNav}
      {children}
    </div>
  )
}));

vi.mock("../components/category-nav", () => ({
  CategoryNav: ({
    categories,
    activeSlug
  }: {
    categories: Array<{ name: string }>;
    activeSlug?: string;
  }) => (
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
    expect(screen.getByTestId("category-nav")).toBeInTheDocument();
    expect(screen.getByText("目前沒有展示中的守宮")).toBeInTheDocument();
  });

  it("renders child-category-aware published products", async () => {
    vi.spyOn(categoriesModule, "getCategories").mockResolvedValueOnce([
      {
        _id: "cat-1",
        name: "Geckos",
        slug: "geckos",
        parentCategoryId: null,
        includeInAllListing: true,
        createdAt: "2026-05-19T00:00:00.000Z",
        updatedAt: "2026-05-19T00:00:00.000Z",
        children: [
          {
            _id: "cat-2",
            name: "Leachianus",
            slug: "leachianus",
            parentCategoryId: "cat-1",
            includeInAllListing: true,
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
        imageUrls: [],
        description: "Friendly pet",
        status: "published",
        isSoldOut: false,
        mainCategoryId: "cat-1",
        childCategoryId: "cat-2",
        mainCategory: {
          _id: "cat-1",
          name: "Geckos",
          slug: "geckos",
          parentCategoryId: null,
          includeInAllListing: true
        },
        childCategory: {
          _id: "cat-2",
          name: "Leachianus",
          slug: "leachianus",
          parentCategoryId: "cat-1",
          includeInAllListing: true
        },
        category: {
          _id: "cat-2",
          name: "Leachianus",
          slug: "leachianus",
          parentCategoryId: "cat-1",
          includeInAllListing: true
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
        includeInAllListing: true,
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

  it("does not show products from main categories excluded from the all listing", async () => {
    vi.spyOn(categoriesModule, "getCategories").mockResolvedValueOnce([
      {
        _id: "main-hidden",
        name: "Hidden Main Test",
        slug: "hidden-main-test",
        parentCategoryId: null,
        includeInAllListing: false,
        createdAt: "2026-05-25T00:00:00.000Z",
        updatedAt: "2026-05-25T00:00:00.000Z",
        children: []
      }
    ]);
    vi.spyOn(productsModule, "getPublishedProducts").mockResolvedValueOnce([]);

    const view = await HomePage({
      searchParams: Promise.resolve({})
    });

    render(view);
    expect(screen.queryByText("全部守宮")).not.toBeInTheDocument();
    expect(screen.getByText("目前沒有展示中的守宮")).toBeInTheDocument();
  });
});
