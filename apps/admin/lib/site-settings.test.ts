import { describe, expect, it } from "vitest";
import { extractCloudinaryPublicId, serializeSiteSettings } from "./site-settings";

describe("serializeSiteSettings", () => {
  it("serializes a site settings document", () => {
    const result = serializeSiteSettings({
      _id: "abc123",
      logoAlt: "Rookie Gecko logo",
      logoImageUrl: "https://example.com/logo.png",
      logoPublicId: "rookie/logo",
      updatedAt: new Date("2026-05-22T00:00:00.000Z")
    });

    expect(result).toEqual({
      _id: "abc123",
      logoAlt: "Rookie Gecko logo",
      logoImageUrl: "https://example.com/logo.png",
      logoPublicId: "rookie/logo",
      updatedAt: "2026-05-22T00:00:00.000Z"
    });
  });
});

describe("extractCloudinaryPublicId", () => {
  it("extracts a public id from a versioned cloudinary asset url", () => {
    expect(
      extractCloudinaryPublicId(
        "https://res.cloudinary.com/demo/image/upload/v1712345678/pet-showcase/products/rookie-gecko-logo.png"
      )
    ).toBe("pet-showcase/products/rookie-gecko-logo");
  });

  it("returns an empty string for a non-cloudinary-style url", () => {
    expect(extractCloudinaryPublicId("https://example.com/logo.png")).toBe("");
  });
});
