# AnnotatedPhotosUploader

`<AnnotatedPhotosUploader>` est un champ **multi-photos** dont chaque photo
porte ses propres annotations `PhotoAnnotator`.

Il s'appuie sur `PhotosUploader` en mode `multiple` : prise de vue,
compression, envoi (`outputFormat`), file hors ligne (`queue`) et popup de la
photo (titre, description, suppression) sont les siens. Le composant ajoute :

- un **identifiant `uid`** par photo, créé à la prise de vue ;
- une liste **`annotations`** par photo ;
- sous chaque vignette, un **bouton d'annotation** (avec le nombre de
  marqueurs) qui ouvre le `PhotoAnnotator` dans une `Modal`.

La prise de vue et l'import sont **désactivés une fois `max` photos
atteint**. Depuis la galerie, on peut **choisir plusieurs photos d'un coup** :
elles sont toutes ajoutées, dans la limite des places restantes. Au-delà, seules
les premières sont gardées, avec un message (`selectionTruncated` des libellés
de `PhotosUploader`).

## Import

```jsx
import { AnnotatedPhotosUploader } from "@cap-rel/smartcommon";
```

## Exemple

```jsx
import { useState } from "react";
import { AnnotatedPhotosUploader, locales } from "@cap-rel/smartcommon";

const [photos, setPhotos] = useState([]);

<AnnotatedPhotosUploader
  label="Photos avant intervention"
  max={15}
  outputFormat="upload"
  queue
  annotationTypes={{ note: noteType }}
  value={photos}
  onChange={setPhotos}
  labels={locales.fr.AnnotatedPhotosUploader}
  PhotosUploader={{ labels: locales.fr.PhotosUploader }}
  PhotoAnnotator={{ labels: locales.fr.PhotoAnnotator }}
/>
```

Comme tout champ de formulaire, il fonctionne aussi dans un `<Form>` par son
`name` (sans `value`), ou non contrôlé à partir de `defaultValue`.

## Valeur

Un tableau de photos `PhotosUploader` (selon `outputFormat`), chacune
complétée de deux clés :

```js
[
  {
    uid: "4f7c...",            // identité stable de la photo, alphanumérique
    uploadId: "...",           // (outputFormat="upload") ou pendingId hors ligne
    previewUrl: "blob:...",    // ou src
    title: "...", description: "", gpsPoints: [lat, lng], capture: true,
    annotations: [{ id, type, x, y, payload }, ...],
  },
  ...
]
```

- **`uid`** : ni l'index (il change quand une photo est supprimée) ni
  `uploadId` (nul tant que l'envoi est en file hors ligne) ne peuvent identifier
  une photo. Le serveur s'en sert pour rattacher la photo et ses annotations.
  Il est conservé à travers l'envoi et la résolution de la file.
- **Photos déjà enregistrées** : le consommateur les fournit avec leur `uid`
  (renvoyé par son serveur) et un `src` affichable (URL, ou URL `blob:` d'un
  fichier téléchargé avec le JWT). Une photo sans `uid` est acceptée, et en
  reçoit un dès que le champ écrit sa valeur (ajout, suppression, annotation).

## Props

| Prop | Rôle |
|---|---|
| `annotationTypes` | registre des types d'annotation (obligatoire), voir `photo-annotator.md` |
| `max`, `min`, `exact`, `required` | règles du nombre de photos ; `max` bloque aussi la prise de vue |
| `readOnly`, `disabled` | consultation : pas de prise de vue ; le bouton n'apparaît que sur les photos annotées, et l'annotateur s'ouvre en lecture seule |
| `outputFormat`, `queue`, `uploadEndpoint`, `onUploadError`, `compressOptions`, `accept`, `label`, `help` | transmis à `PhotosUploader` |
| `labels` | `annotate`, `viewAnnotations`, `annotationsTitle(index)` |
| `PhotosUploader`, `PhotoAnnotator`, `Modal` | props des sous-composants (libellés, styles...), fusionnées sur les valeurs par défaut |
| `annotateButtonProps`, `annotateCountProps` | props du bouton d'annotation et de son compteur |

## Tests E2E

- `annotated-photos-annotate-<index>` : bouton d'annotation de la photo
  (`data-annotation-count` = nombre de marqueurs) ;
- les repères de `PhotosUploader` restent valables (`photos-uploader-input`,
  `photos-capture-controls`).
