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

Component-specific guides live in [`docs/`](./docs):

- [`network.md`](./docs/network.md) - HTTP requests via `useApi`
- [`offline.md`](./docs/offline.md) - offline-first patterns
- [`quality.md`](./docs/quality.md) - defensive programming guide
- [`product-category-browser.md`](./docs/product-category-browser.md) -
  `<ProductCategoryBrowser>` (catalog browser modal) +
  `createDexieProductCategoryAdapters` helper
- [`photo-annotator.md`](./docs/photo-annotator.md) -
  `<PhotoAnnotator>` (markers on a photo, controlled or event-based,
  type registry with optional headless editors)

For storybook stories: `npm run storybook`.