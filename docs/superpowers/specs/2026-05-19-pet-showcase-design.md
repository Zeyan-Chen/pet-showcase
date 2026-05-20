# Pet Showcase Website Design Spec

## Overview

This project is a mobile-first pet showcase website built with a monorepo architecture. The first release focuses on a simple but production-oriented flow: an admin uploads pet showcase items with an image, name, price, and description, and the public site displays those items in a clean mobile-friendly browsing experience.

The first version intentionally excludes shopping cart, checkout, user accounts, and order management. The goal is to ship a stable content-managed showcase site with a lightweight admin experience and a frontend optimized for phones.

## Goals

- Build a mobile-first public showcase for pet items
- Provide a single-admin backend for managing showcase items
- Use a monorepo structure suitable for future expansion
- Store data in MongoDB
- Upload and serve item images through Cloudinary
- Keep the initial scope small enough to implement quickly

## Non-Goals

- Shopping cart
- Checkout or payment flow
- Customer accounts
- Multi-admin roles and permissions
- Inventory management
- Advanced search and filtering

## Product Scope

### Public Site

The public site includes only two pages in the first version:

- Product list page
- Product detail page

The list page is the main entry point. It should present pet showcase items as easy-to-scan cards on mobile, prioritizing image visibility and clear hierarchy. The detail page should provide a larger image, name, price, and description in a vertically scrollable layout designed for phones.

### Admin Site

The admin site is used by a single administrator. It includes:

- Login page
- Product management list page
- Create product page
- Edit product page
- Delete product action

The admin flow should be simple and efficient on mobile. A desktop layout may exist, but mobile usability is the primary requirement.

## Primary Users

### Public User

A visitor browses pet showcase items, opens a detail page, and views the item's image and information.

### Admin User

A single trusted administrator logs in, uploads an image, enters item data, saves it as draft or published, edits existing items, and deletes items when needed.

## Mobile-First Design Principle

This product is designed mobile-first. All layout, spacing, image ratios, interaction targets, and form behavior should be optimized for phones before any desktop polish is added.

This affects the implementation in the following ways:

- Public list page should default to a single-column card layout on mobile
- Public detail page should use vertical stacking and readable touch-friendly spacing
- Admin forms should be fully usable on phone-sized screens
- Buttons and inputs should have touch-friendly size and spacing
- Desktop support is required for basic usability, but desktop-specific visual refinement is not a first-release priority

## Architecture

The project should use a monorepo with separate applications for the public site and the admin site, plus shared packages for reusable logic and UI.

Recommended structure:

```txt
apps/
  web/
  admin/
packages/
  ui/
  shared/
  config/
```

### apps/web

Public-facing Next.js app for the product list and product detail experience.

### apps/admin

Admin-facing Next.js app for login and item management.

### packages/ui

Shared UI components such as buttons, inputs, cards, labels, and layout primitives that can be used in both apps where appropriate.

### packages/shared

Shared TypeScript types, validation schemas, constants, and possibly API contract definitions shared between frontend and admin.

### packages/config

Shared project configuration such as TypeScript settings, lint rules, and Tailwind configuration if centralized.

## Technical Stack

- Framework: Next.js
- Monorepo tooling: Turborepo
- Package manager: pnpm
- Styling: Tailwind CSS
- Database: MongoDB
- ODM: Mongoose
- Image hosting: Cloudinary
- Language: TypeScript

## Data Model

The first version needs a single main collection for products.

### Product

```ts
{
  _id: ObjectId,
  name: string,
  price: number,
  imageUrl: string,
  description: string,
  status: 'draft' | 'published',
  createdAt: Date,
  updatedAt: Date
}
```

### Field Notes

- `name`: required, short product name
- `price`: required, numeric display price
- `imageUrl`: required, Cloudinary-hosted image URL
- `description`: required, longer text for detail page display
- `status`: required, supports draft and published workflow
- `createdAt` and `updatedAt`: required for sorting and admin visibility

## Content Publishing Rules

- Only `published` items appear on the public site
- `draft` items remain visible only in the admin site
- Newly created items may default to `draft` to prevent accidental publishing

## Image Upload Strategy

Images should not be stored directly in MongoDB. The system should upload image files to Cloudinary and persist only the returned URL in MongoDB.

### Flow

1. Admin selects an image in the admin form
2. Admin submits the create or edit form
3. The backend uploads the file to Cloudinary
4. The backend receives the hosted image URL
5. The backend stores the item data with the Cloudinary URL in MongoDB

### Rationale

- Better image delivery performance than self-hosting files
- Easier future optimization for responsive images
- Keeps database records small and focused on metadata
- More deployment-friendly than storing files on the app server

## Page Design

### Public Product List Page

Purpose:
Display all published items in a mobile-friendly browsing list.

Core elements:

- Page title or brand area
- Vertical card list of published items
- Card image
- Product name
- Product price
- Link or tap target to open detail page

Behavior:

- Show only published items
- Sort by most recent first unless changed later
- Keep tap targets large and clear for mobile users

### Public Product Detail Page

Purpose:
Display the full information for one item.

Core elements:

- Large main image
- Product name
- Product price
- Description
- Back navigation to list page

Behavior:

- Layout should scroll naturally on mobile
- Text should be readable without dense multi-column layouts

### Admin Login Page

Purpose:
Allow the single admin to access the backend.

Core elements:

- Email or username field
- Password field
- Login button

Behavior:

- Keep the flow simple for a single-admin use case
- No advanced role system is required in the first version

### Admin Product List Page

Purpose:
Provide a simple overview of all products for editing and deletion.

Core elements:

- List of products
- Thumbnail image
- Name
- Price
- Status
- Edit action
- Delete action
- Create new product action

### Admin Create and Edit Page

Purpose:
Allow the admin to create or modify product data.

Core elements:

- Image upload input
- Name input
- Price input
- Description textarea
- Status selector
- Save action

Behavior:

- Form layout must be usable on narrow screens
- Validation errors should be clear and attached to fields
- Existing image preview should be visible on edit

## Data Flow

### Public Site Data Flow

1. Public list page requests published items
2. Backend reads products from MongoDB filtered by `published`
3. Public list page renders cards
4. User selects one item
5. Public detail page requests one product by id or slug-like route parameter
6. Backend returns the matching published item

### Admin Data Flow

1. Admin logs in
2. Admin navigates to product list
3. Admin creates or edits a product
4. If an image is included, backend uploads to Cloudinary first
5. Backend stores or updates product data in MongoDB
6. Admin sees updated product list

## API and Service Boundaries

The first version can use Next.js route handlers or API routes instead of a separate backend service. This keeps the system simple while still allowing a clean separation between:

- UI components
- Form handling
- Database access
- Cloudinary upload logic
- Authentication logic

If the product grows later, the data layer and service layer can be extracted without changing the monorepo shape.

## Authentication Approach

The first version only needs a single-admin authentication flow. The exact implementation can be chosen during the implementation planning phase, but it should satisfy the following:

- Protect admin routes from unauthenticated access
- Keep setup lightweight
- Avoid introducing unnecessary multi-user complexity

Suitable options include a simple credential-based auth flow in Next.js. The implementation plan should choose one concrete approach and keep it minimal.

## Error Handling

The system should handle common first-version failures clearly.

### Public Site

- If no products exist, show an empty state message
- If a product cannot be found, show a not found page
- If an image fails to load, show a safe fallback presentation

### Admin Site

- If login fails, show a clear error message
- If required fields are missing, show inline validation errors
- If image upload fails, stop save and show retry guidance
- If database write fails, show a non-technical save failure message
- If delete fails, preserve the item list and show feedback

## Testing Strategy

The implementation should include tests appropriate for the scope.

### Unit-Level Coverage

- Validation for product input fields
- Utility logic for formatting or transformations
- Database schema constraints where practical

### Integration-Level Coverage

- Create product flow
- Edit product flow
- Delete product flow
- Public list only returns published items
- Public detail page hides draft items

### UI-Level Coverage

- Mobile-friendly rendering of product list
- Mobile-friendly rendering of product detail
- Admin form submission states and validation behavior

## Visual Direction

The first version should favor a warm, approachable, image-led design direction appropriate for pet-related content. The design should feel friendly and trustworthy rather than overly corporate.

Recommended inspiration sources:

- Land-book for practical website style references
- Awwwards for higher-end visual inspiration if stronger branding is desired

The implementation should remain grounded in usability and mobile clarity rather than pursuing visual novelty at the cost of speed or readability.

## Recommended Delivery Strategy

Build in this order:

1. Set up monorepo structure
2. Configure shared tooling and TypeScript
3. Connect MongoDB and define the product schema
4. Implement admin authentication
5. Implement admin product CRUD
6. Implement Cloudinary upload flow
7. Implement public product list
8. Implement public product detail
9. Refine mobile-first styling and usability

This order ensures content management works before polishing the public browsing experience.

## Open Decisions Deferred To Planning

The following items are intentionally deferred to the implementation planning phase because they are engineering details, not product-definition blockers:

- Exact auth library choice
- Whether public detail routes use ids or slugs
- Whether API logic lives in `apps/admin` only or in a shared internal layer
- Exact component boundaries in `packages/ui`
- Exact testing framework selection

## Success Criteria

The first release is successful if:

- An admin can log in on mobile
- An admin can create, edit, and delete pet showcase items
- An admin can upload an image and save it through Cloudinary
- Products are stored in MongoDB
- Public users can browse a product list on mobile
- Public users can open a product detail page on mobile
- Draft items are hidden from the public site
- The project structure supports future expansion without redesigning the repo
