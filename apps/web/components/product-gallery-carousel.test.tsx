import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductGalleryCarousel } from "./product-gallery-carousel";

vi.mock("next/image", () => ({
  default: ({ fill: _fill, priority: _priority, ...props }: Record<string, unknown>) => (
    <img {...props} />
  )
}));

describe("ProductGalleryCarousel", () => {
  const images = [
    "https://example.com/gecko-1.jpg",
    "https://example.com/gecko-2.jpg",
    "https://example.com/gecko-3.jpg"
  ];

  it("moves forward and backward with arrow controls", () => {
    render(<ProductGalleryCarousel productName="Rookie Gecko" images={images} />);

    expect(screen.getByText("1 / 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "上一張圖片" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "下一張圖片" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "下一張圖片" }));
    expect(screen.getByText("2 / 3")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "下一張圖片" }));
    expect(screen.getByText("3 / 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "下一張圖片" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "上一張圖片" }));
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
  });

  it("allows swipe navigation", () => {
    render(<ProductGalleryCarousel productName="Rookie Gecko" images={images} />);

    const viewport = screen.getByRole("img", { name: "Rookie Gecko 圖片 1" }).closest(
      ".product-gallery-viewport"
    );

    expect(viewport).not.toBeNull();

    fireEvent.touchStart(viewport!, {
      touches: [{ clientX: 220 }]
    });
    fireEvent.touchEnd(viewport!, {
      changedTouches: [{ clientX: 90 }]
    });

    expect(screen.getByText("2 / 3")).toBeInTheDocument();
  });

  it("hides controls when only one image is available", () => {
    render(
      <ProductGalleryCarousel
        productName="Rookie Gecko"
        images={["https://example.com/gecko-1.jpg"]}
      />
    );

    expect(screen.queryByRole("button", { name: "上一張圖片" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("商品圖片分頁")).not.toBeInTheDocument();
  });
});
