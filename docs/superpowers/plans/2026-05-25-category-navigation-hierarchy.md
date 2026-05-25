# Category Hierarchy Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat storefront category strip with a two-level main-category and child-category navigation system, and add matching admin management plus product assignment support.

**Architecture:** Extend the existing single `Category` model into a two-level self-referencing hierarchy, migrate products to `mainCategoryId` plus optional `childCategoryId`, and expose nested category payloads from the server layer. Update the admin to manage parent and child categories, then replace the storefront category strip with a desktop dropdown and mobile expandable child navigation that respects the “parent without children is directly clickable” rule.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Mongoose, MongoDB, shared Zod schemas, existing admin/web monorepo packages

---

## File Map

### Shared

- Modify: `C:\Users\Zeyan\Desktop\test\packages\shared\src\category.ts`
  - add `parentCategoryId`, child-aware input types, and nested category output type
- Modify: `C:\Users\Zeyan\Desktop\test\packages\shared\src\product.ts`
  - replace `categoryId` with `mainCategoryId` and optional `childCategoryId`

### Admin data/model layer

- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\models\category.ts`
  - add `parentCategoryId`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\models\product.ts`
  - add `mainCategoryId` and `childCategoryId`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\lib\categories.ts`
  - hierarchical queries, validation, delete safeguards
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\lib\products.ts`
  - validate main/child linkage and populate category context
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\app\api\categories\route.ts`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\app\api\categories\[id]\route.ts`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\app\api\products\route.ts`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\app\api\products\[id]\route.ts`

### Admin UI

- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\components\category-form.tsx`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\components\category-table.tsx`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\components\product-form.tsx`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\app\categories\page.tsx`

### Web data + navigation

- Modify: `C:\Users\Zeyan\Desktop\test\apps\web\lib\categories.ts`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\web\lib\products.ts`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\web\app\page.tsx`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\web\components\category-nav.tsx`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\web\components\storefront-shell.tsx`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\web\app\globals.css`

### Verification

- Modify: `C:\Users\Zeyan\Desktop\test\apps\web\app\page.test.tsx`
- Add if needed: `C:\Users\Zeyan\Desktop\test\apps\admin\lib\categories.test.ts`

---

### Task 1: Extend shared types for hierarchical categories

**Files:**
- Modify: `C:\Users\Zeyan\Desktop\test\packages\shared\src\category.ts`
- Modify: `C:\Users\Zeyan\Desktop\test\packages\shared\src\product.ts`

- [ ] Add `parentCategoryId` to `CategoryRecord`, define nested output type, and add `mainCategoryId` / `childCategoryId` to product types.
- [ ] Ensure shared schemas enforce required main category and optional child category.
- [ ] Verify imports still compile in admin and web packages.
- [ ] Commit.

### Task 2: Update admin Mongoose models and category service

**Files:**
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\models\category.ts`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\models\product.ts`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\lib\categories.ts`

- [ ] Add `parentCategoryId` to the category schema and `mainCategoryId` / `childCategoryId` to the product schema.
- [ ] Update category serialization to expose hierarchy cleanly.
- [ ] Add server-side validation rules:
  - child categories must reference a valid parent
  - only one nesting level allowed
  - parent deletion blocked when children or linked products exist
  - child deletion blocked when linked products exist
- [ ] Add migration-safe list helpers that can return both flat and nested views.
- [ ] Commit.

### Task 3: Update product data service and API validation

**Files:**
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\lib\products.ts`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\app\api\products\route.ts`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\app\api\products\[id]\route.ts`

- [ ] Replace old single-category validation with main/child validation.
- [ ] Ensure a child category, when present, belongs to the selected main category.
- [ ] Return resolved category context needed by the storefront:
  - main category
  - child category if present
- [ ] Keep existing published filtering behavior intact.
- [ ] Commit.

### Task 4: Upgrade category APIs for hierarchy

**Files:**
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\app\api\categories\route.ts`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\app\api\categories\[id]\route.ts`

- [ ] Accept `parentCategoryId` in create and update requests.
- [ ] Return structured validation errors for invalid parent or delete conflicts.
- [ ] Keep list response compatible with storefront nested navigation rendering.
- [ ] Commit.

### Task 5: Rebuild admin category management for main + child categories

**Files:**
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\components\category-form.tsx`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\components\category-table.tsx`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\app\categories\page.tsx`

- [ ] Add UI to create a main category.
- [ ] Add UI to create a child category under a selected parent.
- [ ] Render categories in a grouped hierarchy so child items clearly sit under parents.
- [ ] Preserve rename and delete flows for both levels, with clearer labels for parent vs child.
- [ ] Commit.

### Task 6: Update admin product form for linked selectors

**Files:**
- Modify: `C:\Users\Zeyan\Desktop\test\apps\admin\components\product-form.tsx`

- [ ] Replace the single category select with:
  - required main category select
  - optional child category select
- [ ] Hide or disable the child select when the chosen main category has no children.
- [ ] Clear invalid child selection when the main category changes.
- [ ] Ensure edit mode preloads existing parent/child values correctly.
- [ ] Commit.

### Task 7: Update web category/product data layer for nested navigation

**Files:**
- Modify: `C:\Users\Zeyan\Desktop\test\apps\web\lib\categories.ts`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\web\lib\products.ts`

- [ ] Fetch nested categories for navigation.
- [ ] Support two browse modes:
  - parent category listing returns parent-direct plus child-assigned products
  - child category listing returns only matching child products
- [ ] Return enough metadata for active menu state and browse title logic.
- [ ] Commit.

### Task 8: Replace the storefront flat strip with hierarchical navigation

**Files:**
- Modify: `C:\Users\Zeyan\Desktop\test\apps\web\components\category-nav.tsx`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\web\components\storefront-shell.tsx`
- Modify: `C:\Users\Zeyan\Desktop\test\apps\web\app\globals.css`

- [ ] Build desktop main-category row with dropdown child panel behavior.
- [ ] Make parents without children directly clickable.
- [ ] Make parents with children show child options while still allowing parent browsing.
- [ ] Build mobile tap-to-expand child navigation that keeps horizontal parent scrolling.
- [ ] Keep the current full-screen loading overlay behavior consistent with category switching.
- [ ] Commit.

### Task 9: Update storefront page logic and copy for parent/child browsing

**Files:**
- Modify: `C:\Users\Zeyan\Desktop\test\apps\web\app\page.tsx`

- [ ] Update active-state resolution to understand parent and child category routes.
- [ ] Update browse title and description to reflect parent vs child views.
- [ ] Keep all-products fallback behavior stable.
- [ ] Ensure empty states remain correct for parent buckets and child buckets.
- [ ] Commit.

### Task 10: Add regression coverage and manual verification

**Files:**
- Modify: `C:\Users\Zeyan\Desktop\test\apps\web\app\page.test.tsx`
- Add if needed: `C:\Users\Zeyan\Desktop\test\apps\admin\lib\categories.test.ts`

- [ ] Cover parent-without-children navigation behavior.
- [ ] Cover parent-with-children filtering logic.
- [ ] Cover invalid parent/child product assignments.
- [ ] Run targeted local verification for:
  - admin category creation
  - admin child-category creation
  - product assignment with and without child category
  - storefront desktop dropdown
  - storefront mobile expand/collapse
- [ ] Commit.

## Self-Review

### Spec coverage

- Data model changes are covered in Tasks 1-3.
- Admin category creation and hierarchy management are covered in Tasks 4-6.
- Storefront hierarchical navigation is covered in Tasks 7-9.
- Validation and testing are covered in Task 10.

### Placeholder scan

- No `TODO`, `TBD`, or “similar to previous step” placeholders remain.
- Every task names the concrete files it touches.

### Type consistency

- Shared types define `parentCategoryId`, `mainCategoryId`, and `childCategoryId`.
- Admin and web tasks both refer to the same property names.
