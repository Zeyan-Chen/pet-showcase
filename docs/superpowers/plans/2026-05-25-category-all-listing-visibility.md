# Category All-Listing Visibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a main-category-only `includeInAllListing` switch so products in excluded main categories no longer appear in the storefront `全部` view while still remaining visible in their own category pages.

**Architecture:** Extend the shared and admin category model with a persisted `includeInAllListing` boolean that only applies to top-level categories. Update admin category management so main categories can set this flag, child categories inherit it implicitly, and storefront “all products” queries filter by the main category’s flag.

**Tech Stack:** Next.js App Router, React, TypeScript, Mongoose, Vitest, pnpm

---

## File Map

- Modify: `C:\Users\Zeyan\Desktop\test\packages\shared\src\category.ts`
  - Add the shared category schema/type field for `includeInAllListing`.
- Modify: `C:\Users\Zeyan\Desktop\test\packages\shared\src\category.test.ts`
  - Add schema tests for top-level category visibility defaults and parsing.
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\models\category.ts`
  - Persist the new field in MongoDB with a default of `true`.
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\lib\categories.ts`
  - Normalize serialization, creation, update, and migration fallback behavior for the new field.
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\lib\categories.test.ts`
  - Cover main-category default behavior, child-category inheritance behavior, and update behavior.
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\app\api\categories\route.ts`
  - Accept `includeInAllListing` only when creating top-level categories.
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\app\api\categories\[id]\route.ts`
  - Accept main-category visibility updates and ignore/reject child overrides.
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\components\category-form.tsx`
  - Show the toggle only for top-level category creation/editing.
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\components\category-table.tsx`
  - Display the visibility status for main categories and “跟隨主分類” for child categories.
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\app\categories\page.tsx`
  - Update page copy to explain the new toggle.
- Modify: `C:\Users\Zeyan\Desktop\test\apps\web\lib\products.ts`
  - Filter the “all products” list using `product.mainCategory.includeInAllListing`.
- Modify: `C:\Users\Zeyan\Desktop\test\apps\web\app\page.tsx`
  - Keep “全部” using the updated product source while leaving category pages unchanged.
- Modify: `C:\Users\Zeyan\Desktop\test\apps\web\app\page.test.tsx`
  - Add tests proving `全部` excludes products whose main category opts out.

### Task 1: Extend Shared Category Types

**Files:**
- Modify: `C:\Users\Zeyan\Desktop\test\packages\shared\src\category.ts`
- Test: `C:\Users\Zeyan\Desktop\test\packages\shared\src\category.test.ts`

- [ ] **Step 1: Write the failing shared schema test**

```ts
import { describe, expect, it } from "vitest";

import { categoryInputSchema } from "./category";

describe("categoryInputSchema", () => {
  it("defaults top-level categories to include in all listing", () => {
    const parsed = categoryInputSchema.parse({
      name: "設備用品"
    });

    expect(parsed.includeInAllListing).toBe(true);
  });

  it("preserves explicit includeInAllListing for top-level categories", () => {
    const parsed = categoryInputSchema.parse({
      name: "周邊用品",
      includeInAllListing: false
    });

    expect(parsed.includeInAllListing).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @pet-showcase/shared test`

Expected: FAIL because `includeInAllListing` is not part of the schema/types yet.

- [ ] **Step 3: Write the minimal shared schema/type update**

```ts
export const categoryInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
  parentCategoryId: z.string().trim().min(1).nullable().optional().default(null),
  includeInAllListing: z.boolean().optional().default(true)
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;

export type CategoryRecord = {
  _id: string;
  name: string;
  slug: string;
  parentCategoryId: string | null;
  includeInAllListing: boolean;
  createdAt: string;
  updatedAt: string;
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @pet-showcase/shared test`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/category.ts packages/shared/src/category.test.ts
git commit -m "feat: add category all-listing visibility type"
```

### Task 2: Persist the Flag in Admin Category Data

**Files:**
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\models\category.ts`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\lib\categories.ts`
- Test: `C:\Users\Zeyan\Desktop\test\apps\admin\lib\categories.test.ts`

- [ ] **Step 1: Write the failing admin category tests**

```ts
it("serializes top-level categories with includeInAllListing defaulting to true", async () => {
  categoryFindMock.mockResolvedValue([
    {
      _id: new Types.ObjectId(),
      name: "守宮活體",
      slug: "守宮活體",
      parentCategoryId: null,
      includeInAllListing: undefined,
      createdAt: new Date("2026-05-25T00:00:00.000Z"),
      updatedAt: new Date("2026-05-25T00:00:00.000Z")
    }
  ]);

  const result = await listCategoryTree();

  expect(result[0]?.includeInAllListing).toBe(true);
});

it("forces child categories to follow the parent visibility flag", async () => {
  categoryCreateMock.mockResolvedValue({
    _id: new Types.ObjectId(),
    name: "飼養箱",
    slug: "飼養箱",
    parentCategoryId: parentId,
    includeInAllListing: false,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const result = await createCategory({
    name: "飼養箱",
    parentCategoryId: parentId,
    includeInAllListing: false
  });

  expect(result.includeInAllListing).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @pet-showcase/admin test`

Expected: FAIL because the category model/serializer do not yet know about `includeInAllListing`.

- [ ] **Step 3: Implement model and serializer support**

```ts
const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    parentCategoryId: { type: Schema.Types.ObjectId, default: null },
    includeInAllListing: { type: Boolean, default: true }
  },
  { timestamps: true }
);
```

```ts
function serializeCategory(category: CategoryDocument): CategoryRecord {
  return {
    _id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    parentCategoryId: category.parentCategoryId ? category.parentCategoryId.toString() : null,
    includeInAllListing:
      category.parentCategoryId == null ? category.includeInAllListing ?? true : true,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString()
  };
}
```

```ts
const includeInAllListing =
  parsed.parentCategoryId == null ? parsed.includeInAllListing ?? true : true;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @pet-showcase/admin test`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/admin/models/category.ts apps/admin/lib/categories.ts apps/admin/lib/categories.test.ts
git commit -m "feat: persist category all-listing visibility"
```

### Task 3: Update Admin Category APIs

**Files:**
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\app\api\categories\route.ts`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\app\api\categories\[id]\route.ts`
- Test: `C:\Users\Zeyan\Desktop\test\apps\admin\lib\categories.test.ts`

- [ ] **Step 1: Add the failing API-oriented behavior test**

```ts
it("creates top-level categories with includeInAllListing from input", async () => {
  const result = await createCategory({
    name: "周邊用品",
    parentCategoryId: null,
    includeInAllListing: false
  });

  expect(result.includeInAllListing).toBe(false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @pet-showcase/admin test`

Expected: FAIL because the route/lib path still drops the field.

- [ ] **Step 3: Pass the field through the API handlers**

```ts
const payload = categoryInputSchema.parse(await request.json());
const category = await createCategory({
  name: payload.name,
  parentCategoryId: payload.parentCategoryId,
  includeInAllListing: payload.includeInAllListing
});
```

```ts
const payload = categoryInputSchema.partial().parse(await request.json());
const category = await updateCategory(params.id, payload);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @pet-showcase/admin test`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/admin/app/api/categories/route.ts apps/admin/app/api/categories/[id]/route.ts apps/admin/lib/categories.test.ts
git commit -m "feat: support category visibility in admin api"
```

### Task 4: Add the Toggle to Admin Category Management UI

**Files:**
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\components\category-form.tsx`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\components\category-table.tsx`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\app\categories\page.tsx`

- [ ] **Step 1: Update the category form state and conditional toggle UI**

```tsx
const [parentCategoryId, setParentCategoryId] = useState("");
const [includeInAllListing, setIncludeInAllListing] = useState(true);
const isTopLevel = parentCategoryId.length === 0;
```

```tsx
{isTopLevel ? (
  <label className="flex items-center justify-between rounded-3xl border border-[var(--admin-border)] bg-white px-4 py-3">
    <div className="space-y-1">
      <p className="text-sm font-semibold text-[var(--admin-ink)]">納入全部展示</p>
      <p className="text-xs text-[var(--admin-muted)]">關閉後，這個主分類與其細項商品不會進入前台「全部」。</p>
    </div>
    <input
      type="checkbox"
      checked={includeInAllListing}
      onChange={(event) => setIncludeInAllListing(event.target.checked)}
      className="h-5 w-5 accent-[var(--admin-brand-strong)]"
    />
  </label>
) : null}
```

- [ ] **Step 2: Submit the toggle value only for top-level categories**

```tsx
body: JSON.stringify({
  name,
  parentCategoryId: parentCategoryId || null,
  includeInAllListing: parentCategoryId ? undefined : includeInAllListing
})
```

- [ ] **Step 3: Show visibility status in the category table**

```tsx
<p className="text-xs text-[var(--admin-muted)]">
  {category.parentCategoryId
    ? "跟隨主分類"
    : category.includeInAllListing
      ? "納入全部展示"
      : "不納入全部展示"}
</p>
```

- [ ] **Step 4: Refresh page copy**

```tsx
<p className="text-sm leading-7 text-[var(--admin-muted)]">
  在這裡建立主分類與細項分類，並控制哪些主分類商品會進入前台「全部」頁。
</p>
```

- [ ] **Step 5: Manual admin verification**

Run:

```bash
pnpm --filter @pet-showcase/admin dev
```

Expected:
- top-level category form shows the toggle
- child category form hides the toggle
- category table shows the correct status text

- [ ] **Step 6: Commit**

```bash
git add apps/admin/components/category-form.tsx apps/admin/components/category-table.tsx apps/admin/app/categories/page.tsx
git commit -m "feat: add admin category visibility toggle"
```

### Task 5: Filter the Storefront “All” View

**Files:**
- Modify: `C:\Users\Zeyan\Desktop\test\apps\web\lib\products.ts`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\web\app\page.tsx`
- Test: `C:\Users\Zeyan\Desktop\test\apps\web\app\page.test.tsx`

- [ ] **Step 1: Write the failing storefront test**

```tsx
it("excludes products from main categories hidden from the all listing", async () => {
  mockedGetCategories.mockResolvedValue([
    {
      _id: "main-hidden",
      name: "周邊用品",
      slug: "周邊用品",
      parentCategoryId: null,
      includeInAllListing: false,
      createdAt: "",
      updatedAt: "",
      children: []
    }
  ]);

  mockedGetPublishedProducts.mockResolvedValue([
    {
      _id: "product-1",
      name: "守宮飼養箱",
      price: 980,
      imageUrl: "/box.jpg",
      description: "hidden from all",
      status: "published",
      mainCategoryId: "main-hidden",
      childCategoryId: null,
      mainCategory: {
        _id: "main-hidden",
        name: "周邊用品",
        slug: "周邊用品",
        parentCategoryId: null,
        includeInAllListing: false,
        createdAt: "",
        updatedAt: ""
      },
      childCategory: null,
      category: null,
      createdAt: "",
      updatedAt: ""
    }
  ]);

  const page = await Page({ searchParams: Promise.resolve({}) });
  render(page);

  expect(screen.queryByText("守宮飼養箱")).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @pet-showcase/web test`

Expected: FAIL because the all-products view still renders everything.

- [ ] **Step 3: Add the all-listing filter in storefront product loading**

```ts
export async function getPublishedProducts(activeSlug?: string) {
  const products = await fetchProducts();

  if (!activeSlug) {
    return products.filter((product) => product.mainCategory?.includeInAllListing !== false);
  }

  return products.filter((product) => {
    const mainSlug = product.mainCategory?.slug;
    const childSlug = product.childCategory?.slug;
    return mainSlug === activeSlug || childSlug === activeSlug;
  });
}
```

- [ ] **Step 4: Keep the page copy unchanged for category pages**

```tsx
const products = await getPublishedProducts(activeSlug);
```

Expected behavior:
- `全部` uses the filtered data
- category pages still show their own products even if hidden from `全部`

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter @pet-showcase/web test`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/web/lib/products.ts apps/web/app/page.tsx apps/web/app/page.test.tsx
git commit -m "feat: hide excluded categories from all listing"
```

### Task 6: Migration-Safe Defaults and Final Verification

**Files:**
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\lib\categories.ts`
- Test: `C:\Users\Zeyan\Desktop\test\apps\admin\lib\categories.test.ts`

- [ ] **Step 1: Add the failing migration default test**

```ts
it("defaults legacy top-level categories to include in all listing", async () => {
  categoryFindMock.mockResolvedValue([
    {
      _id: new Types.ObjectId(),
      name: "睫角守宮",
      slug: "睫角守宮",
      parentCategoryId: null,
      createdAt: new Date("2026-05-25T00:00:00.000Z"),
      updatedAt: new Date("2026-05-25T00:00:00.000Z")
    }
  ]);

  const result = await listCategoryTree();

  expect(result[0]?.includeInAllListing).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @pet-showcase/admin test`

Expected: FAIL if any serializer path still leaves the field undefined.

- [ ] **Step 3: Normalize legacy fallback**

```ts
const includeInAllListing =
  category.parentCategoryId == null ? category.includeInAllListing ?? true : true;
```

Use this same fallback path anywhere top-level categories are serialized.

- [ ] **Step 4: Run the final verification suite**

Run:

```bash
pnpm --filter @pet-showcase/shared test
pnpm --filter @pet-showcase/admin test
pnpm --filter @pet-showcase/web test
```

Expected: PASS for all three commands

- [ ] **Step 5: Manual end-to-end verification**

Run:

```bash
pnpm --filter @pet-showcase/admin dev
pnpm --filter @pet-showcase/web dev
```

Expected:
- create a top-level category with `納入全部展示 = 關閉`
- assign products under that main category
- confirm those products do not show under `全部`
- confirm the same products still show on that main category page

- [ ] **Step 6: Commit**

```bash
git add apps/admin/lib/categories.ts apps/admin/lib/categories.test.ts packages/shared/src/category.ts packages/shared/src/category.test.ts apps/web/lib/products.ts apps/web/app/page.test.tsx
git commit -m "fix: default all-listing visibility for legacy categories"
```

## Self-Review

- Spec coverage: covered model, admin form, admin table, API handling, storefront filtering, and migration-safe defaults.
- Placeholder scan: no `TODO`, `TBD`, or abstract “handle later” wording remains in task steps.
- Type consistency: `includeInAllListing` is used consistently as the category-level boolean across shared types, admin logic, and storefront filtering.
