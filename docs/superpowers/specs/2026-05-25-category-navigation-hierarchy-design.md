# Category Hierarchy Navigation Spec

## Overview

This spec defines the next evolution of the storefront category system. The current site uses a single-layer category model and a flat horizontal category strip. The new design introduces a two-level navigation structure that more closely matches the reference reptile-shop pattern the user provided.

The new system must support:

- A top-level navigation row of main categories
- Optional child items under a main category
- Main categories that may still be directly browsable when they have no child items
- Admin-managed category structure without hardcoded frontend menu content

The storefront should feel closer to a specialist reptile catalog: a compact top menu with hover or tap expansion for deeper browsing, while still remaining usable on mobile.

## Goals

- Support main categories and optional child categories
- Allow products to belong to a main category, with an optional child category
- Make the top navigation behave like the reference pattern
- Keep categories fully admin-managed
- Preserve mobile usability without depending on desktop hover behavior

## Non-Goals

- Arbitrary-depth category trees
- More than two taxonomy levels
- Multiple categories per product
- Search within the menu
- Rich promotional mega-menu content
- Drag-and-drop category ordering in this pass

## Product Scope

### Public Site

The public storefront will replace the current flat category strip with a hierarchical menu:

- Main categories shown in a horizontal top row
- Child categories shown in a dropdown or expandable panel
- Main categories with no child items remain directly clickable
- Child categories filter products more narrowly than the parent

### Admin Site

The admin site will evolve from simple flat category management into hierarchical category management:

- Create main categories
- Create child categories under a selected main category
- Rename either level
- Delete categories with safeguards
- Assign products to a main category and optionally a child category

## User Rules

### Browsing Rules

- If a main category has no child categories, clicking it should directly show products in that main category.
- If a main category has child categories, the menu should expose those child categories for browsing.
- A child category is always attached to exactly one main category.
- A child category is never shown independently from its parent menu context.

### Product Classification Rules

Each product must have:

- One required main category
- One optional child category

Valid examples:

- `Geckos`
- `Geckos > Crested Gecko`
- `Equipment`

Invalid examples:

- Child category without a main category
- Product assigned to a child category from a different parent

## Recommended Data Model

This change should move from a single flat category record to a self-referencing two-level structure.

### Category

```ts
{
  _id: ObjectId,
  name: string,
  slug: string,
  parentCategoryId: ObjectId | null,
  createdAt: Date,
  updatedAt: Date
}
```

Field rules:

- `parentCategoryId = null` means the record is a main category
- `parentCategoryId` set means the record is a child category under that parent
- Only one nesting level is allowed

### Product

```ts
{
  _id: ObjectId,
  name: string,
  price: number,
  imageUrl: string,
  description: string,
  status: 'draft' | 'published',
  mainCategoryId: ObjectId,
  childCategoryId: ObjectId | null,
  createdAt: Date,
  updatedAt: Date
}
```

Field rules:

- `mainCategoryId` is required
- `childCategoryId` is optional
- If `childCategoryId` exists, it must belong to `mainCategoryId`

## Migration Rules

Existing flat categories should be migrated into main categories.

The first migration pass should:

- Keep all current category records as top-level categories
- Set `parentCategoryId` to `null`
- Update existing products so their current category becomes `mainCategoryId`
- Leave `childCategoryId` empty for existing products

This keeps the site functional immediately after migration without requiring manual backfill before deployment.

## Public Navigation Design

### Desktop

The desktop header menu should behave like a compact catalog navigation:

- Main categories shown in one horizontal row
- If a main category has children:
  - hover opens a dropdown panel
  - click on the parent may either open the dropdown again or navigate to the parent listing if a direct parent landing is still desired
- If a main category has no children:
  - click navigates directly to that main category listing

Recommended behavior:

- Hover opens the child panel on desktop
- Clicking a parent with children navigates to the parent listing
- Child items remain available in the dropdown

This gives the user both behaviors:

- direct access to the full parent bucket
- access to more specific child buckets

### Mobile

Mobile should not rely on hover. It should use a tap-first interaction:

- Main categories remain horizontally scrollable
- Tapping a parent with no children navigates immediately
- Tapping a parent with children expands a child row or child panel below the main row
- Tapping a child item filters to that child category

The mobile interaction should remain lightweight and not require a full-screen drawer in this pass.

## Filtering Behavior

### Parent Category View

When browsing a main category:

- Show all published products attached directly to that main category
- Also show products attached to child categories under that main category

This makes the parent page useful as a general bucket.

### Child Category View

When browsing a child category:

- Show only published products assigned to that child category

### Active State Rules

The menu should clearly show:

- The active main category
- The active child category when relevant
- A neutral all-products state when no category filter is selected

## Admin Experience

### Category Management

The category management page should evolve to show hierarchy clearly.

Required capabilities:

- Create main category
- Create child category under a selected main category
- Rename main or child category
- Delete category with safeguards

Recommended layout:

- Main category list
- Each main category row can show its current child categories
- Child creation can happen inline or from a small dedicated form

### Product Form

The product form should change from one category selector to two linked selectors:

- Main category: required
- Child category: optional

Behavior:

- Selecting a main category updates the child category choices
- If the selected main category has no child categories, the child selector can stay hidden or disabled
- If the main category changes, any incompatible child selection must be cleared

## Delete Safeguards

Deletion rules must prevent invalid leftovers.

### Deleting a Child Category

Choose one of these safe behaviors in implementation:

- Block deletion while products still reference the child category
- Or require reassignment first

### Deleting a Main Category

Deletion must be stricter:

- A main category cannot be deleted if products still reference it
- A main category cannot be deleted while child categories still exist beneath it unless those children are removed or reassigned first

The implementation should prefer explicit blocking over silent reassignment.

## API Changes

### Category APIs

Category APIs must now support parent-child relationships:

- `GET /api/categories`
- `POST /api/categories`
- `PATCH /api/categories/:id`
- `DELETE /api/categories/:id`

Expected category payload fields:

- `name`
- `slug`
- `parentCategoryId`

The list API should return enough structure for the frontend to render main categories together with their child items in one request.

### Product APIs

Product APIs must accept and return:

- `mainCategoryId`
- `childCategoryId`

Public product payloads should also expose resolved category context so the frontend can render:

- main category name
- child category name if present

## Frontend Data Shape

The public navigation is easiest to render if the frontend receives a nested structure like:

```ts
[
  {
    _id: "...",
    name: "Geckos",
    slug: "geckos",
    children: [
      { _id: "...", name: "Crested Gecko", slug: "crested-gecko" },
      { _id: "...", name: "Leachianus", slug: "leachianus" }
    ]
  },
  {
    _id: "...",
    name: "Equipment",
    slug: "equipment",
    children: []
  }
]
```

This shape should be produced at the API or server data layer rather than assembled repeatedly inside presentation components.

## Error Handling

### Public Site

- Invalid parent slug should fall back to a safe empty or not-found state
- Invalid child slug should not break the menu
- If a parent has no children, the UI should not render an empty dropdown shell

### Admin Site

- Creating a child category without a valid parent should fail clearly
- Saving a product with a mismatched parent and child should fail validation
- Deleting categories with dependencies should show an actionable message

## Testing Strategy

### Data Tests

- Parent category validation
- Child category validation
- Only one nesting level allowed
- Product validation for parent-child consistency

### Admin Flow Tests

- Create main category
- Create child category under a parent
- Rename either level
- Block invalid deletes
- Create product with only a main category
- Create product with main plus child category

### Public Flow Tests

- Parent with no children navigates directly
- Parent with children exposes child menu
- Parent listing shows both direct and child-assigned products
- Child listing shows only matching child products
- Mobile expansion behavior works without hover

## Implementation Boundaries

This change should include:

- Two-level category data model
- Product support for parent plus optional child category
- Frontend desktop dropdown menu
- Frontend mobile expandable child navigation
- Admin UI for managing main and child categories
- Validation and delete safeguards

This change should not include:

- Three or more levels
- Search input in the header menu
- Marketing tiles inside dropdowns
- Category images
- Manual menu ordering UI

## Success Criteria

This feature is successful if:

- Admin can create both main categories and child categories
- Products can belong to a main category with or without a child category
- Main categories without child items work as directly clickable menu items
- Main categories with child items expose deeper browsing options
- Mobile and desktop interactions both feel natural
- The storefront menu more closely resembles the specialist catalog pattern from the reference
