# Pet Showcase Storefront Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add admin-managed single-select categories and redesign the public storefront so desktop feels close to the reference catalog while mobile uses a two-column masonry-style product grid.

**Architecture:** Extend the shared schema layer first so admin and web agree on category and product shapes. Add category persistence and guarded CRUD APIs in `apps/admin`, then thread category selection into product management. Finally reshape `apps/web` around category-aware fetching, a dark catalog shell, and responsive list/detail UI that splits into desktop catalog chrome and mobile masonry browsing.

**Tech Stack:** Next.js App Router, TypeScript, MongoDB, Mongoose, Zod, Tailwind CSS, Vitest

---

## File Map

### Shared

- Create: `C:\Users\Zeyan\Desktop\test\packages\shared\src\category.ts`
- Modify: `C:\Users\Zeyan\Desktop\test\packages\shared\src\product.ts`
- Modify: `C:\Users\Zeyan\Desktop\test\packages\shared\src\index.ts`
- Create: `C:\Users\Zeyan\Desktop\test\packages\shared\src\category.test.ts`
- Modify: `C:\Users\Zeyan\Desktop\test\packages\shared\src\product.test.ts`

### Admin data and APIs

- Create: `C:\Users\Zeyan\Desktop\test\apps\admin\models\category.ts`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\models\product.ts`
- Create: `C:\Users\Zeyan\Desktop\test\apps\admin\lib\categories.ts`
- Create: `C:\Users\Zeyan\Desktop\test\apps\admin\lib\categories.test.ts`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\lib\products.ts`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\lib\products.test.ts`
- Create: `C:\Users\Zeyan\Desktop\test\apps\admin\app\api\categories\route.ts`
- Create: `C:\Users\Zeyan\Desktop\test\apps\admin\app\api\categories\[id]\route.ts`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\app\api\products\route.ts`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\app\api\products\[id]\route.ts`

### Admin UI

- Create: `C:\Users\Zeyan\Desktop\test\apps\admin\components\category-form.tsx`
- Create: `C:\Users\Zeyan\Desktop\test\apps\admin\components\category-table.tsx`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\components\product-form.tsx`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\components\product-table.tsx`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\app\layout.tsx`
- Create: `C:\Users\Zeyan\Desktop\test\apps\admin\app\categories\page.tsx`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\app\products\page.tsx`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\app\products\new\page.tsx`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\app\products\[id]\edit\page.tsx`

### Web storefront

- Modify: `C:\Users\Zeyan\Desktop\test\apps\web\lib\products.ts`
- Create: `C:\Users\Zeyan\Desktop\test\apps\web\lib\categories.ts`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\web\components\product-card.tsx`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\web\components\product-list.tsx`
- Create: `C:\Users\Zeyan\Desktop\test\apps\web\components\category-nav.tsx`
- Create: `C:\Users\Zeyan\Desktop\test\apps\web\components\announcement-bar.tsx`
- Create: `C:\Users\Zeyan\Desktop\test\apps\web\components\storefront-shell.tsx`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\web\app\page.tsx`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\web\app\products\[id]\page.tsx`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\web\app\globals.css`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\web\app\page.test.tsx`

---

### Task 1: Add shared category and category-aware product schemas

**Files:**
- Create: `C:\Users\Zeyan\Desktop\test\packages\shared\src\category.ts`
- Modify: `C:\Users\Zeyan\Desktop\test\packages\shared\src\product.ts`
- Modify: `C:\Users\Zeyan\Desktop\test\packages\shared\src\index.ts`
- Create: `C:\Users\Zeyan\Desktop\test\packages\shared\src\category.test.ts`
- Modify: `C:\Users\Zeyan\Desktop\test\packages\shared\src\product.test.ts`

- [ ] **Step 1: Write the failing shared schema tests**

```ts
// C:\Users\Zeyan\Desktop\test\packages\shared\src\category.test.ts
import { describe, expect, it } from "vitest";
import { categoryInputSchema } from "./category";

describe("categoryInputSchema", () => {
  it("accepts a simple category name", () => {
    const result = categoryInputSchema.parse({ name: "Leachianus" });
    expect(result.name).toBe("Leachianus");
  });

  it("rejects an empty category name", () => {
    expect(() => categoryInputSchema.parse({ name: "" })).toThrow();
  });
});
```

```ts
// append to C:\Users\Zeyan\Desktop\test\packages\shared\src\product.test.ts
it("requires categoryId on product input", () => {
  expect(() =>
    productInputSchema.parse({
      name: "GT Leachie",
      price: 12000,
      imageUrl: "https://example.com/gecko.jpg",
      description: "Captive bred",
      status: "published"
    })
  ).toThrow();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```powershell
pnpm --filter @pet-showcase/shared test
```

Expected: FAIL because `category.ts` exports do not exist and `productInputSchema` does not require `categoryId`.

- [ ] **Step 3: Add the shared category schema and extend product types**

```ts
// C:\Users\Zeyan\Desktop\test\packages\shared\src\category.ts
import { z } from "zod";

export const categoryInputSchema = z.object({
  name: z.string().trim().min(1).max(80)
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;

export type CategoryRecord = CategoryInput & {
  _id: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
};
```

```ts
// replace C:\Users\Zeyan\Desktop\test\packages\shared\src\product.ts
import { z } from "zod";
import type { CategoryRecord } from "./category";

export const productStatusSchema = z.enum(["draft", "published"]);

export const productInputSchema = z.object({
  name: z.string().min(1).max(80),
  price: z.coerce.number().min(0),
  imageUrl: z.string().url(),
  description: z.string().min(1).max(2000),
  status: productStatusSchema,
  categoryId: z.string().min(1)
});

export type ProductInput = z.infer<typeof productInputSchema>;

export type ProductRecord = ProductInput & {
  _id: string;
  createdAt: string;
  updatedAt: string;
  category: Pick<CategoryRecord, "_id" | "name" | "slug">;
};
```

```ts
// append to C:\Users\Zeyan\Desktop\test\packages\shared\src\index.ts
export * from "./category";
export * from "./product";
export * from "./env";
```

- [ ] **Step 4: Run tests to verify they pass**

Run:

```powershell
pnpm --filter @pet-showcase/shared test
```

Expected: PASS for both schema files.

- [ ] **Step 5: Commit**

```powershell
git add packages/shared/src/category.ts packages/shared/src/category.test.ts packages/shared/src/product.ts packages/shared/src/product.test.ts packages/shared/src/index.ts
git commit -m "feat: add shared category schema"
```

### Task 2: Add category persistence and category-aware product services in admin

**Files:**
- Create: `C:\Users\Zeyan\Desktop\test\apps\admin\models\category.ts`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\models\product.ts`
- Create: `C:\Users\Zeyan\Desktop\test\apps\admin\lib\categories.ts`
- Create: `C:\Users\Zeyan\Desktop\test\apps\admin\lib\categories.test.ts`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\lib\products.ts`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\lib\products.test.ts`

- [ ] **Step 1: Write failing admin data-layer tests**

```ts
// C:\Users\Zeyan\Desktop\test\apps\admin\lib\categories.test.ts
import { describe, expect, it } from "vitest";
import { slugifyCategoryName } from "./categories";

describe("slugifyCategoryName", () => {
  it("creates lowercase hyphenated slugs", () => {
    expect(slugifyCategoryName("Grande Terre")).toBe("grande-terre");
  });
});
```

```ts
// append to C:\Users\Zeyan\Desktop\test\apps\admin\lib\products.test.ts
it("serializes category information on a product", () => {
  const result = serializeProduct({
    _id: "abc123",
    name: "GT Leachie",
    price: 15000,
    imageUrl: "https://example.com/gecko.jpg",
    description: "Nice pattern",
    status: "published",
    categoryId: "cat1",
    category: { _id: "cat1", name: "Leachianus", slug: "leachianus" },
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z")
  });

  expect(result.category.name).toBe("Leachianus");
  expect(result.categoryId).toBe("cat1");
});
```

- [ ] **Step 2: Run the admin unit tests to verify they fail**

Run:

```powershell
pnpm --filter admin test
```

Expected: FAIL because category helpers and category-aware serialization do not exist yet.

- [ ] **Step 3: Add the category model and update product persistence**

```ts
// C:\Users\Zeyan\Desktop\test\apps\admin\models\category.ts
import { Schema, model, models } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true }
  },
  { timestamps: true }
);

export const CategoryModel = models.Category ?? model("Category", categorySchema);
```

```ts
// replace C:\Users\Zeyan\Desktop\test\apps\admin\models\product.ts
import { Schema, model, models } from "mongoose";

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["draft", "published"],
      required: true,
      default: "draft"
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true
    }
  },
  { timestamps: true }
);

export const ProductModel = models.Product ?? model("Product", productSchema);
```

```ts
// C:\Users\Zeyan\Desktop\test\apps\admin\lib\categories.ts
import type { CategoryInput, CategoryRecord } from "@pet-showcase/shared";
import { Types } from "mongoose";
import { CategoryModel } from "../models/category";
import { ProductModel } from "../models/product";
import { connectToDatabase } from "./db";

export function slugifyCategoryName(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function serializeCategory(category: {
  _id: Types.ObjectId | string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}): CategoryRecord {
  return {
    _id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString()
  };
}

export async function listCategories() {
  await connectToDatabase();
  const categories = await CategoryModel.find().sort({ name: 1 }).lean();
  return categories.map(serializeCategory);
}

export async function createCategory(input: CategoryInput) {
  await connectToDatabase();
  const category = await CategoryModel.create({
    name: input.name,
    slug: slugifyCategoryName(input.name)
  });
  return serializeCategory(category.toObject());
}

export async function updateCategory(id: string, input: CategoryInput) {
  if (!Types.ObjectId.isValid(id)) return null;
  await connectToDatabase();
  const category = await CategoryModel.findByIdAndUpdate(
    id,
    { name: input.name, slug: slugifyCategoryName(input.name) },
    { new: true }
  ).lean();
  return category ? serializeCategory(category) : null;
}

export async function deleteCategory(id: string) {
  if (!Types.ObjectId.isValid(id)) return { ok: false, reason: "invalid-id" as const };
  await connectToDatabase();
  const linkedProducts = await ProductModel.countDocuments({ categoryId: id });
  if (linkedProducts > 0) return { ok: false, reason: "category-in-use" as const };
  await CategoryModel.findByIdAndDelete(id);
  return { ok: true as const };
}
```

- [ ] **Step 4: Update product serialization and queries to populate category**

```ts
// key shape changes inside C:\Users\Zeyan\Desktop\test\apps\admin\lib\products.ts
type RawProduct = {
  _id: Types.ObjectId | string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  status: "draft" | "published";
  categoryId: Types.ObjectId | string;
  category: { _id: Types.ObjectId | string; name: string; slug: string };
  createdAt: Date;
  updatedAt: Date;
};

export function serializeProduct(product: RawProduct): ProductRecord {
  return {
    _id: product._id.toString(),
    name: product.name,
    price: product.price,
    imageUrl: product.imageUrl,
    description: product.description,
    status: product.status,
    categoryId: product.categoryId.toString(),
    category: {
      _id: product.category._id.toString(),
      name: product.category.name,
      slug: product.category.slug
    },
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString()
  };
}

const productQuery = ProductModel.find().populate("categoryId", "name slug");
```

Use the populated `categoryId` document to build `category`, and keep `categoryId` as the selected foreign key on the record.

- [ ] **Step 5: Run tests to verify they pass**

Run:

```powershell
pnpm --filter admin test
```

Expected: PASS for `lib/categories.test.ts` and updated `lib/products.test.ts`.

- [ ] **Step 6: Commit**

```powershell
git add apps/admin/models/category.ts apps/admin/models/product.ts apps/admin/lib/categories.ts apps/admin/lib/categories.test.ts apps/admin/lib/products.ts apps/admin/lib/products.test.ts
git commit -m "feat: add admin category persistence"
```

### Task 3: Add category CRUD APIs and category-aware product APIs

**Files:**
- Create: `C:\Users\Zeyan\Desktop\test\apps\admin\app\api\categories\route.ts`
- Create: `C:\Users\Zeyan\Desktop\test\apps\admin\app\api\categories\[id]\route.ts`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\app\api\products\route.ts`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\app\api\products\[id]\route.ts`

- [ ] **Step 1: Add failing API expectations as inline route tests or request helpers**

```ts
// append to an existing admin API test file or create one later during implementation
expect(await createProduct({
  name: "GT Leachie",
  price: 15000,
  imageUrl: "https://example.com/gecko.jpg",
  description: "Captive bred",
  status: "published",
  categoryId: "missing-category"
})).rejects.toThrow();
```

- [ ] **Step 2: Implement the category collection routes**

```ts
// C:\Users\Zeyan\Desktop\test\apps\admin\app\api\categories\route.ts
import { NextResponse } from "next/server";
import { categoryInputSchema } from "@pet-showcase/shared";
import { createCategory, listCategories } from "../../../lib/categories";

export async function GET() {
  const categories = await listCategories();
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const json = await request.json();
  const input = categoryInputSchema.parse(json);
  const category = await createCategory(input);
  return NextResponse.json(category, { status: 201 });
}
```

```ts
// C:\Users\Zeyan\Desktop\test\apps\admin\app\api\categories\[id]\route.ts
import { NextResponse } from "next/server";
import { categoryInputSchema } from "@pet-showcase/shared";
import { deleteCategory, updateCategory } from "../../../../lib/categories";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const input = categoryInputSchema.parse(await request.json());
  const category = await updateCategory(id, input);
  return category
    ? NextResponse.json(category)
    : NextResponse.json({ message: "Category not found" }, { status: 404 });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const result = await deleteCategory(id);
  if (!result.ok && result.reason === "category-in-use") {
    return NextResponse.json(
      { message: "Reassign products before deleting this category." },
      { status: 409 }
    );
  }
  return result.ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ message: "Category not found" }, { status: 404 });
}
```

- [ ] **Step 3: Require `categoryId` in product create and update routes**

```ts
// key line inside C:\Users\Zeyan\Desktop\test\apps\admin\app\api\products\route.ts
const input = productInputSchema.parse(await request.json());
const product = await createProduct(input);
return NextResponse.json(product, { status: 201 });
```

```ts
// key line inside C:\Users\Zeyan\Desktop\test\apps\admin\app\api\products\[id]\route.ts
const input = productInputSchema.parse(await request.json());
const product = await updateProduct(id, input);
```

Ensure both routes return category data on success so the UI can refresh with one response.

- [ ] **Step 4: Manually verify the routes**

Run:

```powershell
pnpm --filter admin dev
Invoke-RestMethod http://localhost:3001/api/categories
```

Expected: `[]` or a JSON category list.

Then create a category:

```powershell
Invoke-RestMethod http://localhost:3001/api/categories -Method Post -ContentType 'application/json' -Body '{"name":"Leachianus"}'
```

Expected: JSON with `name`, `slug`, and `_id`.

- [ ] **Step 5: Commit**

```powershell
git add apps/admin/app/api/categories/route.ts apps/admin/app/api/categories/[id]/route.ts apps/admin/app/api/products/route.ts apps/admin/app/api/products/[id]/route.ts
git commit -m "feat: add category api routes"
```

### Task 4: Build admin category management and thread category selection into product forms

**Files:**
- Create: `C:\Users\Zeyan\Desktop\test\apps\admin\components\category-form.tsx`
- Create: `C:\Users\Zeyan\Desktop\test\apps\admin\components\category-table.tsx`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\components\product-form.tsx`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\components\product-table.tsx`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\app\layout.tsx`
- Create: `C:\Users\Zeyan\Desktop\test\apps\admin\app\categories\page.tsx`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\app\products\page.tsx`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\app\products\new\page.tsx`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\app\products\[id]\edit\page.tsx`

- [ ] **Step 1: Add UI tests or minimal rendering checks for category controls**

```ts
// add an admin component test
render(<ProductForm categories={[{ _id: "1", name: "Leachianus", slug: "leachianus", createdAt: "", updatedAt: "" }]} />);
expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
```

- [ ] **Step 2: Create the category management UI**

```tsx
// C:\Users\Zeyan\Desktop\test\apps\admin\components\category-form.tsx
"use client";

import { useState } from "react";

export function CategoryForm() {
  const [name, setName] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    window.location.reload();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-2xl border border-stone-800 bg-stone-950 p-4">
      <label className="grid gap-2 text-sm text-stone-200">
        Category name
        <input value={name} onChange={(event) => setName(event.target.value)} className="rounded-xl border border-stone-700 bg-stone-900 px-3 py-2" />
      </label>
      <button className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-stone-950">Add category</button>
    </form>
  );
}
```

```tsx
// C:\Users\Zeyan\Desktop\test\apps\admin\app\categories\page.tsx
import { CategoryForm } from "../../components/category-form";
import { CategoryTable } from "../../components/category-table";
import { listCategories } from "../../lib/categories";

export default async function CategoriesPage() {
  const categories = await listCategories();

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Admin</p>
        <h1 className="text-3xl font-bold text-white">Categories</h1>
      </header>
      <CategoryForm />
      <CategoryTable categories={categories} />
    </main>
  );
}
```

- [ ] **Step 3: Add category selection to product create and edit flows**

```tsx
// key addition inside C:\Users\Zeyan\Desktop\test\apps\admin\components\product-form.tsx
<label className="grid gap-2 text-sm font-medium text-stone-200">
  Category
  <select
    name="categoryId"
    defaultValue={initialValues.categoryId}
    className="rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-stone-50"
    required
  >
    <option value="">Select a category</option>
    {categories.map((category) => (
      <option key={category._id} value={category._id}>
        {category.name}
      </option>
    ))}
  </select>
</label>
```

Load categories in `products/new/page.tsx` and `products/[id]/edit/page.tsx` with `listCategories()` and pass them into the form.

- [ ] **Step 4: Add admin navigation and category columns**

```tsx
// key nav addition in C:\Users\Zeyan\Desktop\test\apps\admin\app\layout.tsx
<nav className="flex gap-3 text-sm font-medium text-stone-300">
  <Link href="/products">Products</Link>
  <Link href="/categories">Categories</Link>
</nav>
```

```tsx
// key column in C:\Users\Zeyan\Desktop\test\apps\admin\components\product-table.tsx
<th className="px-4 py-3 text-left">Category</th>
...
<td className="px-4 py-3 text-stone-300">{product.category.name}</td>
```

- [ ] **Step 5: Verify the admin flows manually**

Run:

```powershell
pnpm --filter admin dev
```

Expected:

- `/categories` lets you create a category
- `/products/new` requires selecting a category
- `/products` shows the chosen category name in the list

- [ ] **Step 6: Commit**

```powershell
git add apps/admin/components/category-form.tsx apps/admin/components/category-table.tsx apps/admin/components/product-form.tsx apps/admin/components/product-table.tsx apps/admin/app/layout.tsx apps/admin/app/categories/page.tsx apps/admin/app/products/page.tsx apps/admin/app/products/new/page.tsx apps/admin/app/products/[id]/edit/page.tsx
git commit -m "feat: add admin category management ui"
```

### Task 5: Make the web data layer category-aware and redesign the storefront shell

**Files:**
- Modify: `C:\Users\Zeyan\Desktop\test\apps\web\lib\products.ts`
- Create: `C:\Users\Zeyan\Desktop\test\apps\web\lib\categories.ts`
- Create: `C:\Users\Zeyan\Desktop\test\apps\web\components\category-nav.tsx`
- Create: `C:\Users\Zeyan\Desktop\test\apps\web\components\announcement-bar.tsx`
- Create: `C:\Users\Zeyan\Desktop\test\apps\web\components\storefront-shell.tsx`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\web\app\page.tsx`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\web\app\globals.css`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\web\app\page.test.tsx`

- [ ] **Step 1: Add a failing page test for category navigation**

```ts
// replace C:\Users\Zeyan\Desktop\test\apps\web\app\page.test.tsx expectation
expect(screen.getByText(/all geckos/i)).toBeInTheDocument();
expect(screen.getByText(/featured breeder collection/i)).toBeInTheDocument();
```

- [ ] **Step 2: Add category fetching helpers**

```ts
// C:\Users\Zeyan\Desktop\test\apps\web\lib\categories.ts
import type { CategoryRecord } from "@pet-showcase/shared";
import { apiBaseUrl } from "./api";

export async function getCategories(): Promise<CategoryRecord[]> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/categories`, { cache: "no-store" });
    if (!response.ok) return [];
    return (await response.json()) as CategoryRecord[];
  } catch {
    return [];
  }
}
```

```ts
// key update inside C:\Users\Zeyan\Desktop\test\apps\web\lib\products.ts
export async function getPublishedProducts(category?: string): Promise<ProductRecord[]> {
  const query = category ? `?status=published&category=${encodeURIComponent(category)}` : "?status=published";
  const response = await fetch(`${apiBaseUrl}/api/products${query}`, { cache: "no-store" });
  ...
}
```

- [ ] **Step 3: Create the dark storefront shell and category nav**

```tsx
// C:\Users\Zeyan\Desktop\test\apps\web\components\announcement-bar.tsx
export function AnnouncementBar() {
  return (
    <div className="border-b border-stone-800 bg-stone-950 px-4 py-2 text-center text-[11px] uppercase tracking-[0.28em] text-stone-300">
      Featured breeder collection
    </div>
  );
}
```

```tsx
// C:\Users\Zeyan\Desktop\test\apps\web\components\category-nav.tsx
import Link from "next/link";
import type { CategoryRecord } from "@pet-showcase/shared";

export function CategoryNav({
  categories,
  activeSlug
}: {
  categories: CategoryRecord[];
  activeSlug?: string;
}) {
  return (
    <nav className="flex gap-2 overflow-x-auto pb-1">
      <Link href="/" className={activeSlug ? "store-pill" : "store-pill store-pill-active"}>
        All Geckos
      </Link>
      {categories.map((category) => (
        <Link
          key={category._id}
          href={`/?category=${category.slug}`}
          className={activeSlug === category.slug ? "store-pill store-pill-active" : "store-pill"}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
```

```tsx
// C:\Users\Zeyan\Desktop\test\apps\web\components\storefront-shell.tsx
import { AnnouncementBar } from "./announcement-bar";

export function StorefrontShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-100 text-stone-950">
      <AnnouncementBar />
      <div className="bg-stone-950 text-stone-50">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-300">Northern Collection</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
            Specialist gecko listings with breeder-style category browsing.
          </h1>
        </div>
      </div>
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Replace the old homepage layout with category-aware storefront composition**

```tsx
// replace C:\Users\Zeyan\Desktop\test\apps\web\app\page.tsx
import { EmptyState } from "../components/empty-state";
import { ProductList } from "../components/product-list";
import { CategoryNav } from "../components/category-nav";
import { StorefrontShell } from "../components/storefront-shell";
import { getCategories } from "../lib/categories";
import { getPublishedProducts } from "../lib/products";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [categories, products] = await Promise.all([
    getCategories(),
    getPublishedProducts(category)
  ]);

  return (
    <StorefrontShell>
      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6">
        <CategoryNav categories={categories} activeSlug={category} />
        {products.length === 0 ? <EmptyState /> : <ProductList products={products} />}
      </main>
    </StorefrontShell>
  );
}
```

- [ ] **Step 5: Add the shared storefront utility classes**

```css
/* append to C:\Users\Zeyan\Desktop\test\apps\web\app\globals.css */
body {
  font-family: "Segoe UI", ui-sans-serif, system-ui, sans-serif;
  background: #f5f1ea;
  color: #191611;
}

.store-pill {
  border-radius: 9999px;
  border: 1px solid rgb(87 83 78);
  background: rgb(28 25 23);
  padding: 0.625rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  color: rgb(231 229 228);
  text-transform: uppercase;
  white-space: nowrap;
}

.store-pill-active {
  border-color: rgb(252 211 77);
  color: rgb(252 211 77);
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run:

```powershell
pnpm --filter web test
```

Expected: PASS with the new header and category nav assertions.

- [ ] **Step 7: Commit**

```powershell
git add apps/web/lib/categories.ts apps/web/lib/products.ts apps/web/components/category-nav.tsx apps/web/components/announcement-bar.tsx apps/web/components/storefront-shell.tsx apps/web/app/page.tsx apps/web/app/globals.css apps/web/app/page.test.tsx
git commit -m "feat: redesign storefront shell"
```

### Task 6: Convert the web product list and detail page into desktop catalog + mobile masonry layouts

**Files:**
- Modify: `C:\Users\Zeyan\Desktop\test\apps\web\components\product-card.tsx`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\web\components\product-list.tsx`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\web\app\products\[id]\page.tsx`

- [ ] **Step 1: Add a failing visual expectation for category labels on cards**

```ts
expect(screen.getByText(/leachianus/i)).toBeInTheDocument();
```

- [ ] **Step 2: Rebuild the product card with catalog styling and masonry-friendly structure**

```tsx
// replace C:\Users\Zeyan\Desktop\test\apps\web\components\product-card.tsx
import Image from "next/image";
import Link from "next/link";
import type { ProductRecord } from "@pet-showcase/shared";

export function ProductCard({ product, index }: { product: ProductRecord; index: number }) {
  const imageClass = index % 3 === 0 ? "aspect-[4/5]" : index % 3 === 1 ? "aspect-[4/4.6]" : "aspect-[4/5.4]";

  return (
    <Link
      href={`/products/${product._id}`}
      className="group mb-4 block break-inside-avoid overflow-hidden rounded-[1.75rem] border border-stone-300 bg-[#f7f3ed] shadow-[0_16px_40px_rgba(28,25,23,0.08)] transition hover:-translate-y-0.5"
    >
      <div className={`relative ${imageClass} overflow-hidden bg-stone-200`}>
        <Image src={product.imageUrl} alt={product.name} fill className="object-cover transition duration-500 group-hover:scale-[1.03]" />
      </div>
      <div className="space-y-2 px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">{product.category.name}</p>
        <h2 className="text-base font-semibold leading-snug text-stone-950 md:text-lg">{product.name}</h2>
        <p className="text-sm font-semibold text-stone-700">NT$ {product.price}</p>
      </div>
    </Link>
  );
}
```

- [ ] **Step 3: Rebuild the list and detail layouts**

```tsx
// replace C:\Users\Zeyan\Desktop\test\apps\web\components\product-list.tsx
import type { ProductRecord } from "@pet-showcase/shared";
import { ProductCard } from "./product-card";

export function ProductList({ products }: { products: ProductRecord[] }) {
  return (
    <>
      <section className="hidden gap-5 md:grid md:grid-cols-3 xl:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard key={product._id} product={product} index={index} />
        ))}
      </section>
      <section className="columns-2 gap-4 md:hidden">
        {products.map((product, index) => (
          <ProductCard key={product._id} product={product} index={index} />
        ))}
      </section>
    </>
  );
}
```

```tsx
// replace C:\Users\Zeyan\Desktop\test\apps\web\app\products\[id]\page.tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StorefrontShell } from "../../../components/storefront-shell";
import { getPublishedProductById } from "../../../lib/products";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getPublishedProductById(id);

  if (!product) notFound();

  return (
    <StorefrontShell>
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[1.1fr,0.9fr] md:items-start">
        <div className="overflow-hidden rounded-[2rem] border border-stone-800 bg-stone-950">
          <div className="relative aspect-[4/5]">
            <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
          </div>
        </div>
        <section className="space-y-4 rounded-[2rem] bg-stone-950 p-6 text-stone-50">
          <Link href="/" className="text-xs uppercase tracking-[0.22em] text-stone-400">
            Back to collection
          </Link>
          <p className="text-xs uppercase tracking-[0.3em] text-amber-300">{product.category.name}</p>
          <h1 className="text-3xl font-semibold md:text-4xl">{product.name}</h1>
          <p className="text-lg font-semibold text-stone-200">NT$ {product.price}</p>
          <p className="leading-7 text-stone-300">{product.description}</p>
        </section>
      </main>
    </StorefrontShell>
  );
}
```

- [ ] **Step 4: Verify locally in the browser**

Run:

```powershell
pnpm dev
```

Expected:

- Desktop shows a dark catalog shell with denser merchandise presentation
- Mobile shows two columns with staggered card heights
- Product detail inherits the dark storefront styling and shows the category label

- [ ] **Step 5: Run the full test suite and build**

Run:

```powershell
pnpm test
pnpm build
```

Expected: PASS across shared, admin, and web workspaces.

- [ ] **Step 6: Commit**

```powershell
git add apps/web/components/product-card.tsx apps/web/components/product-list.tsx apps/web/app/products/[id]/page.tsx
git commit -m "feat: add category storefront layouts"
```

## Self-Review

### Spec coverage

- Real categories: covered in Tasks 1-4
- Single-category product assignment: covered in Tasks 1-4
- Category rename/delete lifecycle: covered in Tasks 2-4
- Desktop storefront close to reference: covered in Tasks 5-6
- Mobile two-column masonry browsing: covered in Task 6
- Detail page restyle: covered in Task 6

### Placeholder scan

- No `TBD` or `TODO` markers remain
- Each task lists concrete files, commands, and expected outcomes
- Deletion safeguard is explicitly implemented as “block deletion when category is in use”

### Type consistency

- `categoryId` is introduced in shared schema first, then used consistently in admin models, APIs, and forms
- `ProductRecord.category` is introduced in shared types and then referenced by admin tables and web cards/detail pages

