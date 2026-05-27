# Product Sold-Out Card Design

## Summary

This change adds a dedicated sold-out state to products and updates the storefront card layout to better match the provided mobile reference. Sold-out products remain visible in the storefront, show a badge in the top-right corner, and are no longer clickable from the listing view.

The admin keeps the existing `draft` / `published` publishing flow and adds a separate sold-out toggle so inventory-style display does not overload publishing status semantics.

## Goals

- Let admins mark products as sold out from the back office.
- Keep sold-out products visible in the storefront.
- Show a storefront sold-out badge that visually matches the provided reference.
- Change storefront product cards to a wider horizontal image presentation.
- Prevent sold-out cards from navigating to product detail pages.
- Show sold-out state clearly in admin product listings.

## Non-Goals

- Inventory quantity tracking
- Automatic stock deduction
- Sold-out sorting rules
- Hiding sold-out products from category or all-product listings
- Checkout or cart-related behavior

## User Experience

### Admin

- Product create/edit form includes a new `售罄` toggle.
- The toggle defaults to `false`.
- Product list rows show `售罄` or `未售罄`.
- Admin can update sold-out state without affecting `draft` / `published`.

### Storefront

- Product cards use a wider horizontal image ratio closer to the provided example.
- Sold-out products show a badge in the top-right corner of the image.
- Badge style:
  - white background
  - dark text
  - rounded pill shape
  - compact spacing
- Sold-out cards remain visible in the grid.
- Sold-out cards are not clickable.
- Product detail pages also show sold-out state for direct-entry consistency.

## Data Model

### Shared Product Schema

Add a new boolean field:

- `isSoldOut: boolean`

Behavior:

- Default: `false`
- Independent from `status`

### Product Meaning

- `status = draft`: not publicly listed
- `status = published`: publicly listed
- `isSoldOut = true`: publicly visible if published, but visually marked and not clickable from listing cards

## Admin Changes

### Product Form

Update product create/edit form to include:

- `isSoldOut` checkbox or toggle

Submission payload includes:

- `isSoldOut`

### Product List

Add a sold-out status column or inline status text:

- `售罄`
- `未售罄`

This status should be visible without entering the edit page.

## Storefront Changes

### Product Card Layout

Update product cards to use a horizontal image presentation instead of the current tall vertical framing.

Target behavior:

- Consistent card size across desktop and mobile
- Wider image area
- Better match to the visual rhythm of the provided mobile reference

### Sold-Out Badge

For `isSoldOut = true`:

- Render top-right badge inside image area
- Text: `售罄`
- White background, dark text, rounded shape
- Positioned with small inset spacing from top and right edges

### Card Interactivity

For `isSoldOut = false`:

- Card behaves normally
- Click navigates to `/products/[id]`

For `isSoldOut = true`:

- Card remains visible
- Card is not clickable
- Hover lift / interactive affordances should be removed or reduced so it does not feel tappable

### Product Detail Page

If a user enters a sold-out product detail page directly:

- show sold-out badge or text state near the product title/media
- page remains viewable

This keeps the experience consistent even if the detail URL is opened directly.

## API / Serialization

Update all product serialization and validation layers so `isSoldOut` is included in:

- shared schema parsing
- admin create/update payload handling
- admin product serialization
- storefront product fetching

## Testing

### Unit Tests

Add or update tests for:

- shared product schema defaulting `isSoldOut` to `false`
- admin serialization including `isSoldOut`
- storefront card rendering behavior for sold-out products
- storefront non-clickable rendering for sold-out products

### Manual Verification

Verify locally with browser automation:

1. Open admin.
2. Edit a published product and turn on `售罄`.
3. Open storefront listing.
4. Confirm:
   - badge appears
   - card is not clickable
   - non-sold-out cards remain clickable
5. Open sold-out product detail page directly and confirm state is shown there too.

## Risks

- If link removal is handled only visually but the DOM still contains a navigable anchor, the card may remain keyboard-clickable.
- Card size changes may affect current grid spacing and require minor responsive tuning.
- Existing tests may need snapshot/text updates because the card structure will change.

## Rollout Notes

- Existing products should default to `isSoldOut = false`.
- No migration beyond default field backfill is required for normal behavior.
