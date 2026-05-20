import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as categoriesModule from "../lib/categories";
import * as productsModule from "../lib/products";
import HomePage from "./page";

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
    expect(screen.getByText("守宮品種展示與在售個體一覽")).toBeInTheDocument();
    expect(screen.getAllByText("全部守宮").length).toBeGreaterThan(0);
    expect(screen.getByText("目前還沒有已公開的守宮個體。")).toBeInTheDocument();
  });

  it("renders category-aware published products", async () => {
    vi.spyOn(categoriesModule, "getCategories").mockResolvedValueOnce([
      {
        _id: "cat-1",
        name: "Leachianus",
        slug: "leachianus",
        createdAt: "2026-05-19T00:00:00.000Z",
        updatedAt: "2026-05-19T00:00:00.000Z"
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
        categoryId: "cat-1",
        category: {
          _id: "cat-1",
          name: "Leachianus",
          slug: "leachianus"
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
        name: "Leachianus",
        slug: "leachianus",
        createdAt: "2026-05-19T00:00:00.000Z",
        updatedAt: "2026-05-19T00:00:00.000Z"
      }
    ]);
    const getPublishedProductsSpy = vi
      .spyOn(productsModule, "getPublishedProducts")
      .mockResolvedValueOnce([]);

    const view = await HomePage({
      searchParams: Promise.resolve({ category: "leachianus" })
    });

    render(view);
    expect(getPublishedProductsSpy).toHaveBeenCalledWith("leachianus");
    expect(screen.getAllByText("Leachianus").length).toBeGreaterThan(0);
  });
});
