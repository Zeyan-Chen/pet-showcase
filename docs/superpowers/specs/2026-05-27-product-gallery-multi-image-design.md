# Product Gallery Multi-Image Design

## Summary

This change upgrades product images from a single-image model to a multi-image model while preserving compatibility with existing products. The admin can upload multiple images for a product and remove images one by one. On the storefront product detail page, product images render as a simple vertical stack without thumbnails, carousels, or gallery switching.

## Goals

- Allow each product to store multiple images.
- Preserve existing products that only have a single `imageUrl`.
- Let admins upload multiple images and remove them individually.
- Render product images on the storefront detail page in a vertical list.
- Keep storefront list cards unchanged except for continuing to use a single representative image.

## Non-Goals

- No carousel, slider, lightbox, or modal gallery.
- No drag-and-drop reordering in this iteration.
- No distinct "main image" selection workflow.
- No bulk delete; deletion is per image.

## Data Model

### Existing

Products currently store:

- `imageUrl: string`

### New

Add:

- `imageUrls: string[]`

### Compatibility Rule

- Existing `imageUrl` remains supported.
- New storefront and admin read logic should prefer `imageUrls` when present and non-empty.
- If `imageUrls` is empty or missing, fall back to `imageUrl`.
- Existing products do not require migration before deployment.

## Backend / Shared Schema

### Shared product schema

Extend the shared product input/output types to support:

- `imageUrls?: string[]`

Rules:

- `imageUrls` may be omitted for older products.
- When present, each entry must be a valid URL.
- Create/update flows should normalize empty arrays safely.

### Admin persistence

The product model should support:

- `imageUrl` for legacy compatibility
- `imageUrls` for the new gallery field

Write behavior:

- If the admin uploads one or more gallery images, save them in `imageUrls`.
- Keep `imageUrl` populated with the first available image so existing storefront card logic and older consumers remain stable.
- If all gallery images are removed and the product still has a legacy `imageUrl`, continue to use that fallback until the product is updated again.

## Admin UX

### Product form

The product form gains a multi-image area:

- Upload multiple images
- Show current uploaded images as a vertical or wrapped preview list
- Each image has an individual delete action

Behavior:

- Uploading a new image appends it to the product's image collection
- Deleting an image removes only that image
- The form should still show old single-image products correctly by seeding the initial preview from `imageUrl` if `imageUrls` is empty

### Save behavior

When saving:

- `imageUrls` is submitted as the current image list
- `imageUrl` is derived from the first image in the effective list

### API handling

Existing upload infrastructure can be reused. Each uploaded file still goes through the current Cloudinary upload flow, but the form now supports repeated uploads and maintains a client-side list of returned URLs.

## Storefront UX

### Product cards

No gallery UI is added to cards.

Rules:

- Card display continues to use one representative image
- Prefer the first image in `imageUrls`
- Fall back to `imageUrl`

### Product detail page

The product detail page changes from a single large image to a vertically stacked image gallery.

Rules:

- Render all available product images from top to bottom
- Prefer `imageUrls`
- If none are available, render the legacy `imageUrl`
- If only one image exists, the layout still works as a single-item stack

Layout guidance:

- Keep the existing text/content column structure
- Replace the current single-image block with a vertical image list
- Each image should use the same visual frame style for consistency

## Error Handling

- If a product has neither `imageUrls` nor `imageUrl`, the UI should fail gracefully with an empty image area rather than crashing.
- Deleting the last gallery image should not break the form.
- Upload failures should continue to show a clear inline error message in the admin.

## Testing

### Shared / backend

- Schema accepts legacy single-image products
- Schema accepts multi-image products
- Serialization returns `imageUrls` consistently

### Admin

- Product form can seed from legacy `imageUrl`
- Uploading multiple images appends correctly
- Deleting a single image only removes that image

### Storefront

- Card selects first image from `imageUrls`
- Card falls back to `imageUrl`
- Product detail page renders multiple images in order
- Product detail page falls back to the single legacy image when needed

## Rollout Notes

- This is a compatibility-first upgrade.
- Existing data remains valid without a migration step.
- Admin edits after rollout can gradually enrich older products with additional images.
