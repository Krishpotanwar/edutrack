# EduTrack Comprehensive Error Audit

Audit scope requested: logic, UI/theme, deploy/PWA readiness, and app/play-store readiness.

## Quick QA Snapshot (verified by commands)

- `npm run lint -- --max-warnings=0` ❌
  - 1 error + 4 warnings (`next-pwa.d.ts`, `home/page.tsx`, `photo-uploader.tsx`, `public/mockServiceWorker.js`)
- `npm run typecheck` ❌
  - 11 TypeScript errors across 7 test files
- `npm run build` ✅
  - Build succeeds and routes are generated
- `npm run test:run` ✅ (with warnings)
  - 150/150 unit tests pass, but runtime warnings are emitted
- `npm run test:e2e` ❌
  - 62 failed / 50 passed (browser binaries missing for Firefox/WebKit + selector ambiguity failures)

---

## Critical Issues

### C1) Production API is not implemented (app depends on dev-only mocks)
- **Evidence**
  - API calls are used all over app state/pages (`src/stores/auth-store.ts:26,52,76`, `src/app/(dashboard)/home/page.tsx:43,49,55`, etc.).
  - No real Next API routes exist: `src/app/api/**/*` returns no files.
  - MSW only starts in development: `src/components/providers/msw-provider.tsx:10-15`.
- **Impact**
  - In production, core flows (auth/events/users/reports/dashboard) have no guaranteed backend.

### C2) PWA install is broken: referenced icon assets are missing
- **Evidence**
  - Manifest and layout reference `/icons/icon-192.png`, `/icons/icon-512.png`, maskable variants (`public/manifest.json:14,20,28,34,40,46`, `src/app/layout.tsx:58-60`).
  - `public/icons/**/*` contains no files.
- **Impact**
  - Installability checks fail on browsers/platforms requiring valid app icons.

### C3) Service worker file is missing after build
- **Evidence**
  - PWA config references `sw: "sw.js"` (`next.config.ts:15`).
  - `**/sw.js` not found in repo after build.
- **Impact**
  - Offline and caching behavior is unreliable/non-functional in deployment.

### C4) “New Report” flow is UI-only and non-functional
- **Evidence**
  - Submit is fake timer only (`setTimeout(() => setStatus('success'), 1500)`) in `src/components/reports/generate-report-modal.tsx:47-53`.
  - “Download” button is a no-op link (`href="#"` + `preventDefault`) in `src/components/reports/generate-report-modal.tsx:119-126`.
- **Impact**
  - User-facing report generation appears successful but produces no file and no saved report.

---

## High Issues

### H1) Lint gate fails
- **Evidence**
  - `next-pwa.d.ts:29` uses `[key: string]: any` (explicit-any error).
- **Impact**
  - CI quality gate fails; maintainability drops.

### H2) Typecheck fails (11 errors)
- **Evidence**
  - `npm run typecheck` reports TS2345/TS2769 failures in:
    - `src/__tests__/auth-store.test.ts:160`
    - `src/__tests__/bottom-nav.test.tsx:22,34`
    - `src/__tests__/dashboard-page.test.tsx:13,29`
    - `src/__tests__/event-card.test.tsx:18,30`
    - `src/__tests__/login-page.test.tsx:43`
    - `src/__tests__/page-transition.test.tsx:17`
    - `src/__tests__/sidebar.test.tsx:34,46`
- **Impact**
  - Type-safety is currently broken for full project typecheck.

### H3) Login form inputs are missing associated `<label>` elements
- **Evidence**
  - Input component uses placeholder-as-label pattern (`src/app/(auth)/login/page.tsx:80-98`) but no `<label for=...>` for login fields.
  - E2E failure confirms missing `label[for="login-email"]`.
- **Impact**
  - Accessibility regression for screen readers; automated accessibility checks fail.

### H4) Password visibility toggle lacks accessible name
- **Evidence**
  - Toggle button has no `aria-label` (`src/app/(auth)/login/page.tsx:101-107`).
- **Impact**
  - Screen reader users cannot identify button purpose.

### H5) Mobile zoom is disabled
- **Evidence**
  - Viewport meta includes `user-scalable=no` (`src/app/layout.tsx:44`).
- **Impact**
  - Accessibility/WCAG problem for low-vision users.

### H6) Events empty-state CTA forces full-page navigation
- **Evidence**
  - `window.location.href = '/events/create'` (`src/app/(dashboard)/events/page.tsx:179`).
- **Impact**
  - Breaks SPA navigation behavior; causes full reload.

### H7) Event validation allows invalid date ranges
- **Evidence**
  - `eventSchema` validates required dates but no `endDate >= startDate` refinement (`src/lib/validations/schemas.ts:20-32`).
- **Impact**
  - Invalid events can be submitted (logical data corruption).

### H8) `maxParticipants` has no domain constraints
- **Evidence**
  - Schema only uses `z.number().optional()` (`src/lib/validations/schemas.ts:30`).
- **Impact**
  - Negative/zero/fractional participant limits are not prevented.

### H9) Manifest shortcut points to non-existent route
- **Evidence**
  - Shortcut URL is `/dashboard` (`public/manifest.json:57`).
  - App routes generated include `/home`, `/events`, `/calendar`, etc., but not `/dashboard` (build output).
- **Impact**
  - PWA shortcut can land users on 404.

### H10) Reports detail overlay still hardcodes white styling
- **Evidence**
  - Hardcoded `border-white/20` and `background: rgba(255, 255, 255, 0.85)` in `src/app/(dashboard)/reports/page.tsx:176-179`.
- **Impact**
  - Theme inconsistency and poor dark/light parity in reports modal overlay.

### H11) Login input text is hardcoded white
- **Evidence**
  - `text-white` in login input class (`src/app/(auth)/login/page.tsx:87`).
- **Impact**
  - Readability risk in light mode and inconsistent token usage.

### H12) E2E suite is not stable out-of-the-box
- **Evidence**
  - `npm run test:e2e` fails with 62 failures.
  - Missing browser executables for Firefox/WebKit (`Executable doesn't exist ...`, recommends `npx playwright install`).
- **Impact**
  - Cross-browser confidence is missing; CI/E2E workflow unreliable.

---

## Medium Issues

### M1) Ambiguous selectors in E2E due duplicated UI text/placeholder patterns
- **Evidence**
  - Strict mode violations:
    - `getByText(/upcoming events/i)` resolves multiple elements
    - `getByPlaceholder(/search events/i)` resolves two inputs (layout search + page search)
- **Impact**
  - Test reliability is degraded; indicates UX text duplication ambiguity.

### M2) Hook dependency warning in dashboard
- **Evidence**
  - ESLint warns `events` expression can destabilize `useMemo` deps (`src/app/(dashboard)/home/page.tsx:351` affecting memos at `358` and `365`).
- **Impact**
  - Potential unnecessary recalculations/re-renders.

### M3) Image optimization warning in photo uploader
- **Evidence**
  - Uses raw `<img>` in `src/components/ui/photo-uploader.tsx:69`.
- **Impact**
  - Potential LCP/bandwidth inefficiency (Next.js optimization bypassed).

### M4) Unit tests pass but emit chart runtime warnings
- **Evidence**
  - Recharts width/height warnings in test output (`width(-1)/height(-1)`).
- **Impact**
  - Test noise hides real issues and reduces signal quality.

### M5) Generated MSW file is linted as project source
- **Evidence**
  - `public/mockServiceWorker.js` warning in lint output (`Unused eslint-disable directive`).
- **Impact**
  - Quality gate polluted by generated artifacts.

---

## Deployment / Play Store Readiness Gaps

### D1) No app-shell/native packaging setup for Play Store
- **Evidence**
  - No Capacitor/TWA/native project files (`capacitor.config.*`, `android/`, `ios/` not found).
- **Impact**
  - Cannot ship as actual Play Store native app package yet.

### D2) No environment template for deploy
- **Evidence**
  - No `.env.example` found.
- **Impact**
  - Deployment configuration is error-prone for real API integration.

### D3) Project README is still generic scaffold
- **Evidence**
  - `README.md` is default create-next-app content (no project-specific deploy, PWA, E2E, mock/backend setup docs).
- **Impact**
  - Onboarding and deployment reproducibility are weak.

---

## Suggested Fix Order

1. **C1, C2, C3, C4** (production blockers + fake report feature)
2. **H1, H2, H12** (quality gates and test reliability)
3. **H3, H4, H5, H6, H7, H8, H9, H10, H11** (core UX/a11y/logic issues)
4. **M1-M5 + D1-D3** (stability and deployment hardening)

