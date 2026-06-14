# AGENT.md

這是給未來 agent 快速複習專案用的備忘文件。開始改動前請先讀這份。

## 專案概覽

Pet Showcase 是一個 pnpm/Turbo monorepo，目標是建立 mobile-first 的寵物展示商店，以及對應的 admin 後台。

- 公開 storefront：`apps/web`
- Admin backend/UI：`apps/admin`
- 共用 schema 與型別：`packages/shared`
- 共用 UI primitives：`packages/ui`
- 共用 TypeScript、ESLint、Tailwind 設定：`packages/config`
- End-to-end tests：`tests`
- 產品與規格規劃筆記：`docs/superpowers`

這個 codebase 以 TypeScript 為主，兩個 app 都使用 Next.js 15、React 19，樣式使用 Tailwind CSS。

## 常用指令

請從 repo 根目錄執行 pnpm。

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm test
pnpm e2e
```

針對單一 app 的常用指令：

```bash
pnpm --filter @pet-showcase/web dev
pnpm --filter @pet-showcase/admin dev
pnpm --filter @pet-showcase/web test
pnpm --filter @pet-showcase/admin test
```

Port：

- Storefront：`http://localhost:3000`
- Admin：`http://localhost:3001`

Playwright 會透過 `playwright.config.ts` 啟動或重用這兩個 dev server。

## 環境變數

README 提到要把 `.env.example` 複製成 `.env`，但目前 repo 裡沒有 `.env.example`。不要直接假設 env 預設值，先確認部署或本機設定。

Server env 驗證在 `packages/shared/src/env.ts`。

Backend 必要變數：

- `MONGODB_URI`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`，至少 16 個字元
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Storefront 的 API base URL 邏輯在 `apps/web/lib/api.ts`。

- 優先使用 `ADMIN_API_BASE_URL`
- 第二順位是 `NEXT_PUBLIC_API_BASE_URL`
- Production fallback：`https://pet-showcase-admin.vercel.app`
- Local fallback：`http://127.0.0.1:3001`

## Vercel 部署線索

程式碼有明顯針對 Vercel 部署做處理，但 repo 本身不能證明目前 Vercel 專案是否仍存在、最新部署是否成功。

已知線索：

- `apps/web/lib/api.ts` 內有 admin API production fallback：`https://pet-showcase-admin.vercel.app`
- `apps/web/lib/api.ts` 會讀取 Vercel runtime env：`VERCEL_URL`、`VERCEL_PROJECT_PRODUCTION_URL`、`VERCEL_ENV`
- 目前 repo 沒有 `vercel.json` 或 `.vercel` 設定檔
- `.gitignore` 忽略 `.env`、`.env.local`、`.env.*`，部署 env 很可能只存在 Vercel dashboard 或本機未提交檔案

處理部署相關問題時，請把這些視為線索；若需要確認實際部署狀態，要查 Vercel dashboard、Vercel CLI，或由使用者提供目前的 production URL / project 設定。

## 資料模型

共用 Zod schemas 和公開 record types 是資料結構的主要來源：

- Products：`packages/shared/src/product.ts`
- Categories：`packages/shared/src/category.ts`
- Announcements：`packages/shared/src/announcement.ts`
- Site settings：`packages/shared/src/site-settings.ts`

目前 Product 主要欄位：

- `name`、`price`、`imageUrl`、可選的 `imageUrls`
- `description`
- `status`：`draft` 或 `published`
- `isSoldOut`
- `mainCategoryId`
- 可選且可為 null 的 `childCategoryId`

目前 Category 主要欄位：

- `name`
- 可選且可為 null 的 `parentCategoryId`
- `includeInAllListing`
- 自動產生的 `slug`

Admin 端 Mongo/Mongoose models 放在 `apps/admin/models`。

## App 分工

`apps/admin` 負責 persistence、authentication、uploads，以及 admin CRUD APIs。

重要 admin 區域：

- Auth/session：`apps/admin/lib/auth.ts`
- Mongo connection：`apps/admin/lib/db.ts`
- Cloudinary integration：`apps/admin/lib/cloudinary.ts`
- Product/category/announcement/site settings 邏輯：`apps/admin/lib`
- Admin API routes：`apps/admin/app/api`
- Admin screens 和 forms：`apps/admin/app`、`apps/admin/components`

`apps/web` 負責呼叫 admin APIs，並渲染公開 storefront。

重要 storefront 區域：

- Admin API client/fallbacks：`apps/web/lib/api.ts`
- Product/category/announcement fetchers：`apps/web/lib`
- Home page：`apps/web/app/page.tsx`
- Product detail page：`apps/web/app/products/[id]/page.tsx`
- Storefront components：`apps/web/components`

## 測試重點

Unit/component tests 通常放在被測程式碼附近，使用 Vitest。

例子：

- Shared schema tests：`packages/shared/src/*.test.ts`
- Storefront component tests：`apps/web/components/*.test.tsx`
- Storefront lib tests：`apps/web/lib/*.test.ts`
- Admin lib tests：`apps/admin/lib/*.test.ts`

End-to-end tests 放在 `tests`，使用 Playwright：

- `tests/web-products.spec.ts`
- `tests/admin-auth.e2e.ts`
- `tests/admin-products.e2e.ts`

如果改到使用者流程，優先跑相關 app test；若變更跨過 web/admin 行為，建議再跑 `pnpm e2e`。

## 開發慣例

- 優先使用 `packages/shared` 既有 schemas，不要重複寫 validation。
- 如果型別會被兩個 app 共用，放在 `packages/shared`。
- Persistence 和帶有 secret 的邏輯留在 `apps/admin`。
- 公開 storefront 不應直接接觸 admin credentials 或 database。
- 適合時重用 `packages/ui` 的 UI primitives。
- 新增抽象前，先沿用現有 Tailwind 和 component patterns。
- 避免無關 refactor；這個 repo 的 feature slices 邊界算清楚。

## 新任務建議先讀

新任務開始時，先看最小相關範圍：

- Storefront 顯示問題：`apps/web/app/page.tsx`、`apps/web/components`，再看 `apps/web/lib`
- Product detail/gallery 問題：`apps/web/app/products/[id]/page.tsx`、`apps/web/components/product-gallery-carousel.tsx`
- Admin CRUD 問題：對應的 `apps/admin/app/api/*` route、`apps/admin/lib/*`，再看 form/table component
- Data validation 問題：`packages/shared/src` 裡對應的 schema
- Styling system 問題：`apps/*/app/globals.css`、`packages/config/tailwind/preset.ts`、`packages/ui/src`
- E2E 行為：`playwright.config.ts` 和 `tests`

## 已知注意事項

- Root README 提到 `.env.example`，但目前檔案不存在。
- App scripts 裡有 `next lint`；如果 Next.js lint 行為改變，要確認相容性。
- Storefront data fetching 會依序 fallback 到多個 admin API URL，所以本機錯誤可能被 deployed fallback 掩蓋；需要明確設定 env 才好查。
- Admin auth 使用 cookie/HMAC；更換 `ADMIN_SESSION_SECRET` 會讓既有 sessions 失效。
