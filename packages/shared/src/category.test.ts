import { describe, expect, it } from "vitest";
import { categoryInputSchema } from "./category";

describe("categoryInputSchema", () => {
  it("rejects missing required fields", () => {
    const result = categoryInputSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts a nullable parentCategoryId", () => {
    const result = categoryInputSchema.safeParse({
      name: "Crested Gecko",
      parentCategoryId: null
    });

    expect(result.success).toBe(true);
  });
});
