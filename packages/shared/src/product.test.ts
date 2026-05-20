import { describe, expect, it } from "vitest";
import { productInputSchema } from "./product";

describe("productInputSchema", () => {
  it("rejects missing required fields", () => {
    const result = productInputSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
