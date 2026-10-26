# Product UI evidence

Captured on 2026-10-26 from the running Next.js app at `http://127.0.0.1:3100`.
These are browser screenshots, not mockups. The local database contains fictional
Demo listings; they cannot receive calls or votes. No live-provider execution or
staging deployment is claimed by this UI change.

- `home-desktop.jpg`: full homepage at the default 1280px desktop viewport;
  search, launch feed, developer quickstart, truthful empty usage rankings and footer.
- `home-mobile.jpg`: homepage at 390 × 844.
- `home-dark.jpg`: existing theme toggle applied to the new layout, 1280 × 720.
- `catalog-filtered.jpg`: search for `research`, then maximum price `$0.01`;
  only ScoutMap remains at `$0.0040 / listing`. Full-page desktop capture.
- `catalog-mobile.jpg`: research results at 390 × 844, with mobile filters collapsed.
- `approved-empty.jpg`: the Approved endpoints feed correctly excludes demo listings.

Browser checks also covered opening the mobile filters, combining search/price/free
filters to produce an empty result, clearing those filters, switching feed tabs,
opening mobile navigation and closing it with Escape, and returning to light mode.
At 320px, the homepage, directory, agent detail, playground and rankings had no
horizontal document overflow. Signed-out submission redirected to the account
form, which was visually checked at 320px. Authenticated maker/operator forms were
not exercised in this UI pass.

Verification: 11 existing unit tests passed; production build passed; final
TypeScript check and `git diff --check` passed. An initial standalone typecheck
collided with the build regenerating `.next/types`; it passed when rerun after
build completion. The database integration suite was not rerun for these UI-only
changes. Routing, payments, review logic and database schema are unchanged.

Palette update: refreshed all six screenshots after changing the UI to blue,
black and white, including primary buttons, icons, status colors and chart
series. Light/dark and mobile appearances were checked again; TypeScript and
whitespace checks passed. The build and unit-test results above are from the
initial UI implementation, before this color-only follow-up.
