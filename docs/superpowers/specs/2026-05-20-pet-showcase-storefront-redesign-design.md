# Pet Showcase Storefront Redesign Spec

## Overview

This spec defines the next design iteration of the pet showcase website. The current site already supports a monorepo setup, admin product management, MongoDB storage, Cloudinary image upload, and a public product listing flow. This redesign adds a real category system and reshapes the public storefront to more closely match the reference style provided by the user.

The new storefront should feel closer to a specialist reptile shop catalog rather than a soft lifestyle showcase. On desktop, the visual language should strongly echo the reference site: dark surfaces, compact merchandising, prominent category framing, and a more utilitarian shop mood. On mobile, the layout should not be a direct copy. Instead, it should preserve the same mood while using a two-column masonry-style browsing experience optimized for narrow screens.

## Goals

- Add real admin-managed categories
- Allow each product to belong to exactly one category
- Let admins create, rename, and delete categories over time
- Use categories to drive public navigation and filtering
- Redesign the public storefront to match the reference site's shop-like tone
- Keep desktop visually close to the reference
- Make mobile the primary interaction target with a two-column masonry product list

## Non-Goals

- Multi-level taxonomy
- Multiple categories per product
- Tags
- Search
- Sorting controls
- Shopping cart or checkout
- Inventory tracking
- Category images or icons in the first pass

## Product Scope

### Public Site

The public site remains centered on:

- Product list page
- Product detail page

However, the list page becomes a richer storefront experience. It should include:

- A dark, commerce-oriented header
- An announcement bar
- Category navigation driven by real category records
- Product filtering by category
- Desktop layout that resembles the reference site's catalog feel
- Mobile layout with a two-column masonry-style product grid

The detail page should inherit the darker storefront mood and category context instead of feeling like a separate minimalist page.

### Admin Site

The admin site retains product management and adds category management:

- Login page
- Product list page
- Create product page
- Edit product page
- Delete product action
- Category list page
- Create category flow
- Rename category flow
- Delete category action

Product create and edit forms must include a category selector. Each product can select exactly one category.

## Primary Users

### Public User

A visitor browses gecko products by category, scans visually dense product cards, and opens a detail page for a specific listing.

### Admin User

A single trusted administrator manages both products and categories. The admin can add new categories when new breeds need to be listed, rename category labels later, and assign one category to each product.

## Design Direction

### Reference Interpretation

The reference storefront communicates four important traits:

- Dark and earthy visual palette
- Specialist shop identity rather than generic lifestyle branding
- Strong category framing
- Dense catalog presentation with straightforward product information

The redesign should imitate that feel closely, but not copy the layout blindly. The adaptation rules are:

- Desktop can stay visually close to the reference
- Mobile must prioritize readability and thumb-friendly scanning
- Product photography remains the hero, but the surrounding chrome should feel more like a niche breeder storefront

### Visual Principles

- Use a dark header and dark sectional surfaces
- Use lighter body panels only where they improve readability
- Favor compact product cards over oversized editorial blocks
- Keep typography straightforward and merchandise-oriented
- Preserve a slightly premium reptile-shop mood without drifting into luxury fashion styling

## Category Model

Categories are a first-class content type, not a hardcoded list.

Each category represents one breed grouping such as:

- Crested Gecko
- Leachianus
- Chahoua

The system must support future category growth without code changes. The admin can:

- Add a new category
- Rename an existing category
- Delete a category

Each product belongs to one and only one category.

## Data Model Changes

### Category

```ts
{
  _id: ObjectId,
  name: string,
  slug: string,
  createdAt: Date,
  updatedAt: Date
}
```

Field notes:

- `name`: required, human-readable category name
- `slug`: required, stable URL/filter value derived from name
- `createdAt` and `updatedAt`: required for admin management and deterministic ordering

### Product

The existing product model should gain a required category reference.

```ts
{
  _id: ObjectId,
  name: string,
  price: number,
  imageUrl: string,
  description: string,
  status: 'draft' | 'published',
  categoryId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

Field notes:

- `categoryId`: required, points to exactly one category

The public product payload should resolve category information so the frontend can render category labels without additional per-card lookups.

## Category Lifecycle Rules

- Categories can be created at any time
- Categories can be renamed later without rewriting product content
- A deleted category should not silently leave broken products behind

For deletion behavior, the implementation should choose one concrete safeguard:

- Either block deletion when products still reference the category
- Or require reassignment before deletion completes

The plan should choose the simpler user experience, but the system must avoid orphaned product records.

## Public Experience

### Header and Announcement Bar

The public storefront should introduce a stronger store identity at the top of the page. It should include:

- A dark header area
- A compact announcement bar
- Clear store naming or category context

The announcement bar does not need to be CMS-driven in this pass. It can be static content, but it should visually establish the same catalog mood as the reference.

### Category Navigation

Category navigation should be driven by the real category collection and appear prominently near the top of the list page. On desktop it may read as a horizontal catalog navigation. On mobile it should remain compact and easy to swipe or tap.

Behavior:

- Show all categories that are valid for browsing
- Allow users to filter the list page by category
- Provide a clear "all products" state
- Keep the active category visually obvious

### Product List Page

#### Desktop

Desktop should visually echo the reference storefront as closely as practical within the current product scope:

- Darker chrome
- Strong category framing
- Denser merchandise layout
- Straightforward product card presentation

The page should feel like a real breeder catalog rather than a soft showcase grid.

#### Mobile

Mobile is the primary layout target. It should not simply shrink the desktop layout. Instead it should become:

- Two-column product browsing
- Masonry-style rhythm or staggered card heights
- Strong image-led scanning
- Minimal card text: category, name, price

This is the most important adaptation rule in the redesign.

### Product Cards

Cards should feel closer to specialist commerce listings than soft editorial tiles.

Required content:

- Product image
- Product name
- Product price
- Product category label

Behavior:

- Entire card is tappable
- Image remains primary
- Text hierarchy is compact and easy to scan
- Card layout should tolerate slightly different content lengths without breaking the masonry rhythm

### Product Detail Page

The detail page should inherit the storefront's darker brand direction and category-aware structure.

Required content:

- Product image
- Product name
- Product price
- Category label
- Description
- Back navigation

The page should feel connected to the category browsing experience, not like a generic detail card floating on a blank page.

## Admin Experience

### Category Management

The admin needs a category management area with:

- Category list
- New category action
- Rename category action
- Delete category action

This can be implemented as a dedicated page or a lightweight management section within admin navigation, but it must be easy to maintain over time.

### Product Forms

Product create and edit forms must gain:

- A required category selector

Behavior:

- The selector pulls from existing categories
- A product cannot be saved without a category
- The current category is visible in the product list for quick scanning

## API Changes

### Category APIs

The system needs APIs for:

- `GET /api/categories`
- `POST /api/categories`
- `PATCH /api/categories/:id`
- `DELETE /api/categories/:id`

These routes must be admin-safe where mutation is involved.

### Product APIs

Existing product create and update routes must accept category assignment. Existing product read flows must return category data or enough information for the public storefront to render category labels and filters.

Public browsing logic must support:

- All published products
- Published products filtered by category

## Data Flow

### Public Site

1. Public list page loads category navigation and published products
2. User lands on the default "all" view or a selected category view
3. Frontend renders products with category labels
4. User switches categories to refine the list
5. User opens a product detail page
6. Detail view shows category context alongside the product

### Admin Site

1. Admin logs in
2. Admin manages categories as needed
3. Admin creates or edits a product
4. Admin assigns one category
5. Backend validates the category reference
6. Product is saved and appears under that category on the public site once published

## Error Handling

### Public Site

- If no categories exist, the storefront should still render a stable all-products view
- If the selected category has no published products, show an empty filtered state
- If a category slug is invalid, fall back clearly to not found or a safe empty state

### Admin Site

- If category creation fails, show a clear inline failure state
- If a product is submitted without a category, block save and show validation
- If category deletion would create orphaned products, guide the admin to resolve it

## Testing Strategy

The redesign should add coverage for the new category-driven behavior.

### Data and Validation

- Category schema validation
- Product schema validation for required category assignment
- Slug generation behavior where applicable

### Admin Flows

- Create category
- Rename category
- Delete category with safeguard behavior
- Create product with category
- Edit product and change category

### Public Flows

- Product list renders category navigation
- Filtering by category returns the correct published set
- Product detail shows category information
- Mobile list layout remains usable with uneven content heights

## Implementation Boundaries

This redesign should include:

- Real category content model
- Admin category management
- Product single-category assignment
- Public category navigation and filtering
- Desktop storefront restyling to match the reference closely
- Mobile two-column masonry storefront adaptation
- Detail page restyling to match the new storefront language

This redesign should not include:

- Multi-select categories
- Nested category trees
- Search
- Sorting UI
- Customer-facing cart behavior
- Rich CMS editing for the announcement bar

## Success Criteria

This redesign is successful if:

- Admin can create, rename, and delete categories
- Admin can assign exactly one category to each product
- Published products can be browsed by category on the public site
- Desktop storefront clearly resembles the reference site's catalog mood
- Mobile storefront presents products in a two-column masonry-style layout
- Product detail pages feel visually consistent with the new storefront
- The category system remains flexible enough for future breed additions without code changes
