import { describe, expect, it } from "vitest";
import { categoryInputSchema } from "./category";

describe("categoryInputSchema", () => {
  it("rejects missing required fields", () => {
    const result = categoryInputSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
