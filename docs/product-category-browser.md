# ProductCategoryBrowser

`<ProductCategoryBrowser>` est une modale plein écran qui laisse
l'utilisateur naviguer dans un catalogue produit par catégorie et
sélectionner un (ou plusieurs) produit. Utilisable pour toute
application qui doit rattacher des produits à un objet métier : lignes
de devis, annotations photo, inventaires d'intervention, estimations
garage, etc.

## Import

```jsx
import {
  ProductCategoryBrowser,
  createDexieProductCategoryAdapters,
} from "@cap-rel/smartcommon";
```

## Trois modes

| Mode | Étape de confirmation | Payload de `onSelect` (single) |
|---|---|---|
| `select` | aucune | `product` |
| `quantity` | input quantité | `{ product, qty }` |
| `quantity-discount` | quantité + remise + total | `{ product, qty, discountPercent, computedTotal }` |

Avec `multiple={true}`, la modale reste ouverte et accumule les
sélections dans un panier en pied. `onSelect` est appelé une seule fois
à la validation finale, avec un tableau du même format.

## Schéma minimal des produits / catégories

Smartcommon impose seulement :

```js
Product  = { id, label, ref?, image?: { url|blob, alt? }, ... }
Category = { id, label, parent?, color?, image?: { url|blob, alt? }, ... }
```

Tout le reste (`price`, `tva_tx`, custom fields, etc.) reste dans
l'objet et est passé tel quel à `getProductPriceDisplay`, `renderItem`
et `onSelect`.

## Pattern Adapter (pas de couplage Dexie en dur)

Les données sont récupérées via deux adapters fournis par
l'application. Chaque app branche la sienne :

```js
productsAdapter = {
  search: ({ categoryId, query, type }) => Promise<Product[]>,
  getById: (id) => Promise<Product>,
}
categoriesAdapter = {
  getRoots: (type) => Promise<Category[]>,
  getChildren: (parentId) => Promise<Category[]>,
  getById: (id) => Promise<Category>,
}
```

Conventions sur `categoryId` :

- `undefined` -> tous les produits
- `null` -> produits sans catégorie
- `<number>` -> produits de cette catégorie

`query` est le texte de recherche libre (debouncé 300 ms côté composant).
`type` est un filtre passe-plat (par exemple Dolibarr 0=produit /
1=service), interprété par l'adapter.

## Helper Dexie pour les apps offline-first

Pour les applications qui utilisent le hook `useDb()` smartcommon avec
le schéma offlinepropale (tables `products`, `categories`,
`productDocuments`, `categoryDocuments`), un helper monte les adapters
en une ligne :

```jsx
import db from "src/db";
import {
  ProductCategoryBrowser,
  createDexieProductCategoryAdapters,
} from "@cap-rel/smartcommon";

const { productsAdapter, categoriesAdapter } =
    createDexieProductCategoryAdapters({ db });

<ProductCategoryBrowser
  open={open}
  onClose={() => setOpen(false)}
  mode="quantity-discount"
  productsAdapter={productsAdapter}
  categoriesAdapter={categoriesAdapter}
  productType={0}                                      // Dolibarr "produit"
  customerContext={{ priceLevel: customer.priceLevel }}
  getProductPriceDisplay={(p, ctx) => ({ ... })}
  onSelect={(payload) => addLineToInvoice(payload)}
/>
```

Le helper est calibré sur le schéma offlinepropale :

- Tables `products`, `categories`, `productDocuments`, `categoryDocuments`
- Relation produit-catégorie via tableau dénormalisé
  `product.categories[]` (pas de table de jointure)
- Filtre `for_sale` / `tosell` / `status_sell` pour exclure les
  produits inactifs
- Alias de type catégorie : `"product" <-> [0, "0", "product"]`,
  `"customer" <-> [2, "2", "customer"]`
- Jointure des images : bulk-load depuis `productDocuments` /
  `categoryDocuments` filtrés sur `type === "image"`, attaché en tant
  que `image: { blob }` sur chaque entité

Toutes les options (noms de tables, champs, filtres, comparateurs de
type) sont surchargeables :

```js
createDexieProductCategoryAdapters({
  db,
  productsTable: "products",
  categoriesTable: "categories",
  productDocumentsTable: "productDocuments",
  categoryDocumentsTable: "categoryDocuments",
  productImageForeignKey: "product_id",
  categoryImageForeignKey: "category_id",
  isProductActive: (p) => /* custom */,
  matchesCategoryType: (catType, requested) => /* custom */,
  attachImages: true,                         // false pour gros catalogues
});
```

Pour des catalogues très volumineux (> 5000 produits), passer
`attachImages: false` puis fournir un `renderItem` qui charge les
vignettes à la volée par tuile.

## Hook prix : `getProductPriceDisplay`

```js
getProductPriceDisplay: (product, customerContext) => ({
  unitPrice: 12.50,           // prix de référence
  displayPrice: 10.00,        // après niveau client / promo / etc.
  displayPriceLabel: "10,00 EUR",  // optionnel : chaîne déjà formatée, prioritaire
  currency: "EUR",
  ttc: false,                 // ou true selon la convention de l'app
  badge: "-20%",              // optionnel : pastille sur la tuile
})
```

Le composant rend `displayPriceLabel` tel quel s'il est fourni, sinon
fait un fallback brut (`Number(...).toFixed(2) + currency`).

`customerContext` est un objet libre : on y met l'id client, le niveau
de prix, la devise d'affichage, etc. Le composant le passe tel quel au
hook prix.

## Édition d'une ligne existante (`prefillProduct`)

Pour rouvrir le browser sur un produit déjà choisi (édition d'une
ligne, modification d'une annotation), passer `prefillProduct` couplé à
`defaultQty` / `defaultDiscountPercent`. Le browser saute directement à
l'étape de confirmation, pré-remplie :

```jsx
<ProductCategoryBrowser
  open={open}
  mode="quantity-discount"
  prefillProduct={annotation.product}      // saute au confirm
  defaultQty={annotation.qty}              // pré-remplit la quantité
  defaultDiscountPercent={annotation.remise_percent}
  onSelect={(payload) => updateAnnotation(annotation.id, payload)}
  onClose={...}
/>
```

L'utilisateur peut toujours cliquer "Changer de produit" pour revenir à
la grille et changer le produit ; les champs quantité / remise sont
alors réinitialisés aux valeurs par défaut du nouveau produit.

## Multi-sélection

`multiple={true}` ouvre un mode "panier" :

- En `mode="select"` : tap sur un produit l'ajoute / le retire du
  panier (toggle), bouton "Valider (n)" en pied
- En `mode="quantity"` / `quantity-discount"` : chaque sélection ouvre
  le step de confirmation, "Ajouter" l'ajoute au panier et revient à
  la grille, le bouton "Valider (n) - Total xx EUR" en pied finalise

`onSelect` reçoit un tableau de payloads à la validation finale.

## Slot `renderItem`

Pour personnaliser l'apparence d'une tuile produit :

```jsx
renderItem={(product, { selected, cartQty, priceLabel, displayPrice }) => (
  <CustomTile product={product} selected={selected} ... />
)}
```

Sinon une tuile par défaut affiche image (placeholder si absente), ref,
label, prix.

## Props complètes

```js
{
  open: boolean,
  onClose: () => void,

  mode: "select" | "quantity" | "quantity-discount",
  multiple: boolean,

  productsAdapter: { search, getById },
  categoriesAdapter: { getRoots, getChildren, getById },

  productType: any,                           // passe-plat aux adapters
  customerContext: object,                    // passé à getProductPriceDisplay

  getProductPriceDisplay: (product, ctx) => DisplayObject,
  renderItem: (product, ctx) => ReactNode,

  defaultQty: number,                         // défaut 1
  defaultDiscountPercent: number,             // défaut 0

  prefillProduct: object,                     // saute au confirm step

  showAllProductsTile: boolean,               // tuile "Tous les produits", défaut true
  showUncategorizedTile: boolean,             // tuile "Sans catégorie", défaut true

  onSelect: (payload) => void,                // forme dépend de mode + multiple

  labels: object,                             // override DEFAULT_LABELS

  // Slots de styling
  containerProps, headerProps, titleProps,
  breadcrumbProps, searchInputProps,
  categoryGridProps, productGridProps,
  confirmStepProps, cartProps,
  confirmButtonProps, cancelButtonProps,
}
```

## Étiquettes par défaut

```js
{
  title: "Sélectionner un produit",
  confirmTitle: "Confirmer la sélection",
  searchPlaceholder: "Rechercher...",
  allCategoriesCrumb: "Toutes les catégories",
  allProductsTile: "Tous les produits",
  uncategorizedTile: "Sans catégorie",
  noCategories: "Aucune catégorie disponible",
  noProducts: "Aucun produit dans cette catégorie",
  noSearchResults: "Aucun résultat",
  quantity: "Quantité",
  discount: "Remise",
  totalHT: "Total HT",
  confirmLabel: "Confirmer",
  addLabel: "Ajouter",
  cancelLabel: "Annuler",
  changeProductLabel: "Changer de produit",
  validateLabel: "Valider",
  cartEmpty: "Aucun produit sélectionné",
  removeLabel: "Retirer",
  pageLabel: "Page {current} / {total}",
  loadError: "Impossible de charger les données",
}
```

## Tests

`src/lib/components/others/ProductCategoryBrowser/index.test.jsx` couvre
18 cas incluant le rendu, la navigation par catégories, les tuiles
spéciales, la recherche debouncée, les trois modes, la multi-sélection,
l'édition via `prefillProduct`, et l'override des étiquettes.
