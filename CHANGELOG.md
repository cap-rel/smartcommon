# Changelog

All notable changes to `@cap-rel/smartcommon` are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Consumer projects (smartInterventions, dolipocket, capTodo, ...) should
read this file when their pinned version differs from the latest, to
understand what may have changed at the API surface.

## [Unreleased]

## [1.0.370] - 2026-09-01

### Changed
- `PlainCalendar`: tapping a day of the neighbouring month (the leading /
  trailing cells padding the first and last week of the grid) now moves
  the grid onto that month and selects the day. It used to be silently
  ignored, which read as a broken calendar: those cells look like any
  other day and can carry an `items` badge, so a user tapping "the 31st,
  2 entries" got no feedback at all. `onChange` / `onMonthChange` /
  `onYearChange` fire exactly as for any other selection. Consumers that
  relied on those cells being inert must now filter on
  `data-outside-month="true"` themselves.

## [1.0.337] - 2026-05-27

### Added
- `BarcodeScanner` exposes `qrbox`, `fps`, `videoConstraints`,
  `experimentalFeatures` props for consumers to tune the html5-qrcode
  engine. Defaults are unchanged.
- `BarcodeScanner` accepts an `embedded` prop. When true, the scanner
  renders inline without the fullscreen overlay (no `fixed inset-0`,
  no title bar, no close button). The parent component provides its
  own chrome. Useful for embedding the scanner inside a modal or
  panel.

### Changed
- `BarcodeScanner` now activates
  `experimentalFeatures.useBarCodeDetectorIfSupported: true` by
  default, delegating to the browser's native `BarcodeDetector` when
  available (Chrome Android, Edge, iOS 17+). Significantly improves
  detection of 1D barcodes (EAN13, CODE_128, UPC). Override via the
  new `experimentalFeatures` prop if needed.

## [1.0.336] - 2026-05-27

### Added
- `Timer` accepts an optional `showSeconds` prop (default `true`). When
  set to `false`, the "Seconds" input is hidden, useful for forms where
  minute-precision is enough (intervention duration, prestation
  duration, etc.). The internal value remains stored in seconds;
  pre-existing sub-minute values are preserved on mount but get rounded
  to the minute on the next user edit.

## [1.0.335] - 2026-05-26

### Changed (BREAKING)
- `viewport` from `useViewport()` is now strictly one of
  `"mobile" | "tablet" | "desktop"`. The `desktop` bucket no longer
  contains tablets: `isDesktop` is true ONLY for pointer:fine devices
  (mouse / trackpad). Consumers doing `isDesktop ? D : M` will render
  the mobile branch on tablets going forward; add a `tablet` branch
  (or rely on `DualShell`'s fallback) for the intended layout.
- `DESKTOP_MEDIA_QUERY` value changed from `(min-width: 768px)` to
  `(pointer: fine)`. The new semantic matches UI usage (target size,
  hover) instead of an arbitrary CSS width that misclassifies iPhone
  in landscape and iPad mini in portrait. Consumers importing this
  constant for tests or helpers must update their expectations.

### Added
- 3-tier viewport auto-detection: pointer-primary (pointer:fine ->
  desktop ; pointer:coarse + short side >= 600 px -> tablet ;
  otherwise mobile). The short side is read from `screen.width` /
  `screen.height` so it survives orientation changes and is not
  fooled by an iPhone in landscape.
- `isTablet` boolean exposed on `useViewport()`.
- `"tablet"` accepted in `setPreference()` and added to
  `VALID_PREFERENCES`.
- `setPreference(value, { silent: true })` to skip the confirm dialog
  (used internally by `DeviceIdentificationComponent` to apply a
  per-device viewport choice without bothering the user again).
- `detectAutoViewport()` exported helper so callers can preselect a
  UI control using the same heuristic the provider uses internally.
- `TABLET_MEDIA_QUERY` exported
  (`(pointer: coarse) and (min-width: 600px)`).
- `MOBILE_MEDIA_QUERY` exported
  (`(pointer: coarse) and (max-width: 599.98px)`).
- `MOBILE_MAX_SHORT_SIDE_PX = 600` exported (frozen threshold).
  Foldables like Galaxy Fold (~673 px short side when unfolded)
  classify as tablet by design.
- `DualShell` accepts an optional `tablet` prop. When the viewport is
  tablet but `tablet` is absent, falls back to `desktop ?? mobile ??
  null` -- a SAFETY NET against a blank screen, NOT a design
  endorsement. Tablet ergonomics differ fundamentally from desktop;
  pass a real `tablet` prop as soon as the page warrants it.
- `DeviceIdentificationComponent` gains a "Device type" radio
  (Auto / Smartphone / Tablet / Desktop) on the new-device path,
  pre-selected via `detectAutoViewport()`. New props
  `enableViewportMode` (default true), `defaultViewportMode`,
  `viewportModeCheckerProps`. After identification, if the chosen
  mode differs from the current `preference`, the component calls
  `setPreference(value, { silent: true })` to reload with the
  effective viewport.
- `useApi.identifyDevice` accepts an optional `viewport_mode` in the
  body and forwards it to the smartAuth `POST /device` endpoint
  (which propagates the value to the logical user_device).
- `useApi.setDeviceViewportMode(id, mode)` calls the new
  `POST /account/user-devices/{id}/viewport-mode` endpoint. Pass
  `null` to clear the stored mode back to NULL.
- `existingUserDevices` (login response) carries `viewport_mode` per
  entry. `DeviceIdentificationComponent` joins it to the legacy
  `deviceOptions` picker by label so picking a known device auto-
  applies its stored mode.
- 7 new locale strings (`viewportModeLabel`, `viewportModeHelp`,
  `viewportModeOption{Auto,Mobile,Tablet,Desktop}`) translated in
  fr / de / es / it / pl / nl / pt.

### Notes
- Graceful degradation: if the smartAuth backend has not been
  updated to expose `viewport_mode`, every viewport_mode field is
  treated as `undefined` and the feature silently no-ops. Backend
  support requires smartAuth >= 2.0.21.
- `DualShell` keeps the same "throws when used outside a
  ViewportProvider" contract, with the same error message
  ("DualShell must be used inside <ViewportProvider>"). Tests rely
  on that exact wording.

## [1.0.334] - 2026-05-26

### Added
- `Db` class (`lib/utils/class/Db`) gains a multi-version mode via the
  new `versions: [...]` constructor option. Each entry is
  `{ version, stores, upgrade? }` and lets consumers chain
  `db.version(N).stores(...).upgrade(tx => ...)` calls Dexie-style,
  so existing offline rows can be migrated (column renames, data
  reshape) instead of being silently stranded with `undefined` keys
  on the next user-facing version bump.
- `LOGS_INDEXES` constant is now exported and explicitly marked
  FROZEN in the source. A snapshot test
  (`Db/index.test.js`, "LOGS_INDEXES is frozen") fails on any
  modification, to force the conversation before a change that would
  break every consumer's existing IndexedDB.

### Changed
- `Db` constructor performs defensive validation on its arguments:
  `versions` must be a non-empty array of plain objects with
  strictly increasing `version` numbers, non-empty `stores`, and an
  optional `upgrade` that must be a function. Explicit error
  messages point at the offending entry.
- Passing both `versions` and a non-default `version`/`stores` logs
  a `log.warning` (`versions` wins) instead of failing silently. The
  legacy single-version API (`{ version, stores }` and the bare
  `new Db({ name })` logs-only default) is preserved unchanged.

## [1.0.333] - 2026-05-26

### Added
- `ViewportProvider`, `useViewport`, `DualShell` -- viewport-aware
  rendering primitives promoted from smartInterventions and
  dolipocket. Frozen-for-session detection (mobile vs desktop) via
  `localStorage` + `matchMedia('(min-width: 768px)')`. Optional
  async `onPreferenceChange` callback before reload.
- `DESKTOP_MEDIA_QUERY`, `VIEWPORT_PREFERENCE_KEY` -- public
  constants for consumers that need to align their CSS or tests.
- `ViewportProvider` locale bundle in all 8 languages (en, fr, de,
  es, it, pl, nl, pt).

## [1.0.332] - 2026-05-25

### Added
- `data-testid` hooks on `PhotosUploader` and `SignaturePad` to make
  Playwright/E2E selectors stable.

## [1.0.331] - 2026-05-25

### Added
- Locale keys completed across `de`, `es`, `it`, `nl`, `pl`, `pt`
  bundles to bring them on par with `en`/`fr`.

### Fixed
- `PhotoAnnotator` decorator import path.

## [1.0.330] - 2026-05-21

### Added
- `src/lib/locales/` with 8 locale bundles (en, fr, de, es, it, pl,
  nl, pt) exposed via top-level `locales` namespace. `en` is the
  source of truth, re-imported from each component's `DEFAULT_LABELS`.
- Structural integrity test `locales.test.js` (key shape + ASCII
  punctuation audit) running in CI.
- `labels` prop wired across `UpdatePrompt`, `AboutModal`,
  `BarcodeScanner`, `DataTable`, `DeviceIdentificationComponent`,
  `DevicePicker`, `LoginComponent`, `Map`, `PhotoAnnotator`,
  `ProductCategoryBrowser`, `Stepper`, and form primitives
  (`AudiosUploader`, `Boolean`, `Checker`, `Gps`, `PhotosUploader`,
  `PlainCalendar`, `RadioBar`, `Select`, `SignaturePad`,
  `VideosUploader`, `Files` format).

### Changed
- `DEFAULT_LABELS` of every i18n-aware component switched to English
  as the canonical source of truth (was a mix of French defaults).
  Consumers relying on French fallback strings must now spread
  `locales.fr.<Component>` (or override via `labels`).

## [1.0.328] - 2026-05-21

### Added
- `labels` prop on form primitives (`AudiosUploader`, `Boolean`,
  `Checker`, `Gps`, `PhotosUploader`, `RadioBar`, `Select`,
  `SignaturePad`, `VideosUploader`) and on `Map`, allowing consumers
  to override every user-facing string.

## [1.0.326] - 2026-05-21

### Added
- `useNavigation` now exposes `useParams` from react-router-dom (ported
  from smartInterventions usage).

## [1.0.324] - 2026-05-21

### Added
- `SignaturePad` gains a hidden/popup mode for signing inside a modal
  without disturbing the surrounding layout.

## [1.0.323] - 2026-05-19

### Added
- New `formats/Array` component with default story, plus a `Files`
  format variant.

## [1.0.322] - 2026-05-19

### Added
- `useApi.login` callback `onLoginPersist` (consumer hook on
  `libConfig.api`) -- awaited before writing the user to gst, lets
  the consumer enrich the minimal `baseUser` with persisted
  `settings`/`config`/`versions` before `<RouteGuard>` sees it.
- Sequencing tests for the login flow and an end-to-end build-bundle
  smoke test.

### Fixed
- `Boolean` form component: avoid self-shadowed-global recursive call
  that crashed inside the first hook. Also adds the
  `globalShadowing.test.jsx` static + render guard to prevent the
  regression project-wide.

## [1.0.321] - 2026-05-13

### Added
- New `PlainCalendar` form component (full month grid, controlled).
- `docs/provider.md` and component docs under `docs/` (`about-modal`,
  `address-input`, `array`, `barcode-scanner`, `calculator`,
  `calendar`, `data-table`, `device-identification-component`,
  `device-picker`, `editor`, `fab`, `files-uploader`, `form`,
  `formats`, `gps`, `login-component`, `modal`, `navigation`,
  `offline`, `page`, `panel`, `photo-annotator`, `popup`,
  `product-category-browser`, `route-guard`, ...).

## [1.0.320] - 2026-05-12

### Added
- Print engine (`lib/print/`): `TicketBuilder` (ESC/POS fluent
  builder), `WebUSBPrinter`, `browserPrint` (iframe + window.print),
  `PrintService` (queue + retry, template registry), `usePrintService`
  React binding, plus English `DEFAULT_LABELS`.
- `NumericPad` tactile keypad form component (integer/decimal modes,
  controlled, optional confirm button).
- `useBarcodeScanner` local hook (USB scanner emulating a keyboard,
  Enter-terminated, inter-key < 50ms heuristic).
- `PhotosUploader`: integration test suite.

### Fixed
- `Boolean` form component: render and prop wiring.
- ESLint sweep on stories/tests/decorators across `app/RouteGuard`,
  `others/DebugWarnings`, `others/LoginComponent`, `others/Modal`,
  `others/PhotoAnnotator`, `others/ProductCategoryBrowser`.

## [1.0.319] - 2026-05-12

### Added
- New `SignaturePad` form component (canvas-based, controlled, with
  test suite).
- New `DevicePicker` component for choosing among existing devices.
- `RouteGuard` nested-router test coverage.
- Smoke tests for the built bundle, barrel-export coverage, and
  category-folder layout (`bundleExternals.test.js`,
  `barrelExports.test.jsx`, `categoryFolders.test.jsx`).
- `PhotosUploader`: new prop wiring (4 props added).

### Changed
- Rollup `external`-isation rules tightened in `vite.config.js` so
  the published bundle no longer ships React/Redux/peer deps.

### Removed
- Empty placeholder components from `little/Icon`, `main/Carousel`,
  `main/CarouselItem`, `others/Chart` and others -- they shipped no
  implementation and were noise in the barrels.

## [1.0.317] - 2026-05-08

### Fixed
- `LoginComponent`: persisted-credentials behaviour when
  `sharedDevice` is unchecked (`rememberMe` now propagated correctly
  to `api.login`).

## [1.0.316] - 2026-05-08

### Changed
- `LoginComponent`: opt-out semantics reversed -- the checkbox now
  reads "shared device" (ticked = do NOT remember me, untrusted
  access). Default is unchecked, so the historical "remember me"
  behaviour is preserved for first-time consumers. Payload field
  becomes `rememberMe: !sharedDevice`.

### Added
- `formats/Datetime`, `formats/Duration`, `formats/Files`,
  `formats/Icon`, `formats/Number`, `formats/Signature`: real
  implementations replacing the previous stub modules. Plus
  `formats/index.test.jsx` smoke coverage.
- `little/Button`: extended prop wiring.

## [1.0.315] - 2026-05-08

### Added
- `RoutingAnimationLayout` component (animated route transitions
  using `AnimatePresence`).
- `I18nextProvider` re-exported from the app barrel.

### Fixed
- `RouteGuard`: typo on a route name (was a reversed string), which
  caused the wrong redirect target in some configurations.

## [1.0.314] - 2026-05-08

### Added
- `PhotoAnnotator` component (generic, ported from offlinepropale):
  place markers on a photo, each linked to a consumer-defined
  domain object via a `annotationTypes` registry. Long-press,
  drag, pinch/zoom, list sidebar, read-only mode.
- `PhotoAnnotator`: event-based mode (`onCreate`/`onUpdate`/`onMove`/
  `onDelete` + `initialAnnotations`) alongside the controlled mode;
  optimistic create with rollback on rejection.
- `PhotoAnnotator`: `headlessEditor` flag for types that mount their
  editor without modal chrome (file picker, sub-photo capture, ...).

## [1.0.313] - 2026-05-08

### Added
- `ProductCategoryBrowser` component: fullscreen modal to browse a
  product catalog by category. Modes `select`, `quantity`,
  `quantity-discount`. `multiple` mode with footer cart.
- `createDexieProductCategoryAdapters` helper (Dexie-backed adapters
  matching the offlinepropale schema, with `for_sale`/`tosell`/
  `status_sell` filtering and bulk image join).
- `prefillProduct` prop on `ProductCategoryBrowser` to open directly
  on the confirm step when editing an existing line.

## [1.0.312] - 2026-05-08

### Added
- `RouteGuard`: integrated device-identification flow with the new
  `DeviceIdentificationComponent`. New modes
  `requireDeviceIdentification` and `requireDeviceIdentified`. Device
  modes imply `requireAuth`.
- `DeviceIdentificationComponent`: standalone component for
  associating a physical device via smartAuth's `device` endpoint
  (radio picker of existing devices when `user.deviceOptions` is
  populated, label-only input otherwise).

## [1.0.311] - 2026-05-08

### Fixed
- `LoginComponent` and `useApi.login` / QR pairing path: minor fixes
  on the login button feedback and pairing context propagation
  (commit `d47dadf`, no further detail in the message).

## [1.0.310] - 2026-05-07

### Changed
- `BarcodeScanner` is now wrapped in `ErrorBoundary` to keep scanner
  crashes (camera permission denied, lazy-load failure) from taking
  down the surrounding page.

### Fixed
- `BarcodeScanner`: misc robustness around tear-down on error.

## [1.0.309] - 2026-05-07

### Changed
- `LoginComponent`: scan feedback content moved outside the
  `BarcodeScanner` overlay so the user keeps seeing the form context
  during claim/poll.

## [1.0.308] - 2026-05-07

### Added
- `LoginComponent` props refactor: helper `handleQrScan` is now
  exposed as part of the component contract, with new props to
  customise the claim/poll feedback. Adds idempotence guard against
  double-claim (Android autofocus 409 race).

## [1.0.307] - 2026-05-07

### Added
- `RouteGuard` component: replaces per-project `Public/Private`
  layout wrappers. Modes `requireAuth` / `requireGuest`. Works as a
  router element or wrapping children.

## [1.0.306] - 2026-05-07

### Added
- `LoginComponent`: dedicated "Scan QR" button slot (`scanQrButtonProps`)
  to open the pairing overlay independently of the form submit.

## [1.0.304] - 2026-05-07

### Added
- `LoginComponent`: full Dolibarr-style login form (email + password,
  optional entity Select, "remember me" checkbox) with built-in
  smartAuth QR pairing flow (claim + poll loop, global timeout).
  Ships its own English `DEFAULT_LABELS` and styling slots
  (`containerProps`, `formProps`, `inputProps`, `errorAlertProps`,
  ...).
- `BarcodeScanner` component (fullscreen, lazy-loads `html5-qrcode`,
  manual entry fallback on permission denial, `continuous` mode,
  `formats` filter).
- `useApi` exports for the QR pairing flow: `claimQrPair`,
  `pollQrPair`. On `consumed` status, the user is persisted to
  `gst.local` automatically (trusted-device semantics).
- `LibConfigProvider` `config.app` slot for app-level style/settings
  props.

### Changed
- All "high-level" components (`LoginComponent`, ...) now merge
  consumer-provided `className` with their defaults via `twMerge`,
  to avoid Tailwind conflicts (`gap-4` vs `gap-6`).

## [1.0.302] - 2026-05-07

### Added
- `AboutModal` component: shows app name + version + custom fields
  in a modal, with a manual service-worker update check button.
- Provider-stack integration tests (`ApiProvider`, `ConfirmProvider`,
  `ErrorBoundary`, `GlobalStatesProvider`, `LibConfigProvider`,
  `NavigationProvider`, `Provider`, `ReduxProvider`, `UpdatePrompt`)
  and stories for `SearchableSelect` and `Calculator`.

## [1.0.301] - 2026-04-30

### Fixed
- `form/Form`: rapid repeated clicks on the submit button were
  swallowed; clicks now go through to the underlying handler each
  time.

[Unreleased]: https://gitlab.com/cap-rel/smartcommon/compare/v1.0.333...HEAD
[1.0.333]: https://gitlab.com/cap-rel/smartcommon/compare/v1.0.332...v1.0.333
[1.0.332]: https://gitlab.com/cap-rel/smartcommon/compare/v1.0.331...v1.0.332
[1.0.331]: https://gitlab.com/cap-rel/smartcommon/compare/v1.0.330...v1.0.331
[1.0.330]: https://gitlab.com/cap-rel/smartcommon/compare/v1.0.328...v1.0.330
[1.0.328]: https://gitlab.com/cap-rel/smartcommon/compare/v1.0.326...v1.0.328
[1.0.326]: https://gitlab.com/cap-rel/smartcommon/compare/v1.0.324...v1.0.326
[1.0.324]: https://gitlab.com/cap-rel/smartcommon/compare/v1.0.323...v1.0.324
[1.0.323]: https://gitlab.com/cap-rel/smartcommon/compare/v1.0.322...v1.0.323
[1.0.322]: https://gitlab.com/cap-rel/smartcommon/compare/v1.0.321...v1.0.322
[1.0.321]: https://gitlab.com/cap-rel/smartcommon/compare/v1.0.320...v1.0.321
[1.0.320]: https://gitlab.com/cap-rel/smartcommon/compare/v1.0.319...v1.0.320
[1.0.319]: https://gitlab.com/cap-rel/smartcommon/compare/v1.0.317...v1.0.319
[1.0.317]: https://gitlab.com/cap-rel/smartcommon/compare/v1.0.316...v1.0.317
[1.0.316]: https://gitlab.com/cap-rel/smartcommon/compare/v1.0.315...v1.0.316
[1.0.315]: https://gitlab.com/cap-rel/smartcommon/compare/v1.0.314...v1.0.315
[1.0.314]: https://gitlab.com/cap-rel/smartcommon/compare/v1.0.313...v1.0.314
[1.0.313]: https://gitlab.com/cap-rel/smartcommon/compare/v1.0.312...v1.0.313
[1.0.312]: https://gitlab.com/cap-rel/smartcommon/compare/v1.0.311...v1.0.312
[1.0.311]: https://gitlab.com/cap-rel/smartcommon/compare/v1.0.310...v1.0.311
[1.0.310]: https://gitlab.com/cap-rel/smartcommon/compare/v1.0.309...v1.0.310
[1.0.309]: https://gitlab.com/cap-rel/smartcommon/compare/v1.0.308...v1.0.309
[1.0.308]: https://gitlab.com/cap-rel/smartcommon/compare/v1.0.307...v1.0.308
[1.0.307]: https://gitlab.com/cap-rel/smartcommon/compare/v1.0.306...v1.0.307
[1.0.306]: https://gitlab.com/cap-rel/smartcommon/compare/v1.0.304...v1.0.306
[1.0.304]: https://gitlab.com/cap-rel/smartcommon/compare/v1.0.302...v1.0.304
[1.0.302]: https://gitlab.com/cap-rel/smartcommon/compare/v1.0.301...v1.0.302
[1.0.301]: https://gitlab.com/cap-rel/smartcommon/compare/v1.0.299...v1.0.301
