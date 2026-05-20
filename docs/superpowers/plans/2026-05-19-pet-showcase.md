# Pet Showcase Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first pet showcase website in a monorepo with a public frontend, a single-admin backend, MongoDB persistence, and Cloudinary image uploads.

**Architecture:** Use a `pnpm` + `Turborepo` monorepo with two Next.js apps: `apps/web` for the public product list and detail pages, and `apps/admin` for admin authentication and product management. Share UI primitives, validation schemas, and TypeScript types through `packages/ui`, `packages/shared`, and `packages/config`, while keeping database, auth, and upload logic isolated behind app-local server code.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, pnpm, Turborepo, MongoDB, Mongoose, Cloudinary, Zod, NextAuth or custom credentials auth, Vitest, Testing Library, Playwright

---

## File Structure

Planned repository layout:

```txt
.
├─ apps/
│  ├─ web/
│  │  ├─ app/
│  │  │  ├─ layout.tsx
│  │  │  ├─ page.tsx
│  │  │  ├─ products/[id]/page.tsx
│  │  │  ├─ globals.css
│  │  │  └─ not-found.tsx
│  │  ├─ components/
│  │  │  ├─ product-card.tsx
│  │  │  ├─ product-list.tsx
│  │  │  └─ empty-state.tsx
│  │  ├─ lib/
│  │  │  ├─ api.ts
│  │  │  └─ products.ts
│  │  ├─ package.json
│  │  ├─ tailwind.config.ts
│  │  ├─ tsconfig.json
│  │  └─ vitest.config.ts
│  └─ admin/
│     ├─ app/
│     │  ├─ layout.tsx
│     │  ├─ login/page.tsx
│     │  ├─ products/page.tsx
│     │  ├─ products/new/page.tsx
│     │  ├─ products/[id]/edit/page.tsx
│     │  ├─ api/auth/[...nextauth]/route.ts
│     │  ├─ api/products/route.ts
│     │  ├─ api/products/[id]/route.ts
│     │  ├─ api/uploads/route.ts
│     │  └─ globals.css
│     ├─ components/
│     │  ├─ login-form.tsx
│     │  ├─ product-form.tsx
│     │  ├─ product-table.tsx
│     │  └─ image-upload.tsx
│     ├─ lib/
│     │  ├─ auth.ts
│     │  ├─ cloudinary.ts
│     │  ├─ db.ts
│     │  └─ products.ts
│     ├─ middleware.ts
│     ├─ package.json
│     ├─ tailwind.config.ts
│     ├─ tsconfig.json
│     └─ vitest.config.ts
├─ packages/
│  ├─ ui/
│  │  ├─ src/button.tsx
│  │  ├─ src/input.tsx
│  │  ├─ src/card.tsx
│  │  ├─ src/textarea.tsx
│  │  ├─ src/index.ts
│  │  ├─ package.json
│  │  └─ tsconfig.json
│  ├─ shared/
│  │  ├─ src/product.ts
│  │  ├─ src/env.ts
│  │  ├─ src/index.ts
│  │  ├─ package.json
│  │  └─ tsconfig.json
│  └─ config/
│     ├─ eslint/base.js
│     ├─ tailwind/preset.ts
│     ├─ typescript/base.json
│     └─ package.json
├─ tests/
│  ├─ admin-auth.spec.ts
│  ├─ admin-products.spec.ts
│  └─ web-products.spec.ts
├─ .env.example
├─ package.json
├─ pnpm-workspace.yaml
├─ turbo.json
└─ README.md
```

## Task 1: Scaffold the Monorepo

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `turbo.json`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `README.md`
- Create: `apps/web/package.json`
- Create: `apps/admin/package.json`
- Create: `packages/ui/package.json`
- Create: `packages/shared/package.json`
- Create: `packages/config/package.json`

- [ ] **Step 1: Write the failing workspace check**

Create `package.json` with workspace scripts before installing app code:

```json
{
  "name": "pet-showcase-monorepo",
  "private": true,
  "packageManager": "pnpm@10.0.0",
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev --parallel",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "e2e": "playwright test"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}
```

- [ ] **Step 2: Run workspace command to verify it fails before setup**

Run: `pnpm build`
Expected: FAIL with a workspace or missing-package error because the apps and packages do not exist yet

- [ ] **Step 3: Write the monorepo configuration**

Create `pnpm-workspace.yaml`:

```yaml
packages:
  - apps/*
  - packages/*
```

Create `turbo.json`:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "test": {
      "dependsOn": ["^test"],
      "outputs": ["coverage/**"]
    }
  }
}
```

Create `.env.example`:

```env
MONGODB_URI=
NEXTAUTH_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Create `.gitignore`:

```gitignore
node_modules
.next
dist
coverage
.env
.turbo
playwright-report
test-results
```

Create `README.md`:

```md
# Pet Showcase Monorepo

Mobile-first pet showcase website with a public storefront and admin backend.
```

Create `apps/web/package.json`:

```json
{
  "name": "@pet-showcase/web",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run"
  }
}
```

Create `apps/admin/package.json`:

```json
{
  "name": "@pet-showcase/admin",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3001",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run"
  }
}
```

Create `packages/ui/package.json`:

```json
{
  "name": "@pet-showcase/ui",
  "version": "0.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts"
}
```

Create `packages/shared/package.json`:

```json
{
  "name": "@pet-showcase/shared",
  "version": "0.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts"
}
```

Create `packages/config/package.json`:

```json
{
  "name": "@pet-showcase/config",
  "version": "0.0.0",
  "private": true
}
```

- [ ] **Step 4: Run workspace command to verify the root config is valid**

Run: `pnpm install`
Expected: PASS with workspace dependencies installed and lockfile created

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-workspace.yaml turbo.json .gitignore .env.example README.md apps packages
git commit -m "chore: scaffold monorepo workspace"
```

## Task 2: Add Shared Config, Types, and Validation

**Files:**
- Create: `packages/config/typescript/base.json`
- Create: `packages/config/tailwind/preset.ts`
- Create: `packages/config/eslint/base.js`
- Create: `packages/shared/src/product.ts`
- Create: `packages/shared/src/env.ts`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/ui/src/button.tsx`
- Create: `packages/ui/src/input.tsx`
- Create: `packages/ui/src/card.tsx`
- Create: `packages/ui/src/textarea.tsx`
- Create: `packages/ui/src/index.ts`
- Create: `packages/ui/tsconfig.json`

- [ ] **Step 1: Write the failing validation test**

Create `packages/shared/src/product.ts` test target by defining the expected API:

```ts
import { describe, expect, it } from "vitest";
import { productInputSchema } from "@pet-showcase/shared";

describe("productInputSchema", () => {
  it("rejects missing required fields", () => {
    const result = productInputSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @pet-showcase/shared test`
Expected: FAIL because the shared package does not yet export `productInputSchema`

- [ ] **Step 3: Write shared schema, env helpers, and UI primitives**

Create `packages/config/typescript/base.json`:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "es2022"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "jsx": "preserve",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "baseUrl": "."
  }
}
```

Create `packages/config/tailwind/preset.ts`:

```ts
import type { Config } from "tailwindcss";

const preset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        sand: "#f8f1e7",
        bark: "#6b4f3a",
        moss: "#7c9b6b",
        ink: "#1f1a17"
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem"
      }
    }
  }
};

export default preset;
```

Create `packages/config/eslint/base.js`:

```js
module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    "react/react-in-jsx-scope": "off"
  }
};
```

Create `packages/shared/src/product.ts`:

```ts
import { z } from "zod";

export const productStatusSchema = z.enum(["draft", "published"]);

export const productInputSchema = z.object({
  name: z.string().min(1).max(80),
  price: z.coerce.number().min(0),
  imageUrl: z.string().url(),
  description: z.string().min(1).max(2000),
  status: productStatusSchema
});

export type ProductInput = z.infer<typeof productInputSchema>;

export type ProductRecord = ProductInput & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};
```

Create `packages/shared/src/env.ts`:

```ts
import { z } from "zod";

export const serverEnvSchema = z.object({
  MONGODB_URI: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1)
});

export const parseServerEnv = (env: Record<string, string | undefined>) =>
  serverEnvSchema.parse(env);
```

Create `packages/shared/src/index.ts`:

```ts
export * from "./env";
export * from "./product";
```

Create `packages/shared/tsconfig.json`:

```json
{
  "extends": "../config/typescript/base.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"]
}
```

Create `packages/ui/src/button.tsx`:

```tsx
import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button(props: ButtonProps) {
  return (
    <button
      {...props}
      className={`min-h-11 rounded-2xl bg-bark px-4 py-3 text-sm font-semibold text-white ${props.className ?? ""}`}
    />
  );
}
```

Create `packages/ui/src/input.tsx`:

```tsx
import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input(props: InputProps) {
  return (
    <input
      {...props}
      className={`min-h-11 w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm ${props.className ?? ""}`}
    />
  );
}
```

Create `packages/ui/src/card.tsx`:

```tsx
import { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card(props: CardProps) {
  return (
    <div
      {...props}
      className={`rounded-2xl bg-white shadow-sm ring-1 ring-stone-200 ${props.className ?? ""}`}
    />
  );
}
```

Create `packages/ui/src/textarea.tsx`:

```tsx
import { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea(props: TextareaProps) {
  return (
    <textarea
      {...props}
      className={`min-h-32 w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm ${props.className ?? ""}`}
    />
  );
}
```

Create `packages/ui/src/index.ts`:

```ts
export * from "./button";
export * from "./card";
export * from "./input";
export * from "./textarea";
```

Create `packages/ui/tsconfig.json`:

```json
{
  "extends": "../config/typescript/base.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"]
}
```

- [ ] **Step 4: Run the shared package test**

Run: `pnpm --filter @pet-showcase/shared test`
Expected: PASS with the validation test succeeding

- [ ] **Step 5: Commit**

```bash
git add packages
git commit -m "feat: add shared schemas and ui primitives"
```

## Task 3: Create the Public Web App Shell

**Files:**
- Create: `apps/web/app/layout.tsx`
- Create: `apps/web/app/page.tsx`
- Create: `apps/web/app/products/[id]/page.tsx`
- Create: `apps/web/app/not-found.tsx`
- Create: `apps/web/app/globals.css`
- Create: `apps/web/components/product-card.tsx`
- Create: `apps/web/components/product-list.tsx`
- Create: `apps/web/components/empty-state.tsx`
- Create: `apps/web/lib/api.ts`
- Create: `apps/web/lib/products.ts`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/tailwind.config.ts`
- Create: `apps/web/vitest.config.ts`

- [ ] **Step 1: Write the failing public list test**

Create `tests/web-products.spec.ts`:

```ts
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "../apps/web/app/page";

describe("HomePage", () => {
  it("renders the empty state when no products are available", async () => {
    const view = await HomePage();
    render(view);
    expect(screen.getByText("No pets available yet.")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test -- --runInBand tests/web-products.spec.ts`
Expected: FAIL because the web app pages and components do not exist yet

- [ ] **Step 3: Write the web app layout, page, and components**

Create `apps/web/app/layout.tsx`:

```tsx
import "./globals.css";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-sand text-ink">{children}</body>
    </html>
  );
}
```

Create `apps/web/app/page.tsx`:

```tsx
import { EmptyState } from "../components/empty-state";
import { ProductList } from "../components/product-list";
import { getPublishedProducts } from "../lib/products";

export default async function HomePage() {
  const products = await getPublishedProducts();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-4 py-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-bark">Pet Showcase</p>
        <h1 className="text-3xl font-bold">Find your next companion</h1>
      </header>
      {products.length === 0 ? <EmptyState /> : <ProductList products={products} />}
    </main>
  );
}
```

Create `apps/web/app/products/[id]/page.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedProductById } from "../../lib/products";

export default async function ProductDetailPage({
  params
}: {
  params: { id: string };
}) {
  const product = await getPublishedProductById(params.id);

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-4 py-6">
      <Link href="/" className="text-sm font-semibold text-bark">
        Back to list
      </Link>
      <div className="overflow-hidden rounded-[28px] bg-white shadow-sm">
        <div className="relative aspect-[4/5]">
          <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
        </div>
        <div className="space-y-3 p-4">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-lg font-semibold text-bark">${product.price}</p>
          <p className="text-sm leading-6 text-stone-700">{product.description}</p>
        </div>
      </div>
    </main>
  );
}
```

Create `apps/web/app/not-found.tsx`:

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold">Pet not found</h1>
      <Link href="/" className="text-sm font-semibold text-bark">
        Back to home
      </Link>
    </main>
  );
}
```

Create `apps/web/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: ui-sans-serif, system-ui, sans-serif;
}
```

Create `apps/web/components/empty-state.tsx`:

```tsx
export function EmptyState() {
  return (
    <section className="rounded-[28px] bg-white p-6 text-center shadow-sm">
      <h2 className="text-lg font-semibold">No pets available yet.</h2>
      <p className="mt-2 text-sm text-stone-600">Check back soon for new showcase items.</p>
    </section>
  );
}
```

Create `apps/web/components/product-card.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import { ProductRecord } from "@pet-showcase/shared";

export function ProductCard({ product }: { product: ProductRecord }) {
  return (
    <Link href={`/products/${product._id}`} className="overflow-hidden rounded-[28px] bg-white shadow-sm">
      <div className="relative aspect-[4/5]">
        <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
      </div>
      <div className="space-y-2 p-4">
        <h2 className="text-lg font-semibold">{product.name}</h2>
        <p className="text-sm font-semibold text-bark">${product.price}</p>
      </div>
    </Link>
  );
}
```

Create `apps/web/components/product-list.tsx`:

```tsx
import { ProductRecord } from "@pet-showcase/shared";
import { ProductCard } from "./product-card";

export function ProductList({ products }: { products: ProductRecord[] }) {
  return (
    <section className="grid gap-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </section>
  );
}
```

Create `apps/web/lib/api.ts`:

```ts
export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
```

Create `apps/web/lib/products.ts`:

```ts
import { ProductRecord } from "@pet-showcase/shared";

export async function getPublishedProducts(): Promise<ProductRecord[]> {
  return [];
}

export async function getPublishedProductById(id: string): Promise<ProductRecord | null> {
  const products = await getPublishedProducts();
  return products.find((product) => product._id === id) ?? null;
}
```

Create `apps/web/tsconfig.json`:

```json
{
  "extends": "../../packages/config/typescript/base.json",
  "compilerOptions": {
    "paths": {
      "@pet-showcase/shared": ["../../packages/shared/src/index.ts"],
      "@pet-showcase/ui": ["../../packages/ui/src/index.ts"]
    },
    "plugins": [{ "name": "next" }]
  },
  "include": ["app", "components", "lib", ".next/types/**/*.ts"]
}
```

Create `apps/web/tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";
import preset from "@pet-showcase/config/tailwind/preset";

const config: Config = {
  presets: [preset],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"]
};

export default config;
```

Create `apps/web/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom"
  }
});
```

- [ ] **Step 4: Run the public list test again**

Run: `pnpm test -- --runInBand tests/web-products.spec.ts`
Expected: PASS with the empty state rendered

- [ ] **Step 5: Commit**

```bash
git add apps/web tests/web-products.spec.ts
git commit -m "feat: add mobile-first public web app shell"
```

## Task 4: Add Database and Product Persistence

**Files:**
- Create: `apps/admin/lib/db.ts`
- Create: `apps/admin/lib/products.ts`
- Create: `apps/admin/models/product.ts`
- Modify: `apps/web/lib/products.ts`
- Create: `apps/admin/lib/products.test.ts`

- [ ] **Step 1: Write the failing product persistence test**

Create `apps/admin/lib/products.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @pet-showcase/admin test`
Expected: FAIL because the admin product persistence layer does not exist yet

- [ ] **Step 3: Write the MongoDB connection, model, and query helpers**

Create `apps/admin/lib/db.ts`:

```ts
import mongoose from "mongoose";

declare global {
  var mongooseConnection: Promise<typeof mongoose> | undefined;
}

export function connectToDatabase() {
  if (!global.mongooseConnection) {
    global.mongooseConnection = mongoose.connect(process.env.MONGODB_URI as string);
  }

  return global.mongooseConnection;
}
```

Create `apps/admin/models/product.ts`:

```ts
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
    }
  },
  {
    timestamps: true
  }
);

export const ProductModel = models.Product ?? model("Product", productSchema);
```

Create `apps/admin/lib/products.ts`:

```ts
import { ProductInput, ProductRecord } from "@pet-showcase/shared";
import { connectToDatabase } from "./db";
import { ProductModel } from "../models/product";

export function serializeProduct(product: any): ProductRecord {
  return {
    _id: product._id.toString(),
    name: product.name,
    price: product.price,
    imageUrl: product.imageUrl,
    description: product.description,
    status: product.status,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString()
  };
}

export async function listProducts() {
  await connectToDatabase();
  const products = await ProductModel.find().sort({ createdAt: -1 }).lean();
  return products.map(serializeProduct);
}

export async function listPublishedProducts() {
  await connectToDatabase();
  const products = await ProductModel.find({ status: "published" }).sort({ createdAt: -1 }).lean();
  return products.map(serializeProduct);
}

export async function getPublishedProductById(id: string) {
  await connectToDatabase();
  const product = await ProductModel.findOne({ _id: id, status: "published" }).lean();
  return product ? serializeProduct(product) : null;
}

export async function createProduct(input: ProductInput) {
  await connectToDatabase();
  const product = await ProductModel.create(input);
  return serializeProduct(product);
}
```

Modify `apps/web/lib/products.ts`:

```ts
import { ProductRecord } from "@pet-showcase/shared";
import { apiBaseUrl } from "./api";

export async function getPublishedProducts(): Promise<ProductRecord[]> {
  const response = await fetch(`${apiBaseUrl}/api/products?status=published`, {
    cache: "no-store"
  });

  if (!response.ok) {
    return [];
  }

  return response.json();
}

export async function getPublishedProductById(id: string): Promise<ProductRecord | null> {
  const response = await fetch(`${apiBaseUrl}/api/products/${id}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}
```

- [ ] **Step 4: Run the admin test again**

Run: `pnpm --filter @pet-showcase/admin test`
Expected: PASS with the serializer test succeeding

- [ ] **Step 5: Commit**

```bash
git add apps/admin/lib apps/admin/models apps/web/lib/products.ts
git commit -m "feat: add mongodb product persistence"
```

## Task 5: Implement Admin Authentication

**Files:**
- Create: `apps/admin/lib/auth.ts`
- Create: `apps/admin/app/api/auth/[...nextauth]/route.ts`
- Create: `apps/admin/app/login/page.tsx`
- Create: `apps/admin/components/login-form.tsx`
- Create: `apps/admin/middleware.ts`
- Create: `tests/admin-auth.spec.ts`

- [ ] **Step 1: Write the failing admin auth test**

Create `tests/admin-auth.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("redirects unauthenticated admin users to login", async ({ page }) => {
  await page.goto("http://localhost:3001/products");
  await expect(page).toHaveURL(/\/login/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm e2e tests/admin-auth.spec.ts`
Expected: FAIL because the admin auth flow and route protection do not exist yet

- [ ] **Step 3: Write the credential auth flow**

Create `apps/admin/lib/auth.ts`:

```ts
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const isEmailMatch = credentials.email === process.env.ADMIN_EMAIL;
        const isPasswordMatch =
          credentials.password === process.env.ADMIN_PASSWORD ||
          (process.env.ADMIN_PASSWORD?.startsWith("$2") &&
            (await compare(credentials.password, process.env.ADMIN_PASSWORD)));

        if (!isEmailMatch || !isPasswordMatch) {
          return null;
        }

        return {
          id: "admin",
          email: credentials.email
        };
      }
    })
  ]
};
```

Create `apps/admin/app/api/auth/[...nextauth]/route.ts`:

```ts
import NextAuth from "next-auth";
import { authOptions } from "../../../../lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

Create `apps/admin/components/login-form.tsx`:

```tsx
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button, Input } from "@pet-showcase/ui";

export function LoginForm() {
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl: "/products",
      redirect: false
    });

    if (result?.error) {
      setError("Invalid credentials");
      return;
    }

    window.location.href = "/products";
  }

  return (
    <form
      action={handleSubmit}
      className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4"
    >
      <h1 className="text-2xl font-bold">Admin login</h1>
      <Input name="email" type="email" placeholder="Email" required />
      <Input name="password" type="password" placeholder="Password" required />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit">Sign in</Button>
    </form>
  );
}
```

Create `apps/admin/app/login/page.tsx`:

```tsx
import { LoginForm } from "../../components/login-form";

export default function LoginPage() {
  return <LoginForm />;
}
```

Create `apps/admin/middleware.ts`:

```ts
export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/products/:path*"]
};
```

- [ ] **Step 4: Run the Playwright test again**

Run: `pnpm e2e tests/admin-auth.spec.ts`
Expected: PASS with unauthenticated users redirected to `/login`

- [ ] **Step 5: Commit**

```bash
git add apps/admin tests/admin-auth.spec.ts
git commit -m "feat: add single-admin authentication"
```

## Task 6: Implement Admin Product CRUD and Upload UI

**Files:**
- Create: `apps/admin/app/layout.tsx`
- Create: `apps/admin/app/globals.css`
- Create: `apps/admin/app/products/page.tsx`
- Create: `apps/admin/app/products/new/page.tsx`
- Create: `apps/admin/app/products/[id]/edit/page.tsx`
- Create: `apps/admin/app/api/products/route.ts`
- Create: `apps/admin/app/api/products/[id]/route.ts`
- Create: `apps/admin/components/product-form.tsx`
- Create: `apps/admin/components/product-table.tsx`
- Create: `apps/admin/components/image-upload.tsx`
- Create: `tests/admin-products.spec.ts`

- [ ] **Step 1: Write the failing admin products test**

Create `tests/admin-products.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("admin can see the create product form", async ({ page }) => {
  await page.goto("http://localhost:3001/login");
  await page.fill('input[name="email"]', process.env.ADMIN_EMAIL as string);
  await page.fill('input[name="password"]', process.env.ADMIN_PASSWORD as string);
  await page.click('button[type="submit"]');
  await page.goto("http://localhost:3001/products/new");
  await expect(page.getByText("Create product")).toBeVisible();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm e2e tests/admin-products.spec.ts`
Expected: FAIL because the product admin pages and APIs do not exist yet

- [ ] **Step 3: Write the admin product pages, form, and APIs**

Create `apps/admin/app/layout.tsx`:

```tsx
import "./globals.css";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-sand text-ink">{children}</body>
    </html>
  );
}
```

Create `apps/admin/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: ui-sans-serif, system-ui, sans-serif;
}
```

Create `apps/admin/components/image-upload.tsx`:

```tsx
"use client";

import { useState } from "react";

export function ImageUpload({
  value,
  onChange
}: {
  value: string;
  onChange: (nextValue: string) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileChange(file: File | null) {
    if (!file) {
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/uploads", {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    onChange(data.imageUrl);
    setIsUploading(false);
  }

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept="image/*"
        onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
      />
      {isUploading ? <p className="text-sm text-stone-600">Uploading...</p> : null}
      {value ? <img src={value} alt="Preview" className="h-40 w-full rounded-2xl object-cover" /> : null}
    </div>
  );
}
```

Create `apps/admin/components/product-form.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Button, Input, Textarea } from "@pet-showcase/ui";
import { ImageUpload } from "./image-upload";
import { ProductRecord } from "@pet-showcase/shared";

export function ProductForm({
  initialValue,
  action,
  title
}: {
  initialValue?: Partial<ProductRecord>;
  action: "create" | "update";
  title: string;
}) {
  const [imageUrl, setImageUrl] = useState(initialValue?.imageUrl ?? "");

  async function handleSubmit(formData: FormData) {
    const payload = {
      name: String(formData.get("name") ?? ""),
      price: Number(formData.get("price") ?? 0),
      imageUrl,
      description: String(formData.get("description") ?? ""),
      status: String(formData.get("status") ?? "draft")
    };

    const endpoint = action === "create" ? "/api/products" : `/api/products/${initialValue?._id}`;
    const method = action === "create" ? "POST" : "PATCH";

    await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    window.location.href = "/products";
  }

  return (
    <form action={handleSubmit} className="mx-auto flex max-w-md flex-col gap-4 px-4 py-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <ImageUpload value={imageUrl} onChange={setImageUrl} />
      <Input name="name" defaultValue={initialValue?.name} placeholder="Product name" required />
      <Input name="price" type="number" defaultValue={initialValue?.price} placeholder="Price" required />
      <Textarea
        name="description"
        defaultValue={initialValue?.description}
        placeholder="Description"
        required
      />
      <select
        name="status"
        defaultValue={initialValue?.status ?? "draft"}
        className="min-h-11 rounded-2xl border border-stone-300 px-4"
      >
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </select>
      <Button type="submit">Save product</Button>
    </form>
  );
}
```

Create `apps/admin/components/product-table.tsx`:

```tsx
import Link from "next/link";
import { ProductRecord } from "@pet-showcase/shared";
import { Button, Card } from "@pet-showcase/ui";

export function ProductTable({ products }: { products: ProductRecord[] }) {
  async function deleteProduct(id: string) {
    "use server";
    await fetch(`${process.env.NEXT_PUBLIC_ADMIN_BASE_URL}/api/products/${id}`, {
      method: "DELETE"
    });
  }

  return (
    <div className="grid gap-4">
      {products.map((product) => (
        <Card key={product._id} className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">{product.name}</h2>
              <p className="text-sm text-stone-600">${product.price}</p>
            </div>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium uppercase">
              {product.status}
            </span>
          </div>
          <div className="flex gap-3">
            <Link href={`/products/${product._id}/edit`} className="text-sm font-semibold text-bark">
              Edit
            </Link>
            <form action={deleteProduct.bind(null, product._id)}>
              <Button type="submit" className="bg-red-600">
                Delete
              </Button>
            </form>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

Create `apps/admin/app/products/page.tsx`:

```tsx
import Link from "next/link";
import { Button } from "@pet-showcase/ui";
import { ProductTable } from "../../components/product-table";
import { listProducts } from "../../lib/products";

export default async function ProductsPage() {
  const products = await listProducts();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/products/new">
          <Button type="button">New</Button>
        </Link>
      </div>
      <ProductTable products={products} />
    </main>
  );
}
```

Create `apps/admin/app/products/new/page.tsx`:

```tsx
import { ProductForm } from "../../../components/product-form";

export default function NewProductPage() {
  return <ProductForm action="create" title="Create product" />;
}
```

Create `apps/admin/app/products/[id]/edit/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { ProductForm } from "../../../../components/product-form";
import { listProducts } from "../../../../lib/products";

export default async function EditProductPage({
  params
}: {
  params: { id: string };
}) {
  const products = await listProducts();
  const product = products.find((item) => item._id === params.id);

  if (!product) {
    notFound();
  }

  return <ProductForm action="update" title="Edit product" initialValue={product} />;
}
```

Create `apps/admin/app/api/products/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { productInputSchema } from "@pet-showcase/shared";
import { createProduct, listProducts, listPublishedProducts } from "../../../lib/products";

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status");
  const products = status === "published" ? await listPublishedProducts() : await listProducts();
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const json = await request.json();
  const input = productInputSchema.parse(json);
  const product = await createProduct(input);
  return NextResponse.json(product, { status: 201 });
}
```

Create `apps/admin/app/api/products/[id]/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { productInputSchema } from "@pet-showcase/shared";
import { connectToDatabase } from "../../../../lib/db";
import { ProductModel } from "../../../../models/product";
import { serializeProduct } from "../../../../lib/products";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const product = await ProductModel.findOne({ _id: params.id, status: "published" }).lean();

  if (!product) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json(serializeProduct(product));
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const json = await request.json();
  const input = productInputSchema.parse(json);

  await connectToDatabase();
  const product = await ProductModel.findByIdAndUpdate(params.id, input, {
    new: true
  }).lean();

  return NextResponse.json(serializeProduct(product));
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();
  await ProductModel.findByIdAndDelete(params.id);
  return new NextResponse(null, { status: 204 });
}
```

- [ ] **Step 4: Run the Playwright test again**

Run: `pnpm e2e tests/admin-products.spec.ts`
Expected: PASS with the admin create product screen visible after login

- [ ] **Step 5: Commit**

```bash
git add apps/admin tests/admin-products.spec.ts
git commit -m "feat: add admin product crud flow"
```

## Task 7: Add Cloudinary Upload Endpoint

**Files:**
- Create: `apps/admin/lib/cloudinary.ts`
- Create: `apps/admin/app/api/uploads/route.ts`
- Create: `apps/admin/lib/cloudinary.test.ts`
- Modify: `apps/admin/components/image-upload.tsx`

- [ ] **Step 1: Write the failing upload helper test**

Create `apps/admin/lib/cloudinary.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildCloudinaryFolder } from "./cloudinary";

describe("buildCloudinaryFolder", () => {
  it("uses a predictable folder name", () => {
    expect(buildCloudinaryFolder()).toBe("pet-showcase/products");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @pet-showcase/admin test`
Expected: FAIL because the Cloudinary helper does not exist yet

- [ ] **Step 3: Write the upload helper and API route**

Create `apps/admin/lib/cloudinary.ts`:

```ts
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export function buildCloudinaryFolder() {
  return "pet-showcase/products";
}

export async function uploadImage(buffer: Buffer, filename: string) {
  const dataUri = `data:image/${filename.split(".").pop()};base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: buildCloudinaryFolder(),
    public_id: filename.replace(/\.[^/.]+$/, "")
  });

  return result.secure_url;
}
```

Create `apps/admin/app/api/uploads/route.ts`:

```ts
import { NextResponse } from "next/server";
import { uploadImage } from "../../../lib/cloudinary";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Missing file" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const imageUrl = await uploadImage(buffer, file.name);

  return NextResponse.json({ imageUrl }, { status: 201 });
}
```

Modify `apps/admin/components/image-upload.tsx` to handle upload failures:

```tsx
"use client";

import { useState } from "react";

export function ImageUpload({
  value,
  onChange
}: {
  value: string;
  onChange: (nextValue: string) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(file: File | null) {
    if (!file) {
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      onChange(data.imageUrl);
    } catch {
      setError("Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept="image/*"
        onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
      />
      {isUploading ? <p className="text-sm text-stone-600">Uploading...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {value ? <img src={value} alt="Preview" className="h-40 w-full rounded-2xl object-cover" /> : null}
    </div>
  );
}
```

- [ ] **Step 4: Run the admin tests again**

Run: `pnpm --filter @pet-showcase/admin test`
Expected: PASS with the Cloudinary helper test succeeding

- [ ] **Step 5: Commit**

```bash
git add apps/admin/lib/cloudinary.ts apps/admin/app/api/uploads/route.ts apps/admin/components/image-upload.tsx
git commit -m "feat: add cloudinary image upload"
```

## Task 8: Connect Public Pages to Live Data and Add Empty/Error States

**Files:**
- Modify: `apps/web/app/page.tsx`
- Modify: `apps/web/app/products/[id]/page.tsx`
- Modify: `apps/web/components/empty-state.tsx`
- Modify: `tests/web-products.spec.ts`
- Create: `apps/web/components/loading-state.tsx`

- [ ] **Step 1: Write the failing published-only behavior test**

Update `tests/web-products.spec.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import HomePage from "../apps/web/app/page";
import * as productsModule from "../apps/web/lib/products";
import { render, screen } from "@testing-library/react";

describe("HomePage", () => {
  it("renders published products", async () => {
    vi.spyOn(productsModule, "getPublishedProducts").mockResolvedValue([
      {
        _id: "1",
        name: "Milo",
        price: 1200,
        imageUrl: "https://example.com/milo.jpg",
        description: "Friendly pet",
        status: "published",
        createdAt: "2026-05-19T00:00:00.000Z",
        updatedAt: "2026-05-19T00:00:00.000Z"
      }
    ]);

    const view = await HomePage();
    render(view);
    expect(screen.getByText("Milo")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the web test to verify it fails**

Run: `pnpm test -- --runInBand tests/web-products.spec.ts`
Expected: FAIL because the data and rendering logic have not been updated for mocked live data

- [ ] **Step 3: Improve loading and empty states**

Create `apps/web/components/loading-state.tsx`:

```tsx
export function LoadingState() {
  return (
    <section className="rounded-[28px] bg-white p-6 shadow-sm">
      <p className="text-sm text-stone-600">Loading pets...</p>
    </section>
  );
}
```

Modify `apps/web/components/empty-state.tsx`:

```tsx
export function EmptyState() {
  return (
    <section className="rounded-[28px] bg-white p-6 text-center shadow-sm">
      <h2 className="text-lg font-semibold">No pets available yet.</h2>
      <p className="mt-2 text-sm leading-6 text-stone-600">
        New showcase items will appear here once the admin publishes them.
      </p>
    </section>
  );
}
```

Modify `apps/web/app/page.tsx` to keep the list rendering logic and mobile layout unchanged:

```tsx
import { EmptyState } from "../components/empty-state";
import { ProductList } from "../components/product-list";
import { getPublishedProducts } from "../lib/products";

export default async function HomePage() {
  const products = await getPublishedProducts();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-4 py-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-bark">Pet Showcase</p>
        <h1 className="text-3xl font-bold">Find your next companion</h1>
      </header>
      {products.length === 0 ? <EmptyState /> : <ProductList products={products} />}
    </main>
  );
}
```

Modify `apps/web/app/products/[id]/page.tsx` to preserve 404 behavior for missing or draft items:

```tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedProductById } from "../../lib/products";

export default async function ProductDetailPage({
  params
}: {
  params: { id: string };
}) {
  const product = await getPublishedProductById(params.id);

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-4 py-6">
      <Link href="/" className="text-sm font-semibold text-bark">
        Back to list
      </Link>
      <div className="overflow-hidden rounded-[28px] bg-white shadow-sm">
        <div className="relative aspect-[4/5]">
          <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
        </div>
        <div className="space-y-3 p-4">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-lg font-semibold text-bark">${product.price}</p>
          <p className="text-sm leading-6 text-stone-700">{product.description}</p>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Run the web test again**

Run: `pnpm test -- --runInBand tests/web-products.spec.ts`
Expected: PASS with the mocked published product rendered on the home page

- [ ] **Step 5: Commit**

```bash
git add apps/web tests/web-products.spec.ts
git commit -m "feat: connect public pages to live product data"
```

## Task 9: Add Project-Wide Verification and Developer Experience

**Files:**
- Create: `playwright.config.ts`
- Create: `apps/admin/vitest.config.ts`
- Modify: `apps/web/vitest.config.ts`
- Create: `apps/admin/tsconfig.json`
- Create: `apps/admin/tailwind.config.ts`
- Modify: `README.md`

- [ ] **Step 1: Write the failing end-to-end workflow command expectation**

Define the expected local workflow in `README.md`:

```md
## Local development

1. Install dependencies with `pnpm install`
2. Copy `.env.example` to `.env`
3. Start both apps with `pnpm dev`
4. Run unit tests with `pnpm test`
5. Run end-to-end tests with `pnpm e2e`
```

- [ ] **Step 2: Run the verification commands to expose missing config**

Run: `pnpm test`
Expected: FAIL because the app-specific test configs and root Playwright setup are incomplete

- [ ] **Step 3: Write the remaining test and app config**

Create `playwright.config.ts`:

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: "http://localhost:3000"
  },
  webServer: [
    {
      command: "pnpm --filter @pet-showcase/web dev",
      port: 3000,
      reuseExistingServer: true
    },
    {
      command: "pnpm --filter @pet-showcase/admin dev",
      port: 3001,
      reuseExistingServer: true
    }
  ]
});
```

Create `apps/admin/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node"
  }
});
```

Modify `apps/web/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true
  }
});
```

Create `apps/admin/tsconfig.json`:

```json
{
  "extends": "../../packages/config/typescript/base.json",
  "compilerOptions": {
    "paths": {
      "@pet-showcase/shared": ["../../packages/shared/src/index.ts"],
      "@pet-showcase/ui": ["../../packages/ui/src/index.ts"]
    },
    "plugins": [{ "name": "next" }]
  },
  "include": ["app", "components", "lib", "models", ".next/types/**/*.ts", "middleware.ts"]
}
```

Create `apps/admin/tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";
import preset from "@pet-showcase/config/tailwind/preset";

const config: Config = {
  presets: [preset],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"]
};

export default config;
```

Modify `README.md`:

```md
# Pet Showcase Monorepo

Mobile-first pet showcase website with a public storefront and admin backend.

## Local development

1. Install dependencies with `pnpm install`
2. Copy `.env.example` to `.env`
3. Start both apps with `pnpm dev`
4. Run unit tests with `pnpm test`
5. Run end-to-end tests with `pnpm e2e`
```

- [ ] **Step 4: Run the full verification suite**

Run: `pnpm test`
Expected: PASS with unit and integration tests succeeding

Run: `pnpm e2e`
Expected: PASS with admin auth, admin product, and public product scenarios succeeding

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts apps/admin/vitest.config.ts apps/admin/tsconfig.json apps/admin/tailwind.config.ts apps/web/vitest.config.ts README.md
git commit -m "chore: finalize test and developer tooling"
```
