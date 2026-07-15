# PhotoEditor

`<PhotoEditor>` est un éditeur de photo plein écran pour les applications
terrain (PWA). Il se branche entre la capture et l'annotation/upload :
recadrer un reçu, redresser un document photographié de biais, ajuster
la luminosité d'un cliché pris dans un endroit sombre, passer une facture
en mode "scan" noir et blanc, etc.

L'édition est **non destructive** : l'état est une liste ordonnée
d'opérations, rejouée sur la source pleine résolution au moment de
l'enregistrement. La même recette est renvoyée à l'appelant, donc on peut
la persister et la ré-appliquer plus tard.

Cas d'usage :

- doliscan / facturation : photographier un reçu posé sur une table,
  le redresser (perspective) et le passer en scan lisible et léger.
- smartInterventions : recadrer et corriger une photo d'intervention
  avant de l'annoter avec `<PhotoAnnotator>`.
- photo produit : recadrer au bon ratio, ajuster la lumière.

## Deux couches

Le composant React s'appuie sur un moteur **agnostique** (canvas pur,
sans React) exposé par le barrel : `lib/imageEditor`.

- `<PhotoEditor>` : l'interface (modale, toolbar, aperçu live, overlays).
- `applyImageEdits(source, operations, output)` : applique une recette
  et renvoie un `Blob`. Utilisable seul, sans UI.
- `detectDocumentQuad(imageData, options)` : détection des bords d'un
  document, pur JS.

## Import

```jsx
import { PhotoEditor } from "@cap-rel/smartcommon";
```

## Utilisation

```jsx
<PhotoEditor
  open={isOpen}
  src={photoBlob}                       // URL string | Blob/File | ImageBitmap
  onSave={(blob, { operations }) => {
      persist(blob);                    // image "cuite" pleine résolution
      storeRecipe(operations);          // recette ré-applicable (non destructif)
      setIsOpen(false);
  }}
  onCancel={() => setIsOpen(false)}
/>
```

L'orientation EXIF des photos de téléphone est normalisée à l'ouverture
(`createImageBitmap(..., { imageOrientation: "from-image" })`), donc on
ne travaille jamais sur une image couchée.

## Props

| Prop | Type | Défaut | Rôle |
|------|------|--------|------|
| `open` | bool | `true` | Affiche / masque la modale |
| `src` | string \| Blob/File \| ImageBitmap | - | Image source |
| `onSave` | `(blob, { operations }) => void` | - | Image cuite + recette |
| `onCancel` | `() => void` | - | Fermeture sans enregistrer |
| `onError` | `(err) => void` | - | Erreur de chargement / export |
| `tools` | string[] | `["crop","perspective","rotate","flip","straighten","adjust"]` | Outils affichés, dans l'ordre |
| `aspectRatios` | array | libre, original, 1:1, 4:3, 3:4, 16:9 | Ratios proposés par le recadrage |
| `maxStraightenAngle` | number | `45` | Demi-amplitude du slider de redressement (degrés) |
| `output` | `{ type, quality, maxWidth, maxHeight }` | `{ type:"image/jpeg", quality:0.9 }` | Encodage / redimensionnement du Blob final |
| `previewMaxDimension` | number | `1400` | Plus grande dimension du canvas d'aperçu (perf mobile) |
| `labels` | object | `DEFAULT_LABELS` (anglais) | i18n (voir plus bas) |
| `containerProps`, `headerProps`, `titleProps`, `canvasAreaProps`, `toolbarProps`, `footerProps` | object | - | Slots de style (fusionnés via `twMerge`) |

## Outils

### Géométrie

- **Recadrage** : cadre déplaçable + 4 poignées, ratios optionnels.
- **Rotation** 90 gauche / droite.
- **Miroir** horizontal / vertical.
- **Redressement libre** : slider `-maxStraightenAngle..+maxStraightenAngle`,
  avec recadrage automatique des coins vides.

### Perspective 4 coins

Outil pour redresser un document photographié de biais. On déplace les
4 coins du quadrilatère qui sont ensuite remappés vers un rectangle droit
(homographie).

Bouton **"Détecter les bords"** : détection automatique du document (pur
JS, sans dépendance) qui **pré-remplit les 4 coins**. Adapté au cas
courant d'un document/carte sur fond contrasté. Si rien n'est trouvé, un
message neutre s'affiche et l'ajustement manuel reste possible (le manuel
est toujours le filet de sécurité).

### Lumière / couleur

- Sliders **luminosité / contraste / saturation / température** (aperçu
  live).
- **Auto** : auto-amélioration (auto-contraste par étirement
  d'histogramme).
- **N&B** : niveaux de gris.
- **Scan** : preset document (niveaux de gris + binarisation Otsu) pour
  un reçu net et léger. N&B et Scan sont mutuellement exclusifs.

## Format de la recette (`operations`)

```js
{ type: "rotate90",   steps: 1 }                          // 0..3, horaire
{ type: "straighten", angle: 3.5 }                        // degrés, auto-crop
{ type: "flip",       flipH: true, flipV: false }
{ type: "perspective",corners: [{x,y},{x,y},{x,y},{x,y}] }// TL,TR,BR,BL normalises 0..1
{ type: "crop",       rect: { x, y, w, h } }              // normalise 0..1
{ type: "autoEnhance" }
{ type: "adjust",     brightness, contrast, saturation, temperature } // -1..1
{ type: "scan",       binarize: true }                    // false = niveaux de gris
```

Le moteur applique les opérations dans un ordre canonique (géométrie
avant couleur), quel que soit l'ordre de la liste : perspective et
recadrage opèrent dans l'espace de l'image déjà tournée/redressée, c'est
à dire ce que voit l'utilisateur.

## Moteur sans UI

```js
import { applyImageEdits, detectDocumentQuad } from "@cap-rel/smartcommon";

// Appliquer une recette sans afficher l'éditeur :
const blob = await applyImageEdits(sourceBlob, [
  { type: "rotate90", steps: 1 },
  { type: "scan", binarize: true },
], { type: "image/jpeg", quality: 0.85, maxWidth: 2000 });

// Détection de document (sur un ImageData) -> 4 coins normalisés ou null :
const corners = detectDocumentQuad(imageData);
```

## i18n

`DEFAULT_LABELS` est en anglais (source de vérité). Les 8 bundles de
locales du paquet incluent un namespace `PhotoEditor` :

```jsx
import { locales } from "@cap-rel/smartcommon";

<PhotoEditor labels={locales.fr.PhotoEditor} />

// ou, avec un override projet par projet :
<PhotoEditor
  labels={{
    ...locales.fr.PhotoEditor,
    save: t("editor.save"),
  }}
/>
```

## Frontière avec PhotoAnnotator

`<PhotoEditor>` **cuit les pixels** (géométrie + couleur) et sort un
nouveau Blob. `<PhotoAnnotator>` **pose des marqueurs structurés** liés à
des objets métier sur une image inchangée. Les deux se composent : flux
type terrain `capture -> PhotoEditor (nettoyer/recadrer) -> PhotoAnnotator
(annoter) -> upload`.

## Notes

- Aucune dépendance lourde : la détection des bords et les filtres sont en
  pur JS / canvas. Une détection plus robuste (fonds encombrés ou peu
  contrastés) via OpenCV.js ou un modèle reste une amélioration optionnelle
  future.
- Sur très grandes images, l'aperçu travaille sur une copie réduite
  (`previewMaxDimension`) ; l'export part toujours de la source pleine
  résolution.
