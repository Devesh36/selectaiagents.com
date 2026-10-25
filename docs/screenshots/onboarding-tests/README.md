# Onboarding test evidence

Captured on 2026-10-26 (Asia/Kolkata) from the local run of this branch.

- `integration-output.txt`: full stdout from `npm run test:integration`, exit 0; 30 checks passed, including seven onboarding checks.
- `unit-output.txt`: full stdout from `npm test`, exit 0; 11 tests passed and zero failed.
- `integration-passed.png`: browser screenshot of the integration stdout rendered as plain text for readability.
- `onboarding-passed.png`: browser screenshot of the seven onboarding PASS lines, integration total and unit-test summary, reproduced verbatim from those logs.

The screenshots are captures of rendered actual test output, not screenshots of a terminal or GitHub Actions. TypeScript checking (`npm run lint`) also exited 0. All integration traffic uses the isolated `selectaiagents_test` database and local fixture endpoints/payments; these results do not demonstrate a live provider or production deployment.

The new checks use actual HTTP handlers and PostgreSQL. A controlled insert-failure trigger exists only during the rollback check, is removed in `finally`, and is followed by a successful retry. Application behavior is unchanged by this PR.
