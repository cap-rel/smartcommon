# SmartCommon - Project Context

React component library for Dolibarr mobile applications (PWA).
Package: `@cap-rel/smartcommon`.

## Architecture

```
src/lib/
├── components/
│   ├── app/        # Provider, ErrorBoundary, RouteGuard, Router, UpdatePrompt
│   ├── form/       # Input, Calendar, FilesUploader, Editor, NumericPad, ...
│   ├── formats/    # Display formatters (Number, Email, Address, ...)
│   ├── little/     # Button, Spinner, Tag, Icon
│   ├── main/       # Popup, Page, Panel, List, ...
│   ├── navigation/ # Navbar, Tabbar, Sidebar
│   └── others/     # Modal, AboutModal, BarcodeScanner, LoginComponent,
│                   #   DeviceIdentificationComponent, ProductCategoryBrowser,
│                   #   PhotoAnnotator, PhotoEditor, Calculator, DataTable, Fab, ...
├── hooks/{global,local}/
├── print/          # ESC/POS receipt printer engine + usePrintService
├── sync/           # Offline-first sync engine + useSyncClient
├── imageEditor/    # Canvas image-editing engine (PhotoEditor backend)
├── global-state/   # Redux store
├── utils/  tests/  themes/
```

`print/`, `sync/` and `imageEditor/` are flat "service module" directories
that colocate framework-agnostic classes/functions with their React
consumers. New service modules SHOULD follow this layout rather than
splitting between `hooks/local/` and an isolated classes dir.

## Dual Export System (CRITICAL)

Two barrel files per category - both MUST be updated when adding a component:

| File | Purpose |
|------|---------|
| `index.js`  | Dev / Storybook (`npm run dev`, `npm run storybook`) |
| `export.js` | Library build (`npm run build` -> `dist/`) |

Entry points: dev `src/lib/index.js` -> `components/index.js` ; build
`src/index.js` -> `lib/export.js` -> `components/export.js`.

If you only add to `index.js`, the component works in Storybook but is
absent from the npm package. `others/` already had a `Modal` divergence;
double-check both files when adding.

## Creating a Component

```
{category}/MyComponent/
├── index.jsx        # named export, uses useVariantMerger
├── props.js         # propTypes + defaultProps
├── variants/{index.js,base.js}   # variant fns returning prop objects
└── .stories.js + stories/        # optional
```

Skeleton:

```jsx
import { useVariantMerger } from "lib/hooks";
import { defaultProps, propTypes } from "./props";

export const MyComponent = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("MyComponent", props);
    const { children } = variantProps;
    return (
        <div {...mergeProps("container", p => ({
            ...p, "data-component": "MyComponent",
            className: `base ${p.className || ""}`,
        }))}>{children}</div>
    );
};
MyComponent.propTypes = propTypes;
MyComponent.defaultProps = defaultProps;
```

Convention: element keys camelCase (`container`, `button`); sub-component
keys capitalized (`Button`, `Overlay`). Element-level prop slots are
suffixed `Props` (`containerProps`, `buttonProps`).

### CAUTION: components named after a JS global

We have several `export const <Name> = ...` whose name shadows a JS
builtin (`Boolean`, `Number`, `String`, `Array`, `Map`). Inside the
component body, the identifier `<Name>` is rebound to the component
itself, so a call like `Boolean(currentValue)` does NOT invoke the
global - it recursively re-enters the component with `currentValue`
as `props` and crashes inside the first hook on the next render. The
original Boolean self-shadowing bug burned hours: ErrorBoundary
flashed `Cannot read properties of undefined (reading 'variant')`
with no hint that the call site was the cause.

Rules when authoring a component whose name shadows a global:

- Never write `<Name>(x)` inside the component body. Use the
  shadow-safe alternative: `!!x` for Boolean, `globalThis.<Name>(x)`,
  or an aliased import at the top of the file
  (`const toNumber = globalThis.Number;`).
- The ESLint rule `local/no-shadowed-global-self-call` flags any such
  call at lint time. See `eslint-rules/no-shadowed-global-self-call.js`.
- The CI test `src/lib/tests/globalShadowing.test.jsx` does the same
  via a static source scan plus a render smoke pass on every shadow-
  named component, in case the rule is ever bypassed.

## High-level Component Patterns

For business / page-replacing components (LoginComponent, AboutModal,
ProductCategoryBrowser, ...) which do NOT use `useVariantMerger`:

- **Styling slots `*Props`**: spread onto target. ALWAYS merge classes via
  `twMerge` from `lib/utils` - otherwise Tailwind conflicts (`gap-4` vs
  `gap-6`) don't resolve.
- **i18n via `labels` prop**, NEVER `useTranslation()` internally. Default
  to a `DEFAULT_LABELS` constant **in English** (source of truth);
  consumer wires its translator OR spreads a locale bundle from
  `src/lib/locales/`. See "i18n / locale bundles" section below.
- **Custom error mapping**: accept `getErrorLabel(err) -> string|null`.
  See `LoginComponent.getQrErrorLabel`; helper
  `buildDefaultGetQrErrorLabel(labels)` exported from props.js.
- **Reuse smartcommon primitives** (`<Modal>`, `<Button>`, `<Input>`,
  `<BarcodeScanner>`) over inline HTML.

## i18n / locale bundles

Since 2.x, every component's `DEFAULT_LABELS` is in **English** (source
of truth). The library ships 8 locale bundles in `src/lib/locales/`:
`en`, `fr`, `de`, `es`, `it`, `pl`, `nl`, `pt`. Bundles are exported
via the top-level barrel as a `locales` namespace.

### Layout

```
src/lib/locales/
  en.js          # source of truth -- imports DEFAULT_LABELS from each props.js
                 # and reshapes them into a single object keyed by component name
  fr.js          # full standalone bundle, French (verbatim port of pre-2.x defaults)
  de.js de.js ...# the other 6 locales (de/es/it/pl/nl/pt)
  index.js       # dev/Storybook barrel
  export.js      # build barrel (mirrors index.js)
  locales.test.js# structural integrity test (fingerprint shape + ASCII-punct audit)
```

The `en.js` file is special: it does NOT contain string literals, it
re-imports `DEFAULT_LABELS` from each component's `props.js` (or
`labels.js` for service modules like `print/`) and reshapes them.
This guarantees `en` is always in sync with the source.

Every other locale bundle is a **standalone object** with the same
shape as `en`: same keys at every nesting level, same function
arities, same array lengths. Enforced by `locales.test.js` which runs
in CI on every commit.

### Consumer usage

Three patterns, by increasing robustness:

```jsx
// 1. No labels -> English default (acceptable for English apps)
<LoginComponent onSuccess={...} />

// 2. Full bundle -> single language
import { locales } from "@cap-rel/smartcommon";
<LoginComponent labels={locales.fr.LoginComponent} />

// 3. Bundle + i18n override (most apps)
import { useTranslation } from "react-i18next";
const { t } = useTranslation();
<LoginComponent
    labels={{
        ...locales.fr.LoginComponent,
        emailLabel: t("login.email"),  // only the keys the project translates
    }}
/>
```

### Adding a new label key

When a new label is needed in a component:

1. Add the English string to that component's `DEFAULT_LABELS` in
   `props.js`. This is the source of truth.
2. **For each other locale** in `src/lib/locales/<lang>.js`, add the
   translated key in the matching component object. Same key name,
   same function signature if interpolated. ALL 7 non-English locale
   files must be updated.
3. Run `npx vitest run src/lib/locales/locales.test.js`. The
   structural fingerprint test will fail if any locale is missing the
   key, has a wrong arity, or has a different array length.

If you only know one or two languages, leave the others as their
English value and add a `// TODO native review for <lang>` comment.
Don't ship a half-translated key.

### ASCII punctuation rule

Locale files (and DEFAULT_LABELS) MUST use ASCII punctuation only.
NO curly quotes (' ' " "), NO ellipsis character (...), NO em-dash
(--), NO bullets (*), NO arrows (->), NO inverted Spanish punctuation
(? !). Enforced by `locales.test.js`. Project-wide rule, applies to
every locale.

Proper diacritics for the target language ARE required (é è à ç in
French, ä ö ü ß in German, ą ć ę ł ń ś ź ż in Polish, etc.). Only the
*punctuation* must be ASCII.

### Adding a new language

1. Create `src/lib/locales/<lang>.js` mirroring `en.js` shape.
2. Add `export { <lang> } from "./<lang>"` in both `index.js` and
   `export.js`.
3. Update `locales.test.js`: add `import <lang> from "./<lang>"` at
   the top and include `<lang>` in the `bundles` object inside both
   `describe` blocks.
4. Document the new bundle in this section.

## Tech Stack

React 19, Vite, TailwindCSS 4 + tailwind-merge (`twMerge` via
`lib/utils`), Redux Toolkit + redux-persist, react-router-dom 7, ky,
html5-qrcode (lazy-loaded by `BarcodeScanner` only), Vitest
(`isolate: true`), Storybook.

## Commands

```bash
npm run dev          # dev server
npm run build        # library build
npm run test:run     # tests
npm run lint         # ESLint
npm run storybook    # Storybook
```

## CRITICAL: rebuild `dist/` after every source change

`package.json` exposes the lib via `"exports": { ".": "./dist/smartcommon.es.js" }`.
Consumers (smartInterventions, capTodo, eTicket, ...) link this package
through `file:../../smartcommon` and import the **compiled bundle**, not the
source tree. `dist/` is in `.gitignore` and is never committed.

Consequence: editing `src/lib/...` **does not propagate** to any consumer
until you run `npm run build` here. Forgetting this step makes consumers
ship a version of smartcommon that disagrees with the source on disk, and
burns hours debugging phantom bugs (the canonical example: a fix that lives
in `src/lib/.../PlainCalendar/index.jsx` but is still missing from `dist/`
because nobody rebuilt the bundle).

**Rule**: every time you finish a code change in `src/`, run `npm run build`
before declaring it done. If you are answering a "is this bug really in
smartcommon ?" question from a consumer project, the first thing to verify
is that the consumer's `node_modules/@cap-rel/smartcommon/dist/` is fresher
than `src/lib/`. Consumers can wire a guard (e.g.
`smartInterventions/mobile/scripts/check-smartcommon-fresh.js`) into their
`prebuild` to refuse to build against a stale dist.

## Important Files

- `components/app/Provider/index.jsx` - root provider (doc: `docs/provider.md`)
- `components/app/ErrorBoundary/index.jsx` (doc: `docs/provider.md`)
- `components/app/UpdatePrompt/index.jsx` - PWA update UI (doc: `docs/provider.md`)
- `components/app/Toaster/index.jsx` - react-hot-toast wrapper (doc: `docs/provider.md`)
- `hooks/global/useApi/context.jsx` - API + error enrichment
- `hooks/global/usePWAUpdate/index.jsx`
- `hooks/local/useField/index.jsx`
- `print/printService.js` - generic ESC/POS orchestrator (queue + retry)
- `print/usePrintService.jsx` - React binding
- `utils/functions/consoleLogs.js` - `log` + `createLogger`

## Logging (`lib/utils`)

```js
import { log, createLogger } from "lib/utils";
log.info("..."); log.error("...", err); log.apiSuccess("GET - 200", "/users");
const mlog = createLogger("MyModule");      // [MyModule] [INFO] ...
```

Filter at runtime:
`localStorage.setItem("LOG_LEVEL","warn")`,
`localStorage.setItem("LOG_FILTER","useApi,Db")`.
Default: `debug` in dev, `warn` in prod. Full doc: `~/docs/LOG_JS.md`.

## Root `<Provider>`

Single root provider that mounts the whole context stack
(ErrorBoundary > LibConfigProvider > ReduxProvider > GlobalStatesProvider
> ApiProvider > Router > NavigationProvider > AnimatePresence) plus
`<Toaster>`, optional `<UpdatePrompt>` and debug helpers. Props:
`config`, `onError`, `errorFallback`, `ErrorFallbackComponent`,
`pwaUpdate`, `debug`.

`<ConfirmProvider>` and `<I18nextProvider>` are NOT auto-mounted -
wire them manually under `<Provider>`.

Full reference (mount order, sub-providers, PWA Updates, error
boundary, toaster, debug, standard mount pattern): `docs/provider.md`.

## Authentication & Onboarding

Ready-to-use bricks for the Dolibarr+smartAuth flow.

### `<RouteGuard>`

Replaces per-project `Public/PrivatePagesLayout` and
`Pre/PostDeviceIdentificationLayout`. Reads `useApi().user` and
`user.deviceOptions`. Modes (orthogonal auth + device):

| Mode | Default `redirectTo` |
|------|----------------------|
| `requireAuth`                | `/login` |
| `requireGuest`               | `/` |
| `requireDeviceIdentification`| `/` (already identified) |
| `requireDeviceIdentified`    | `/device-identification` |

Device modes imply `requireAuth` (redirect to `/login` if no user
regardless of `redirectTo`). Conflicting flags warn via `console.warn`,
first-listed wins. Works as element (`<Outlet/>`) or wrapping children.

### `<LoginComponent>`

Generic Dolibarr login form (email/password + optional entity Select +
opt-out shared-device checkbox) with built-in smartAuth QR pairing flow.

Props: `onSuccess`, `onError`, `enableQrPair` (default true),
`deviceLabel`, `qrPollIntervalMs`, `qrTimeoutMs`, `showEntities`
(default true), `showSharedDevice` (default true: ticked = shared /
untrusted access, credentials NOT persisted; payload sent to api.login
is `rememberMe: !sharedDevice`), `labels`, `getErrorLabel`,
`getQrErrorLabel`, `entitiesTimeoutMs`/`loginTimeoutMs` (override
`abortTimeoutMs`), and styling slots: `containerProps`, `formProps`,
`inputProps`, `passwordInputProps`, `selectProps`, `booleanProps`,
`submitButtonProps`, `scanQrButtonProps`, `qrSeparatorProps`,
`qrOverlayProps`, `errorAlertProps`, `qrErrorAlertProps`.

Behaviour: HTML5 `required` on email/password ; QR scan -> claim ->
poll loop with global timeout + cancel ; idempotence guard (rejects
duplicate scans, fixes Android autofocus 409 double-claim) ;
full-screen overlay during claim/poll (camera closes after scan).

### `<DeviceIdentificationComponent>`

Form to associate a physical device via smartAuth `device` endpoint.
Reads `useApi().user.deviceOptions`:
- empty / absent -> only the "label" input (first device)
- present -> radio picker of existing devices + "new device" option

Props: `onSuccess`, `onError`, `labels`, `noDeviceValue` (default
`"noDevice"`), `icon` (null hides icon+title), `identifyTimeoutMs`,
`getErrorLabel`, plus styling slots (`containerProps`, `formProps`,
`iconWrapperProps`, `iconProps`, `titleProps`, `descriptionProps`,
`devicesCheckerProps`, `labelInputProps`, `submitButtonProps`,
`errorAlertProps`).

Submit calls `api.identifyDevice({ label, uuid })`. The smartAuth
endpoint clears `user.deviceOptions` from `gst.local` on its own - DO
NOT dispatch a redundant `updateUser({ deviceOptions: undefined })`
(historical no-op).

### `<BarcodeScanner>`

Fullscreen scanner. Lazy-loads `html5-qrcode` (~150kB) on first open.
Falls back to manual entry on permission denial.
Props: `open`, `onScan`, `onClose`, `continuous`, `formats` (default 7
common formats), `debounceMs`, `labels`.

### `<AboutModal>`

Modal showing app name + version + custom fields, with manual SW update
check button.
Props: `open`, `onClose`, `appName`, `version`, `fields:[{label,value}]`,
`labels`.

## Web Push Notifications

Two complementary bricks for VAPID Web Push against smartAuth `/push/*`
endpoints. Full doc: `docs/push-notifications.md`.

### `usePushNotifications` (`hooks/global`)

Browser-side push subscription lifecycle, consumed through `useApi`.
Returns state `permission` (`'default'|'granted'|'denied'|'unsupported'`),
`isSubscribed`, `isLoading`, `error` (English), `subscriptions`, and
actions `subscribe(label?)`, `unsubscribe()`, `refreshSubscriptions()`.

- Support detection on mount: missing `serviceWorker`/`PushManager`/
  `Notification` -> `permission='unsupported'`, actions are no-ops that
  set `error` and log. Never throws.
- `subscribe()`: requestPermission -> `GET push/vapid-public-key`
  (public, via `api.public.get`) -> `pushManager.subscribe` ->
  `POST push/subscribe`.
- `unsubscribe()`: `subscription.unsubscribe()` AND
  `DELETE push/unsubscribe` (both sides, each guarded + logged).
- Listens for SW `push-resubscribe` postMessage and replays the
  authenticated `POST push/subscribe` (the SW cannot re-register itself).
- useApi contract: URLs have NO leading slash (ky `prefixUrl`); bodies
  go via the `json:` option; `api.get/post/del` already return parsed JSON.

### `<NotificationToggle>` (`others/`)

Self-contained enable/disable control backed by the hook. Renders an
informative message for `unsupported`/`denied`, a checkbox toggle for
`default`/`granted` (disabled while `isLoading`), surfaces `error`.
Props: `label` (forwarded to `subscribe`), `labels`, `containerProps`,
`className`. i18n: English `DEFAULT_LABELS` + the 8 locale bundles
(`NotificationToggle` namespace).

Out-of-repo deps (degrade gracefully if missing): smartAuth backend
`/push/*` + VAPID keys, and the smartboot Service Worker `push` /
`notificationclick` / `pushsubscriptionchange` handlers.

## `<ProductCategoryBrowser>`

Fullscreen modal to browse a product catalog by category and pick
products (invoice/quote lines, photo annotations, inventory, ...).

Modes: `select` (no confirm step, returns `product`),
`quantity` (`{product,qty}`), `quantity-discount`
(`{product,qty,discountPercent,computedTotal}`). With `multiple={true}`
keeps a footer cart and emits an array on validation.

Adapter pattern (no Dexie hard-coupling):
```js
productsAdapter   = { search({categoryId,query,type}), getById(id) }
categoriesAdapter = { getRoots(type), getChildren(parentId), getById(id) }
```
`categoryId`: `undefined` = all, `null` = uncategorized, `<number>` = filter.
`query` is debounced 300ms ; `type` is passthrough (Dolibarr 0=product / 1=service).

Dexie helper for offlinepropale-style schemas:
`createDexieProductCategoryAdapters({ db })` - tables `products`,
`categories`, `productDocuments`, `categoryDocuments` ; M2M via
`product.categories[]` ; `for_sale`/`tosell`/`status_sell` filter ;
type aliases `"product" <-> [0,"0","product"]` ; bulk image join
attached as `image:{blob}`. All names overridable. For >5000 products
pass `attachImages:false` and use a custom `renderItem`.

Editing existing line: pass `prefillProduct` + `defaultQty` +
`defaultDiscountPercent` -> opens directly on the confirm step. User
can hit "Changer de produit" to swap (qty/discount reset to new
defaults).

Pricing hook `getProductPriceDisplay(product, customerContext) ->
{ unitPrice, displayPrice?, displayPriceLabel?, currency, badge?, ttc? }`.
`displayPriceLabel` rendered verbatim if present, else
`Number(displayPrice ?? unitPrice).toFixed(2) + currency`.
`badge` shows as a discount pastille. `customerContext` is free-form
(passed back to the hook).

Ships its own fullscreen modal shell (not `<Modal size="full">` whose
`lg:max-w-4xl` cap doesn't suit a catalog grid).

## `<PhotoAnnotator>`

Place markers on a photo, each marker linked to a consumer-defined
domain object (note, product, alert, sub-photo, ...).

Modes (auto-detected, mutually exclusive):
- **Controlled**: `annotations` + `onChange`.
- **Event-based**: any of `onCreate`/`onUpdate`/`onMove`/`onDelete`/
  `initialAnnotations` triggers it. `onCreate` must return the
  persisted annotation `{ ...staged, id }`. Pass a fresh
  `initialAnnotations` ref to resync.

Optimistic semantics: `onCreate` rejection removes the optimistic
entry ; other rejections only log (consumer must resync). `onMove`
omitted -> drag end falls back to `onUpdate`.

Annotation shape (rest is consumer-defined):
```js
{ id, type, x /* 0..100 */, y /* 0..100 */, payload? }
```

Type registry `annotationTypes[type] = TypeDef`:
```js
{
  label, icon, color?, newPayload?,
  renderMarker(annotation, { num, selected, dragging, readOnly }),
  renderEditor(annotation, { onSave(partial), onCancel, typeDef }),
  renderListItem?(annotation, ctx),  // fallback exists
  headlessEditor?,                    // mounts editor without modal chrome
}
```
`onSave(partial)` shallow-merges. `headlessEditor:true` is the pattern
for "trigger file input -> save" (e.g. photo type calling
`fileInput.click()` in `useEffect`). A "product" type composes by
delegating its `renderEditor` to `<ProductCategoryBrowser>`.

Sub-photos: define a `photo` type whose editor stores a blob and saves
`{ targetPhotoId }` ; react to `onAnnotationActivate` (double-tap) to
navigate. Component stays single-image - arborescence/persistence in
the app.

Interactions: long-press background -> `TypePicker` (or direct editor
if 1 type) ; "+ Ajouter" toolbar -> creates at center, persists, opens
editor ; tap -> `onAnnotationSelect` ; double-tap -> `onAnnotationActivate` ;
long-press marker -> drag (`onChange` once on `pointerup`) ; pinch/wheel
zoom (clamped `[minZoom,maxZoom]`) ; one-finger drag pans when zoomed ;
edit/delete buttons in list (`window.confirm` for delete) ; `readOnly`
disables add/edit/delete/drag (tap/double-tap still fire).

`listPosition`: `"bottom"` (default), `"right"` (sidebar), `"off"`.
`src` accepts URL string OR Blob/File (auto `createObjectURL` /
`revokeObjectURL` via `useImageUrl`).

## `<PhotoEditor>` + `lib/imageEditor`

Fullscreen, **non-destructive** photo editor for field apps (crop a
receipt, deskew a document, scan-clean an invoice). Two layers:

- **`lib/imageEditor/`** - framework-agnostic canvas engine (NO React).
  Flat service module (mirrors `print/`/`sync/`): `geometry.js` (pure
  maths: rotation dims, largest inscribed rect, homography DLT),
  `pixels.js` (pure: grayscale, Otsu, auto-contrast bounds, CSS filter
  string), `operations.js` (extensible op **registry** + 8 built-ins),
  `pipeline.js`, `loadImage.js` (EXIF-aware `createImageBitmap`),
  `autoDetect.js`, `canvas.js`. Exposed via the top-level barrel:
  `applyImageEdits(source, operations, output) -> Blob`,
  `detectDocumentQuad(imageData) -> corners|null`, `registerOperation`.
- **`others/PhotoEditor/`** - the React UI (own fullscreen shell like
  `ProductCategoryBrowser`, not `<Modal>`). Tools: crop+ratios, rotate90,
  flip, free straighten, **perspective 4-corner** (with pure-JS
  **edge auto-detect** that prefills the corners), light/color sliders,
  auto-enhance, B&W, **scan** preset (Otsu binarize).

**Edit = an ordered list of operations** (the "recipe"). The engine sorts
them into a canonical order (geometry before color) and bakes them on the
full-res source at export. `onSave(blob, { operations })` returns both the
baked Blob and the re-applicable recipe. Op shapes:
`rotate90{steps}`, `straighten{angle}`, `flip{flipH,flipV}`,
`perspective{corners[4] TL,TR,BR,BL normalized}`, `crop{rect}`,
`autoEnhance`, `adjust{brightness,contrast,saturation,temperature}`,
`scan{binarize}`.

Extensibility: a new tool = one `registerOperation(type, { stage, apply })`
+ its UI control; the pipeline never changes. Risk-bearing logic
(geometry/pixels/detection) is **pure and unit-tested**; the component is
tested with the engine mocked (happy-dom has no canvas) - keep that split.
i18n: English `DEFAULT_LABELS` in `props.js` + a `PhotoEditor` namespace in
all 8 locale bundles. Boundary with `PhotoAnnotator`: PhotoEditor **bakes
pixels** (new Blob), PhotoAnnotator **overlays structured markers** on an
unchanged image - they compose (capture -> edit -> annotate -> upload).
Full reference: `docs/photo-editor.md`.

## Print Engine (`lib/print`)

Generic ESC/POS printer stack for thermal receipt / kitchen / drawer
output, ported from smartpos and re-exported via the top-level barrel.

Layout (flat, mirrors `lib/sync/`):
```
lib/print/
  ticketBuilder.js   # ESC/POS command builder (Uint8Array)
  webUSBPrinter.js   # WebUSB driver
  browserPrint.js    # window.print via hidden iframe
  printService.js    # queue + retry + renderer registry
  usePrintService.jsx
  labels.js          # DEFAULT_LABELS (exported as PRINT_DEFAULT_LABELS)
  index.js
```

### Classes (framework-agnostic)

- `TicketBuilder(charsPerLine)`: fluent API (`text`, `line`, `separator`,
  `bold`, `doubleHeight`, `alignCenter`, `cut`, `openDrawer`, `qrCode`,
  `build` -> `Uint8Array`).
- `WebUSBPrinter`: `connect()` / `send(data)` / `disconnect()` /
  `isConnected()` / static `isSupported()`. Requires a user gesture for
  device selection.
- `browserPrint(html)`: Promise-based iframe + `window.print()`.
- `PrintService({ labels? })`:
  - `registerJobType(type, { escpos, html })` - register renderers
    upfront, MUST be called before `enqueue` of that type
  - `enqueue(type, data, printer)` - returns Promise, runs through queue
    with retries (3 attempts, 1s delay)
  - `pendingCount` - getter on the queue length
  - `cleanup()` - disconnects USB

`printer` config: `{ protocol: "usb"|"network"|"browser", paper_width:
58|80, connection?: "ip:port" }`. `network` always rejects with
`error.code === "network_not_supported"` (PWA cannot open raw TCP).

All runtime errors thrown by `enqueue` carry a machine-readable `code`:
`unknown_job_type`, `no_escpos_renderer`, `unsupported_protocol`,
`network_not_supported`. Useful in `try/catch` to map to UI labels.

### `usePrintService({ templates, labels })` (React binding)

```js
import { usePrintService } from "@cap-rel/smartcommon";

const { enqueue, pendingCount, service } = usePrintService({
    templates: {
        sale: { escpos: (data, b) => b.text("..."), html: (d) => `<p>...</p>` },
        drawer: { escpos: (_, b) => b.openDrawer() },
    },
    labels: { unknownJobType: (t) => `Type inconnu : ${t}` },
});
await enqueue("sale", saleData, printerConfig);
```

Hook owns the service ref for the hook's lifetime, registers every entry
in `templates` at first render, and calls `cleanup()` on unmount.
`pendingCount` is reactive (state-backed); `service` is the raw instance
escape hatch.

### i18n

Default labels are English and live in `lib/print/labels.js`. Override
individual entries via the `labels` option of `PrintService` /
`usePrintService`. Each entry is either a string or a function: see the
DEFAULT_LABELS shape. `PRINT_DEFAULT_LABELS` is re-exported from the
barrel for consumers that want to extend rather than replace.

## `<NumericPad>` (`lib/components/form`)

Tactile numeric keypad, controlled by `value` / `onChange`. Modes
`"integer"` (default) and `"decimal"` (comma separator, max 2 decimals).
Optional `onConfirm` shows a footer validate button.

Props:
- `value: string`, `onChange(v)`, `onConfirm?(v)`
- `mode: "integer"|"decimal"`, `label?`
- `labels?` (override `confirm`, `backspace`, `decimalSeparator`,
  `digit(key)`)
- `backspaceIcon?` / `confirmIcon?` (override the default `react-icons`
  defaults)
- `containerProps?` (variantMerger slot)

Backspace on a single-char value resets to `"0"` (placeholder semantics
preserved from smartpos). Decimal separator is `,` (European).

## `useBarcodeScanner({ onScan, enabled })` (`lib/hooks/local`)

Listens for rapid keydown sequences on `document` (USB scanner emulating
a keyboard) and calls `onScan(barcode)` on Enter. Detection thresholds:
inter-key delay < 50ms, min length 4, buffer auto-clears after 150ms of
inactivity. Events from INPUT/TEXTAREA/SELECT are ignored. Disable via
`enabled: false`.

## SmartAuth Integration Notes

### QR pairing endpoints (in `useApi`)

```js
// 1. Mobile claims pairing_id displayed by PC -> POST qr-pair/{id}/claim
const { claim_token } = await api.claimQrPair(pairingId,
  { device_label, device_uuid });
// 2. Poll until PC user confirms -> POST qr-pair/{id}/poll
const data = await api.pollQrPair(pairingId, claim_token);
// status: 'pending' (continue) | 'cancelled'|'expired' (stop)
//       | 'consumed' (logged in: access_token, refresh_token, expires_in, device_uuid)
```

On `consumed`, the user is **persisted to local storage automatically**
(QR pairing = trusted device by design). No auth helper to call.

For full UX use `<LoginComponent enableQrPair />`. Backend reference:
`~/dev/smartauth/api/QrPairController.php`.

### `api.login` consumer enrichment hook (`onLoginPersist`)

`useApi.login` writes the user to `gst` immediately after the backend
response. The user it writes is **minimal** (tokens, expiry,
device-pick flags) - no `settings`, no `config`, nothing that lives in
IndexedDB. If `<RouteGuard>` is mounted on the next render it will
redirect to the protected route before the consumer has had time to
merge the persisted settings, and any page that destructures
`user.settings.X` crashes.

Wire the optional `onLoginPersist` callback on `libConfig.api` to
close the race:

```js
<LibConfigProvider config={{
  api: {
    prefixUrl: "...",
    onLoginPersist: async (baseUser) => {
      // baseUser = mappedData + { rememberMe, tokenExpiry,
      //                            needsDevicePick, existingUserDevices }
      const local = await dbUsers.get(baseUser.id);
      return {
        ...baseUser,
        settings: local?.settings ?? defaultSettings,
        config: local?.config ?? defaultConfig,
        versions: local?.versions,
      };
    },
  },
}}>
```

Contract:
- `useApi.login` `await`s the callback BEFORE writing the user to gst.
- The returned object is shallow-merged over `baseUser`, so auth
  fields are preserved if the callback returns a partial object.
- If the callback throws, login still resolves and the minimal
  `baseUser` is written (degraded mode), with a `log.error`.
- Not registered -> exact previous behaviour (back-compat).

Reference: `src/lib/hooks/global/useApi/context.jsx` and the
sequencing tests in `src/lib/hooks/global/useApi/login.test.jsx`.

### `useApi` error enrichment

`baseApi.beforeError` (public + private) parses the response body and
exposes:
- `error.apiMessage` - from `body.error || body.message`
- `error.apiCode` - machine code from `body.error` (e.g.
  `"pairing_not_claimable"`, `"rate_limited"`)

Useful in custom `getErrorLabel` / `getQrErrorLabel` callbacks.

### Reserved parameter names

In smartAuth API routing, `user_id` is overwritten by the authenticated
user's id. To pass a different user id (e.g. add another user to an
event) use a different name: `target_user_id`, `add_diver_id`, etc.

### Sync engine limitations

- `syncUpdate()` requires the entity to already exist locally - throws
  "Entity not found" otherwise.
- For "may not exist yet" caches, check via `getEntity()` first.
- An `upsert()` would simplify cache patterns (not implemented).

## Testing Notes

### Vitest `isolate: true` (do NOT change)

Setting `isolate: false` was found to leak `vi.mock()` factories across
files: a previously-resolved module is cached without its mock and
shadows the next file's mock. Symptom: tests pass in isolation but fail
in the full suite.

### `lib/components` <-> `lib/hooks` import cycle

`Input` (and other form primitives) imports `Label` from `lib/components`,
the same barrel re-exporting `Input`. Under Vitest this can produce a
stale binding (`Label === undefined`) so `<Input>` renders nothing.

Workaround in tests: mock `lib/components` to stub form primitives with
HTML equivalents (`Input`, `Select`, `Boolean`, `Button`). See
`LoginComponent/index.test.jsx`. Real fix would be to import from
path-source (`lib/components/form/tools/Label`) - separate refactor.

### `.stories.js` cannot contain JSX

Storybook's `inject-export-order-plugin` parses `.stories.js` as plain
JS. Put JSX decorators in a sibling `decorators.jsx` and import them.

### Lazy-loaded modules and `waitFor`

`BarcodeScanner` does `await import("html5-qrcode")` in `useEffect`. The
first `waitFor()` (default 1000ms) may time out because Vite has to
transpile the real package on first access. Warm up:
```jsx
beforeAll(async () => { await import("html5-qrcode"); });
```

## Notes

- Comments in English only ; French text MUST keep accents (é è ê à â ô î ï ç).
- Never modify code without explicit user approval ("OK" / "go").
- `package-lock.json` is NOT committed (this is a library).
- Always use `twMerge` when concatenating default classes with
  consumer-provided `className`.
- `git config core.fileMode false` to ignore mode-only diffs.
- Lodash 4.17.21 has a moderate Prototype Pollution in
  `_.unset`/`_.omit` (no fix yet ; low risk if unused).
