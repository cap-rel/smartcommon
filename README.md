# SmartCommon

That project include all dolibarr objects in native version for mobile devices.

For example you can find a `Calendar` object defined into `src/components/form/Calendar`

## npm package

SmartCommon is available as a npm package, you can add it with :

1. add cap-rel registry into your `.npmrc` file

```
@cap-rel:registry=https://inligit.fr/api/v4/projects/197/packages/npm/
```

2. then add it into your `package.json` like other packages :

```
  "dependencies": {
    .../...
    "@cap-rel/smartcommon": "^1.0.47",
    .../...
  }
```

That package is auto build thanks to gitlab CI/CD https://registry.inligit.fr/cap-rel/dolibarr/smartmaker/smartcommon/-/pipelines

and then is auto published on gitlab registry https://registry.inligit.fr/cap-rel/dolibarr/smartmaker/smartcommon/-/packages

## Documentation

Component-specific guides live in [`docs/`](./docs) (written in French):

Application setup

- [`provider.md`](./docs/provider.md) - root `<Provider>`, configuration, app-wide labels, PWA update and install prompts
- [`route-guard.md`](./docs/route-guard.md) - `<RouteGuard>`, auth and device-identification route guards
- [`viewport.md`](./docs/viewport.md) - mobile / desktop UI mode detection and override
- [`navigation.md`](./docs/navigation.md) - Navbar, Tabbar and Sidebar navigation chrome
- [`desktop.md`](./docs/desktop.md) - desktop components and hooks: DesktopHeader, DesktopSidebar, DesktopSplit, UserMenu, Dropdown, ContextMenu, useHotkeys
- [`push-notifications.md`](./docs/push-notifications.md) - Web Push subscription hook and `<NotificationToggle>`

Data, network and offline

- [`network.md`](./docs/network.md) - HTTP requests via `useApi`
- [`offline.md`](./docs/offline.md) - offline-first patterns
- [`upload.md`](./docs/upload.md) - photo uploads from a phone: image preparation under the server limits, timeout and retry, failure reading
- [`upload-queue.md`](./docs/upload-queue.md) - `useUploadQueue`, offline-first upload queue persisted in IndexedDB
- [`quality.md`](./docs/quality.md) - defensive programming guide and lint rules

Layout and dialogs

- [`page.md`](./docs/page.md) - `<Page>`, root container of a screen
- [`block.md`](./docs/block.md) - `<Block>`, titled page section
- [`list-item.md`](./docs/list-item.md) - `<ListItem>`, list row as a button or a link
- [`data-table.md`](./docs/data-table.md) - `<DataTable>`, column-driven data table
- [`modal.md`](./docs/modal.md) - `<Modal>`, generic accessible dialog
- [`popup.md`](./docs/popup.md) - `<Popup>`, legacy dialog
- [`panel.md`](./docs/panel.md) - `<Panel>`, side drawer
- [`stepper.md`](./docs/stepper.md) - `<Stepper>`, step indicator

Forms and display

- [`form.md`](./docs/form.md) - `<Form>`, fields, validation and accessibility of form controls
- [`formats.md`](./docs/formats.md) - display formatters (`formats/*`)
- [`address-input.md`](./docs/address-input.md) - `<AddressInput>` with autocomplete
- [`array.md`](./docs/array.md) - `<Array>` tag input
- [`calendar.md`](./docs/calendar.md) - `<Calendar>` date picker
- [`editor.md`](./docs/editor.md) - `<Editor>` Markdown editor
- [`files-uploader.md`](./docs/files-uploader.md) - `<FilesUploader>` file picker
- [`annotated-photos-uploader.md`](./docs/annotated-photos-uploader.md) - `<AnnotatedPhotosUploader>` multi-photo field with annotations
- [`gps.md`](./docs/gps.md) - `<Gps>` position capture field
- [`searchable-select.md`](./docs/searchable-select.md) - `<SearchableSelect>`
- [`timer.md`](./docs/timer.md) - `<Timer>` duration field

Business components

- [`login-component.md`](./docs/login-component.md) - `<LoginComponent>`, Dolibarr login with smartAuth QR pairing
- [`device-identification-component.md`](./docs/device-identification-component.md) - `<DeviceIdentificationComponent>`
- [`device-picker.md`](./docs/device-picker.md) - `<DevicePicker>`, post-login device choice
- [`about-modal.md`](./docs/about-modal.md) - `<AboutModal>`
- [`barcode-scanner.md`](./docs/barcode-scanner.md) - `<BarcodeScanner>` full screen or embedded scanner
- [`calculator.md`](./docs/calculator.md) - `<Calculator>` floating calculator
- [`product-category-browser.md`](./docs/product-category-browser.md) - `<ProductCategoryBrowser>` (catalog browser modal) + `createDexieProductCategoryAdapters` helper
- [`photo-annotator.md`](./docs/photo-annotator.md) - `<PhotoAnnotator>` (markers on a photo, controlled or event-based, type registry with optional headless editors)
- [`photo-editor.md`](./docs/photo-editor.md) - `<PhotoEditor>` and the `imageEditor` engine

For storybook stories: `npm run storybook`.