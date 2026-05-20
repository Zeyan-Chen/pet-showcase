import { describe, expect, it } from "vitest";
import { productInputSchema } from "./product";

describe("productInputSchema", () => {
  it("rejects missing required fields", () => {
    const result = productInputSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("requires categoryId", () => {
    const result = productInputSchema.safeParse({
      name: "Milo",
      price: 1200,
      imageUrl: "https://example.com/milo.jpg",
      description: "Friendly pet",
      status: "draft"
    });

    expect(result.success).toBe(false);
  });
});
