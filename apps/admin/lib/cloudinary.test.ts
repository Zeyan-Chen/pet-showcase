import { describe, expect, it } from "vitest";
import { buildCloudinaryFolder } from "./cloudinary";

describe("buildCloudinaryFolder", () => {
  it("uses a predictable folder name", () => {
    expect(buildCloudinaryFolder()).toBe("pet-showcase/products");
  });
});
