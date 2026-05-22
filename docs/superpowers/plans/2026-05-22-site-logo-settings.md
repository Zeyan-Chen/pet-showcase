# Site Logo Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a single global storefront logo setting with admin upload/replace support, use a transparent `Rookie Gecko` logo on the storefront, and update logo RWD so it is centered on mobile and upper-left on desktop.

**Architecture:** Add a single-record `SiteSettings` model in the admin app, expose admin-only read/update APIs, and reuse the existing Cloudinary upload flow for logo files. The storefront shell will fetch site settings server-side and render a configured logo when present, while preserving a placeholder fallback and applying responsive layout changes in the header.

**Tech Stack:** Next.js App Router, React 19, Mongoose, Cloudinary, shared TypeScript types, local image asset preparation

---

### Task 1: Prepare the transparent logo asset

**Files:**
- Create: `C:\Users\Zeyan\Desktop\test\public\branding\rookie-gecko-logo.png`
- Modify: `C:\Users\Zeyan\Desktop\test\docs\superpowers\specs\2026-05-22-site-logo-settings-design.md`

- [ ] **Step 1: Create the transparent logo image**

Use the provided source image:

`C:\Users\Zeyan\Desktop\468083287_17899023624091361_9118935610402346613_n.jpg`

Output target:

`C:\Users\Zeyan\Desktop\test\public\branding\rookie-gecko-logo.png`

Requirements:
- remove the purple background
- preserve the full artwork including `Rookie Gecko` text
- export to transparent PNG

- [ ] **Step 2: Verify the asset visually**

Check that:
- there is no visible purple background
- edges remain clean around the gecko drawing and text
- the image still reads clearly at header size

- [ ] **Step 3: Commit**

```bash
git add public/branding/rookie-gecko-logo.png
git commit -m "feat: add transparent rookie gecko logo asset"
```

### Task 2: Add shared site settings types

**Files:**
- Create: `C:\Users\Zeyan\Desktop\test\packages\shared\src\site-settings.ts`
- Modify: `C:\Users\Zeyan\Desktop\test\packages\shared\src\index.ts`
- Test: `C:\Users\Zeyan\Desktop\test\packages\shared\src\site-settings.ts`

- [ ] **Step 1: Add the shared site settings schema and types**

```ts
import { z } from "zod";

export const siteSettingsInputSchema = z.object({
  logoImageUrl: z.string().url(),
  logoPublicId: z.string().min(1),
  logoAlt: z.string().trim().min(1).max(120)
});

export type SiteSettingsInput = z.infer<typeof siteSettingsInputSchema>;

export type SiteSettingsRecord = SiteSettingsInput & {
  _id: string;
  updatedAt: string;
};
```

- [ ] **Step 2: Export the new types from the shared index**

```ts
export * from "./site-settings";
```

- [ ] **Step 3: Run TypeScript-aware validation**

Run: `pnpm --filter @pet-showcase/shared lint`

Expected: no missing export or type errors

- [ ] **Step 4: Commit**

```bash
git add packages/shared/src/site-settings.ts packages/shared/src/index.ts
git commit -m "feat: add shared site settings types"
```

### Task 3: Add admin data model and data access for site settings

**Files:**
- Create: `C:\Users\Zeyan\Desktop\test\apps\admin\models\site-settings.ts`
- Create: `C:\Users\Zeyan\Desktop\test\apps\admin\lib\site-settings.ts`
- Test: `C:\Users\Zeyan\Desktop\test\apps\admin\lib\site-settings.test.ts`

- [ ] **Step 1: Write the failing tests for serialization and single-record behavior**

```ts
import { describe, expect, it } from "vitest";
import { serializeSiteSettings } from "./site-settings";

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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @pet-showcase/admin test -- site-settings`

Expected: FAIL because the module does not exist yet

- [ ] **Step 3: Add the Mongoose model**

```ts
import { Schema, model, models } from "mongoose";

const siteSettingsSchema = new Schema(
  {
    logoAlt: { type: String, required: true, trim: true },
    logoImageUrl: { type: String, required: true },
    logoPublicId: { type: String, required: true }
  },
  {
    timestamps: { createdAt: false, updatedAt: true }
  }
);

export const SiteSettingsModel =
  models.SiteSettings ?? model("SiteSettings", siteSettingsSchema);
```

- [ ] **Step 4: Add the site settings data helpers**

```ts
import type { SiteSettingsInput, SiteSettingsRecord } from "@pet-showcase/shared";
import { connectToDatabase } from "./mongodb";
import { SiteSettingsModel } from "../models/site-settings";

type RawSiteSettings = {
  _id: { toString(): string } | string;
  logoAlt: string;
  logoImageUrl: string;
  logoPublicId: string;
  updatedAt: Date;
};

export function serializeSiteSettings(settings: RawSiteSettings): SiteSettingsRecord {
  return {
    _id: settings._id.toString(),
    logoAlt: settings.logoAlt,
    logoImageUrl: settings.logoImageUrl,
    logoPublicId: settings.logoPublicId,
    updatedAt: settings.updatedAt.toISOString()
  };
}

export async function getSiteSettings() {
  await connectToDatabase();
  const settings = await SiteSettingsModel.findOne().sort({ updatedAt: -1 }).lean<RawSiteSettings | null>();
  return settings ? serializeSiteSettings(settings) : null;
}

export async function upsertSiteSettings(input: SiteSettingsInput) {
  await connectToDatabase();
  const settings = await SiteSettingsModel.findOneAndUpdate({}, input, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true
  }).lean<RawSiteSettings | null>();

  if (!settings) {
    throw new Error("SITE_SETTINGS_UPSERT_FAILED");
  }

  return serializeSiteSettings(settings);
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm --filter @pet-showcase/admin test -- site-settings`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/admin/models/site-settings.ts apps/admin/lib/site-settings.ts apps/admin/lib/site-settings.test.ts
git commit -m "feat: add site settings data model"
```

### Task 4: Add admin API and settings page

**Files:**
- Create: `C:\Users\Zeyan\Desktop\test\apps\admin\app\api\settings\route.ts`
- Create: `C:\Users\Zeyan\Desktop\test\apps\admin\app\settings\page.tsx`
- Create: `C:\Users\Zeyan\Desktop\test\apps\admin\components\site-settings-form.tsx`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\components\admin-nav.tsx`

- [ ] **Step 1: Add the admin API route**

```ts
import { NextResponse } from "next/server";
import { siteSettingsInputSchema } from "@pet-showcase/shared";
import { getSiteSettings, upsertSiteSettings } from "../../../lib/site-settings";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const payload = await request.json();
  const input = siteSettingsInputSchema.parse(payload);
  const settings = await upsertSiteSettings(input);
  return NextResponse.json(settings);
}
```

- [ ] **Step 2: Add the admin settings form**

The form should:
- show current logo preview when present
- allow selecting a file
- upload through the existing upload endpoint
- submit `logoImageUrl`, `logoPublicId`, `logoAlt` to `/api/settings`

Use the existing admin form visual language:

```tsx
<section className="rounded-[1.75rem] border border-[#dfd5c7] bg-white px-5 py-6 shadow-[0_18px_44px_rgba(37,28,20,0.08)]">
```

- [ ] **Step 3: Add the `站台設定` page**

Load current settings server-side and render:

```tsx
import { getSiteSettings } from "../../lib/site-settings";
import { SiteSettingsForm } from "../../components/site-settings-form";

export default async function SettingsPage() {
  const settings = await getSiteSettings();
  return <SiteSettingsForm initialValue={settings ?? undefined} />;
}
```

- [ ] **Step 4: Add the new admin navigation item**

Add a `站台設定` link in the admin nav next to:
- 商品
- 分類
- 公告

- [ ] **Step 5: Run a local smoke test**

Run:
- `pnpm --filter @pet-showcase/admin build`

Expected:
- build succeeds
- `/settings` route is generated without import or type errors

- [ ] **Step 6: Commit**

```bash
git add apps/admin/app/api/settings/route.ts apps/admin/app/settings/page.tsx apps/admin/components/site-settings-form.tsx apps/admin/components/admin-nav.tsx
git commit -m "feat: add admin site logo settings"
```

### Task 5: Apply logo settings on the storefront

**Files:**
- Create: `C:\Users\Zeyan\Desktop\test\apps\web\lib\site-settings.ts`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\web\components\storefront-shell.tsx`

- [ ] **Step 1: Add storefront settings loader**

```ts
import type { SiteSettingsRecord } from "@pet-showcase/shared";

const ADMIN_API_BASE_URL =
  process.env.ADMIN_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://pet-showcase-admin.vercel.app";

export async function getSiteSettings(): Promise<SiteSettingsRecord | null> {
  const response = await fetch(`${ADMIN_API_BASE_URL}/api/settings`, {
    next: { revalidate: 30 }
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as SiteSettingsRecord | null;
}
```

- [ ] **Step 2: Replace the placeholder logo block in the storefront shell**

Render:
- uploaded image when settings exist
- placeholder block when settings do not exist

Use `next/image` with constrained sizing so it does not break the header.

- [ ] **Step 3: Keep the placeholder fallback**

Fallback should remain close to the current block:

```tsx
<div className="flex h-16 w-32 items-center justify-center rounded-[1.25rem] border border-[#d8cdbf] bg-[#fffdfa] text-center text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#7f766e] shadow-[0_16px_24px_rgba(16,38,63,0.07)] sm:h-20 sm:w-40">
  Logo
</div>
```

- [ ] **Step 4: Run a storefront build**

Run:
- `pnpm --filter @pet-showcase/web build`

Expected:
- build succeeds
- storefront can fetch settings without runtime import issues

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/site-settings.ts apps/web/components/storefront-shell.tsx
git commit -m "feat: render storefront logo from site settings"
```

### Task 6: Update logo RWD behavior

**Files:**
- Modify: `C:\Users\Zeyan\Desktop\test\apps\web\components\storefront-shell.tsx`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\web\app\globals.css`

- [ ] **Step 1: Center the logo on mobile**

Update the header layout so mobile uses a centered logo block above the category strip.

- [ ] **Step 2: Align the logo upper-left on desktop**

At desktop breakpoints:
- keep the logo flush to the left within the content container
- preserve the current category row below it

- [ ] **Step 3: Ensure the logo scales cleanly**

Rules:
- mobile should allow the full `Rookie Gecko` text to remain legible
- desktop should not stretch the logo disproportionately
- use `object-contain`

- [ ] **Step 4: Verify responsive behavior**

Check:
- local mobile-sized viewport
- local desktop-sized viewport
- no overlap with category strip

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/storefront-shell.tsx apps/web/app/globals.css
git commit -m "feat: adjust storefront logo responsive layout"
```

### Task 7: Upload the prepared logo and verify end-to-end

**Files:**
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\.env.local` (only if environment correction is needed)
- Use: `C:\Users\Zeyan\Desktop\test\public\branding\rookie-gecko-logo.png`

- [ ] **Step 1: Start local admin and storefront**

Run:
- `pnpm --filter @pet-showcase/admin dev`
- `pnpm --filter @pet-showcase/web dev`

Expected:
- admin on `http://127.0.0.1:3001`
- storefront on `http://127.0.0.1:3000`

- [ ] **Step 2: Upload the prepared logo from admin settings**

Use the new admin page:
- `http://127.0.0.1:3001/settings`

Expected:
- upload succeeds
- preview updates
- settings are saved

- [ ] **Step 3: Verify storefront locally**

Check:
- mobile: centered logo
- desktop: left-aligned logo
- correct transparent background rendering

- [ ] **Step 4: Deploy and verify production**

Run:
- `git push origin main`

Then verify:
- `https://pet-showcase-admin.vercel.app/settings`
- `https://pet-showcase-web.vercel.app`

- [ ] **Step 5: Commit final polish if needed**

```bash
git add .
git commit -m "feat: add storefront logo settings flow"
```
