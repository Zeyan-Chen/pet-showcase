import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as productsModule from "../lib/products";
import HomePage from "./page";

describe("HomePage", () => {
  it("renders the empty state when no products are available", async () => {
    vi.spyOn(productsModule, "getPublishedProducts").mockResolvedValueOnce([]);
    const view = await HomePage();
    render(view);
    expect(screen.getByText("No pets available yet.")).toBeInTheDocument();
  });

  it("renders published products", async () => {
    vi.spyOn(productsModule, "getPublishedProducts").mockResolvedValueOnce([
      {
        _id: "1",
        name: "Milo",
        price: 1200,
        imageUrl: "https://example.com/milo.jpg",
        description: "Friendly pet",
        status: "published",
        createdAt: "2026-05-19T00:00:00.000Z",
        updatedAt: "2026-05-19T00:00:00.000Z"
      }
    ]);

    const view = await HomePage();
    render(view);
    expect(screen.getByText("Milo")).toBeInTheDocument();
  });
});
