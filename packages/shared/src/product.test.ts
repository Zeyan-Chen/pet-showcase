import { describe, expect, it } from "vitest";
import { productInputSchema } from "./product";

describe("productInputSchema", () => {
  it("rejects missing required fields", () => {
    const result = productInputSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("requires mainCategoryId", () => {
    const result = productInputSchema.safeParse({
      name: "Milo",
      price: 1200,
      imageUrl: "https://example.com/milo.jpg",
      description: "Friendly pet",
      status: "draft"
    });

    expect(result.success).toBe(false);
  });

  it("allows a nullable childCategoryId", () => {
    const result = productInputSchema.safeParse({
      name: "Milo",
      price: 1200,
      imageUrl: "https://example.com/milo.jpg",
      description: "Friendly pet",
      status: "draft",
      mainCategoryId: "main-1",
      childCategoryId: null
    });

    expect(result.success).toBe(true);
  });

  it("defaults isSoldOut to false", () => {
    const result = productInputSchema.parse({
      name: "Milo",
      price: 1200,
      imageUrl: "https://example.com/milo.jpg",
      description: "Friendly pet",
      status: "draft",
      mainCategoryId: "main-1",
      childCategoryId: null
    });

    expect(result.isSoldOut).toBe(false);
  });

  it("accepts multiple image URLs", () => {
    const result = productInputSchema.safeParse({
      name: "Milo",
      price: 1200,
      imageUrl: "https://example.com/milo.jpg",
      imageUrls: [
        "https://example.com/milo-1.jpg",
        "https://example.com/milo-2.jpg"
      ],
      description: "Friendly pet",
      status: "draft",
      isSoldOut: false,
      mainCategoryId: "main-1",
      childCategoryId: null
    });

    expect(result.success).toBe(true);
  });

  it("defaults imageUrls to an empty array", () => {
    const result = productInputSchema.parse({
      name: "Milo",
      price: 1200,
      imageUrl: "https://example.com/milo.jpg",
      description: "Friendly pet",
      status: "draft",
      isSoldOut: false,
      mainCategoryId: "main-1",
      childCategoryId: null
    });

    expect(result.imageUrls).toEqual([]);
  });
});
