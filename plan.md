# Freemap shop locator plan

## Product
Create a mobile-first shop locator for Rofik Godi Centre using the exact Google Maps location resolved from the user link.

## Design
Use a polished navigation-app aesthetic inspired by the supplied reference: warm off-white map surface, strong red brand accent, rounded bottom sheet, compact travel-mode cards, and a black navigation HUD when a route is active. The interface should feel local, trustworthy, and action-oriented.

## Implementation
- Hard-code the verified shop destination at latitude 24.0973125 and longitude 88.2735625.
- Initialize `@navigatr/web` on mount and add a branded destination marker.
- Use browser geolocation for the user's starting point, with Berhampore fallback coordinates when permission is unavailable.
- Calculate and draw a route on demand; display distance and duration returned by Navigatr.
- Provide drive, bike, and walk mode controls, a directions CTA, call CTA, and Google Maps deep link.
- Keep the page responsive and usable on narrow mobile screens.

## Structure
- `apps/web/pages/index.vue`: shop locator page shell.
- `apps/web/components/ShopLocator.vue`: map lifecycle, route state, controls, and responsive UI.
- `apps/web/public/manus-routes.json`: route manifest for the root page.
