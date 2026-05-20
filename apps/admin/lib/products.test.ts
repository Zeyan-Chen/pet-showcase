import { describe, expect, it } from "vitest";
import { serializeProduct } from "./products";

describe("serializeProduct", () => {
  it("returns a public-safe product record", () => {
    const result = serializeProduct({
      _id: { toString: () => "abc123" },
      name: "Milo",
      price: 1200,
      imageUrl: "https://example.com/milo.jpg",
      description: "Friendly pet",
      status: "published",
      createdAt: new Date("2026-05-19T00:00:00.000Z"),
      updatedAt: new Date("2026-05-19T00:00:00.000Z")
    });

    expect(result._id).toBe("abc123");
    expect(result.status).toBe("published");
  });
});
