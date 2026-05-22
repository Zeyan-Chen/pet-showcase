# Site Logo Settings Design

Date: 2026-05-22

## Goal

Add a single site-wide logo setting that can be managed from the admin panel, replace the storefront logo placeholder with a real uploaded logo, and adjust the storefront header so the logo is centered on mobile and aligned to the upper-left on desktop.

This work also includes preparing the provided `Rookie Gecko` artwork as a transparent-background logo asset so it can be uploaded and displayed cleanly on the storefront.

## Scope

This change includes:

- Remove the purple background from the provided `Rookie Gecko` image and save a transparent PNG asset for upload.
- Add a single-record `SiteSettings` data model for storefront-wide visual settings.
- Add an admin `站台設定` page for uploading or replacing the storefront logo.
- Reuse the existing image upload infrastructure so logo uploads follow the same storage pattern as product images.
- Replace the storefront logo placeholder with a real image when settings exist.
- Keep a safe placeholder fallback when no logo has been configured yet.
- Update storefront responsive layout so:
  - mobile: logo is centered
  - desktop: logo is aligned to the upper-left

This change does not include:

- multi-logo variants
- favicon management
- brand color management
- full media library management

## Data Design

Create a new single-record settings model:

- `logoImageUrl: string`
- `logoPublicId: string`
- `logoAlt: string`
- `updatedAt: Date`

Behavior:

- The app treats this as one global settings record.
- Creating or updating logo settings overwrites the current storefront logo.
- If no settings record exists, the storefront continues to render the current placeholder block.

## Admin Experience

Add a new admin page:

- route: `/settings`
- navigation label: `站台設定`

First version UI:

- logo preview
- file input for uploading a replacement logo
- alt text input
- save action

Behavior:

- upload the selected image using the existing upload flow
- store the returned asset URL/public id into `SiteSettings`
- immediately show the updated preview after save

## Storefront Experience

Update the storefront shell header to read logo settings and render:

- configured logo image when available
- placeholder block when not configured

Responsive behavior:

- mobile: logo block centered horizontally above the category strip
- desktop: logo block aligned to the left within the header container

The uploaded logo should render as the full `Rookie Gecko` artwork, including the text.

## Implementation Notes

- Reuse current admin auth and upload patterns.
- Keep the image display container constrained so very wide or tall logos do not break the header.
- Prefer transparent PNG output for the prepared source image.
- Preserve current announcement bar and category navigation behavior.

## Validation

Implementation will be considered complete when:

- the provided image has a transparent-background logo asset
- admin can upload and replace the storefront logo from `站台設定`
- storefront shows the uploaded logo on local and production
- mobile shows the logo centered
- desktop shows the logo left-aligned
- the storefront still renders correctly when no logo is configured
