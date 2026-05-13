# PhotoAnnotator

`<PhotoAnnotator>` permet de poser des marqueurs sur une photo, chaque
marqueur étant lié à un objet métier que le consommateur définit (note,
produit, alerte, sous-photo, etc.).

Cas d'usage typiques :

- offlinepropale : pose de produits / services sur une photo de chantier
  pour générer un pré-devis
- smartintervention : un technicien identifie le filtre clim usé, la
  mousse à remplacer
- garagiste : constat des pièces à changer sur une voiture
- expertise bâtiment : repérage de fissures, défauts, avec sous-photo de
  détail

## Import

```jsx
import { PhotoAnnotator } from "@cap-rel/smartcommon";
```

## Schéma d'une annotation

Smartcommon impose ce contrat minimal, le reste est libre :

```js
{
  id: string|number,    // identifiant stable
  type: string,         // clé du registre annotationTypes
  x: number,            // 0..100 (pourcentage horizontal)
  y: number,            // 0..100 (pourcentage vertical)
  payload?: object,     // contenu libre, possédé par le type
}
```

Le composant calcule en interne un `num` séquentiel pour l'affichage, mais
ne le persiste jamais : il est dérivé de la position dans le tableau.

## Registre des types (`annotationTypes`)

Chaque entrée définit comment un type est rendu et édité :

```js
{
  label: "Note",                                       // affiché dans le TypePicker / liste
  icon: <FaCommentDots />,                             // affiché dans le TypePicker
  color: "#F59E0B",                                    // hex, utilisé par le list item par défaut
  newPayload: () => ({ description: "" }),             // payload initial à la création
  renderMarker: (annotation, ctx) => <jsx />,          // ctx = { num, selected, dragging, readOnly }
  renderEditor: (annotation, ctx) => <jsx />,          // ctx = { onSave(partial), onCancel, typeDef }
  renderListItem: (annotation, ctx) => <jsx />,        // optionnel, sinon item générique
  headlessEditor: false,                               // voir section dédiée
}
```

`onSave(partial)` fait un shallow-merge sur l'annotation en cours. La
forme habituelle est `{ payload: { ... } }` puisque le type possède
intégralement son payload.

## Deux modes

### Mode `controlled` (état en mémoire, simple)

Le consommateur tient le tableau `annotations`, chaque mutation passe par
`onChange` qui reçoit un nouveau tableau complet.

```jsx
const [annotations, setAnnotations] = useState([]);

<PhotoAnnotator
  src={photo.url}
  annotations={annotations}
  onChange={setAnnotations}
  annotationTypes={types}
/>
```

Bon pour des annotations transitoires (en mémoire, pas persistées).

### Mode `event-based` (backend persistant, recommandé pour Dexie/API)

Le composant tient son état interne, le consommateur écoute les
mutations granulaires :

```jsx
<PhotoAnnotator
  src={photo.url}
  initialAnnotations={anns}             // chargé une fois
  annotationTypes={types}
  onCreate={async (staged) => {
    const id = await db.annotations.add({ ... });
    return { ...staged, id };           // le composant adopte ce nouvel id
  }}
  onUpdate={async (annotation) => { await db.update(annotation.id, ...); }}
  onMove={async (annotation, { x, y }) => { await db.update(...); }}
  onDelete={async (annotation) => { await db.delete(annotation.id); }}
/>
```

Le mode event-based est détecté automatiquement dès qu'un de
`onCreate / onUpdate / onMove / onDelete / initialAnnotations` est passé.
Les deux modes sont mutuellement exclusifs.

Sémantique optimiste :

- `onCreate` qui rejette -> l'entrée optimiste est retirée, sélection
  effacée
- `onUpdate` / `onMove` / `onDelete` qui rejette -> erreur loggée, pas
  de revert automatique. Le consommateur peut resync en passant une
  nouvelle référence à `initialAnnotations`
- Si `onMove` est absent, `onUpdate` est appelé en remplacement à la
  fin du drag

Pour rafraîchir depuis le backend, repasser une nouvelle référence à
`initialAnnotations` (la comparaison est par identité de tableau).

## `headlessEditor`

Pour les types qui n'ont pas besoin d'une modale standard (par exemple
déclencher un file input puis sauver, ou réutiliser une modale qui a
déjà son propre overlay comme `<ProductCategoryBrowser>`), passer
`headlessEditor: true`. Le composant monte alors le `renderEditor`
directement, sans wrapper modal.

```jsx
photo: {
  label: "Photo détaillée",
  icon: <FaCamera />,
  headlessEditor: true,
  renderMarker: (a, { num }) => <CameraCircle num={num} />,
  renderEditor: (a, { onSave, onCancel }) => (
    <PhotoCaptureFlow
      onCaptured={async (blob) => {
        const targetPhotoId = await imagesService.create(blob);
        onSave({ payload: { targetPhotoId } });
      }}
      onCancel={onCancel}
    />
  ),
}
```

Le composant rendu par `renderEditor` est responsable de tous les
side effects (typiquement un `useEffect` au mount qui clique le file
input) et appelle `onSave` ou `onCancel` depuis son cycle de vie.

## Composition avec `<ProductCategoryBrowser>`

Pour un type "produit", on délègue l'éditeur au browser de catalogue :

```jsx
const productType = {
  label: "Produit",
  icon: <FaBoxesStacked />,
  color: "#3B82F6",
  headlessEditor: true,                  // ProductCategoryBrowser a déjà sa modale
  renderMarker: (a, { num }) => <Circle color="#3B82F6">{num}</Circle>,
  renderEditor: (a, { onSave, onCancel }) => (
    <ProductCategoryBrowser
      open
      mode="quantity-discount"
      productsAdapter={productsAdapter}
      categoriesAdapter={categoriesAdapter}
      prefillProduct={a.payload?.fk_product ? {
        id: a.payload.fk_product,
        ref: a.payload.product_ref,
        label: a.payload.product_label,
      } : undefined}
      defaultQty={a.payload?.qty || 1}
      defaultDiscountPercent={a.payload?.remise_percent || 0}
      onSelect={({ product, qty, discountPercent }) => onSave({
        payload: {
          fk_product: product.id,
          product_ref: product.ref,
          product_label: product.label,
          qty,
          remise_percent: discountPercent,
        },
      })}
      onClose={onCancel}
    />
  ),
};
```

## Sous-photos / drill-in

`<PhotoAnnotator>` gère **une seule image à la fois**. Pour lier une
photo de détail (zoom sur une fissure visible sur une vue d'ensemble),
le consommateur :

1. Définit un type `photo` dont le `renderEditor` ouvre l'appareil photo,
   stocke le blob, et appelle `onSave({ payload: { targetPhotoId } })`
2. Réagit à `onAnnotationActivate(annotation)` (double-tap sur le
   marqueur) pour naviguer vers la photo cible
3. Optionnellement, encapsule `<PhotoAnnotator>` dans un parent qui
   maintient un fil d'Ariane des photos visitées

L'arborescence et la persistance vivent dans l'application
consommatrice ; le composant reste single-image.

## Interactions

| Geste | Action |
|---|---|
| Long-press sur le fond | TypePicker (ou éditeur direct si 1 seul type) |
| Bouton "+ Ajouter" toolbar | Crée au centre (50%, 50%), persiste, ouvre l'éditeur |
| Tap sur un marqueur | Sélection + `onAnnotationSelect` |
| Double-tap sur un marqueur | `onAnnotationActivate` (drill-in) |
| Long-press sur un marqueur | Mode drag ; `onChange` une fois au pointer-up |
| Pinch / molette | Zoom (limité par `[minZoom, maxZoom]`) |
| Drag à un doigt sur le fond quand zoomé > 1 | Pan |
| Boutons edit/delete dans la liste | Édition / suppression (`window.confirm` pour delete) |
| Mode `readOnly` | Désactive add/edit/delete/drag ; tap et double-tap restent actifs |

## Layout

`listPosition`:

- `"bottom"` (défaut) : liste en bas
- `"right"` : barre latérale (orientation desktop)
- `"off"` : pas de liste (le consommateur affiche la sienne)

## Source de l'image

`src` accepte :

- une chaîne URL (passée telle quelle)
- un `Blob` ou `File` -> `createObjectURL` / `revokeObjectURL` gérés
  automatiquement via le hook interne `useImageUrl`

## Props complètes

```js
{
  // Image
  src: string | Blob | File,

  // Mode controlled
  annotations: Annotation[],
  onChange: (annotations) => void,

  // Mode event-based
  initialAnnotations: Annotation[],
  onCreate: (staged) => Promise<Annotation>,    // peut renvoyer l'annotation finale
  onUpdate: (annotation) => Promise<void>,
  onMove: (annotation, { x, y }) => Promise<void>,
  onDelete: (annotation) => Promise<void>,

  // Registre des types
  annotationTypes: { [key]: TypeDef },

  // Layout
  listPosition: "bottom" | "right" | "off",
  readOnly: boolean,

  // Callbacks
  onAnnotationSelect: (annotation) => void,
  onAnnotationActivate: (annotation) => void,

  // Toolbar
  showAddButton: boolean,                       // défaut true
  showZoomReset: boolean,                       // défaut true

  // Comportement
  longPressMs: number,                          // défaut 500
  minZoom: number,                              // défaut 0.5
  maxZoom: number,                              // défaut 5

  // i18n
  labels: object,                               // override de DEFAULT_LABELS

  // Slots de styling
  containerProps, headerProps, toolbarProps,
  imageContainerProps, listProps, listItemProps,
  typePickerProps, editorOverlayProps, markerProps,
}
```

## Étiquettes par défaut (`DEFAULT_LABELS`)

```js
{
  addAnnotation: "Ajouter une annotation",
  chooseType: "Type d'annotation",
  pickerCancel: "Annuler",
  listEmpty: "Aucune annotation",
  edit: "Modifier",
  delete: "Supprimer",
  deleteConfirm: "Supprimer cette annotation ?",
  confirm: "Valider",
  cancel: "Annuler",
  zoomReset: "Réinitialiser le zoom",
  untitled: "(sans titre)",
}
```

Tous sont remplaçables via la prop `labels`.

## Tests

`src/lib/components/others/PhotoAnnotator/index.test.jsx` couvre 22 cas
incluant le mode controlled, le mode event-based, le `headlessEditor`,
la création via "+", le TypePicker, l'édition, la suppression, et le
long-press sur le fond.
