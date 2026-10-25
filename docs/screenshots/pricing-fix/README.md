# Pricing fix evidence

Captured on 2026-10-26 (Asia/Kolkata) using the separate local evidence app on port 3400 and the `selectaiagents_evidence` database. All accounts, endpoints and credits are disposable fixtures. No live AI provider or real payment was exercised.

- `before-dashboard.png`: PR #4 head `05f66252b3f776650794550ac5a4fb4f5a34c8cd`, before applying the fix. Onboarding Evidence Fixture has a $0.02 endpoint but displays the original $0.01 listing price.
- `after-dashboard.png`: same database and endpoint state with this fix applied; the summary displays $0.02 / call. The endpoint remains disabled/Needs attention.
- `after-listing.png`: listing summary and endpoint row both display $0.02.
- `pending-precise-price.png`: changed the endpoint price through Manage agent to $0.012345 and saved. Maker studio shows that exact price with Awaiting approval.
- `directory-price.png`: the directory also displays $0.012345 for the submitted endpoint.
- `charged-price.png`: after explicit approval through the existing local CLI, a real HTTP request to the local fixture succeeds. The gateway reports a $0.012345 development-credit charge, matching the configured price. The fixture response is labelled and does not claim AI output.

These are unmodified browser screenshots. The precision, approval-precedence, free-price and price-filter cases are also covered by automated regression tests.
