import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductCard } from "./product-card";

vi.mock("next/image", () => ({
  default: ({ fill: _fill, ...props }: Record<string, unknown>) => <img {...props} />
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  )
}));

const baseProduct = {
  _id: "product-1",
  name: "Rookie Gecko 001",
  price: 2500,
  imageUrl: "https://example.com/gecko.jpg",
  imageUrls: [],
  description: "Friendly gecko",
  status: "published" as const,
  isSoldOut: false,
  mainCategoryId: "main-1",
  childCategoryId: null,
  mainCategory: {
    _id: "main-1",
    name: "守宮",
    slug: "geckos",
    parentCategoryId: null,
    includeInAllListing: true
  },
  childCategory: null,
  category: {
    _id: "main-1",
    name: "守宮",
    slug: "geckos",
    parentCategoryId: null,
    includeInAllListing: true
  },
  createdAt: "2026-05-27T00:00:00.000Z",
  updatedAt: "2026-05-27T00:00:00.000Z"
};

describe("ProductCard", () => {
  it("renders a clickable card for available products", () => {
    render(<ProductCard product={baseProduct} />);

    expect(screen.getByRole("link", { name: /rookie gecko 001/i })).toHaveAttribute(
      "href",
      "/products/product-1"
    );
  });

  it("renders a sold-out badge and keeps navigation when sold out", () => {
    render(<ProductCard product={{ ...baseProduct, isSoldOut: true }} />);

    expect(screen.getByText("售罄")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /rookie gecko 001/i })).toHaveAttribute(
      "href",
      "/products/product-1"
    );
  });

  it("prefers the first image in imageUrls", () => {
    render(
      <ProductCard
        product={{
          ...baseProduct,
          imageUrl: "https://example.com/fallback.jpg",
          imageUrls: [
            "https://example.com/primary.jpg",
            "https://example.com/secondary.jpg"
          ]
        }}
      />
    );

    expect(screen.getByRole("img", { name: /rookie gecko 001/i })).toHaveAttribute(
      "src",
      expect.stringContaining("primary.jpg")
    );
  });
});
