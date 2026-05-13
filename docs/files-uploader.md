# FilesUploader

`<FilesUploader>` est un sélecteur de fichiers **généraliste** (PDF,
docs, archives, n'importe quel MIME). Contrairement à
`<PhotosUploader>` (spécialisé image + compression + EXIF) et
`<SignaturePad>` (canvas), il garde les fichiers en l'état et expose
juste `{ url, type, title, description }` (par fichier) au caller.

Pas de support de l'upload offline-first (`useUploadQueue`) ni du mode
`outputFormat="upload"` aujourd'hui. C'est un composant "blob + meta"
classique : le caller assemble l'upload lui-même.

Pour les médias spécialisés, voir les composants frères :

- [photos-uploader](#) **`<PhotosUploader>`** — images, avec
  compression + EXIF preserved + upload mode + queue.
- **`<AudiosUploader>`** — son.
- **`<VideosUploader>`** — vidéo.

Tous suivent une convention similaire (`value` = objet ou tableau,
`onValueChange`) mais sans uniformité parfaite sur les options.

## Import

```jsx
import { FilesUploader } from "@cap-rel/smartcommon";
```

## Exemple (single)

```jsx
import { useState } from "react";
import { FilesUploader } from "@cap-rel/smartcommon";

const Demo = () => {
    const [file, setFile] = useState(null);
    return (
        <FilesUploader
            label="Justificatif"
            value={file}
            onValueChange={setFile}
        />
    );
};
```

`file` aura la forme `{ url, type, title, description }` (ou `null` en
état "vide").

## Exemple (multiple)

```jsx
<FilesUploader
    label="Pièces jointes"
    multiple
    value={files}
    onValueChange={setFiles}
/>
```

`files` est alors un tableau `[{ url, type, title, description }]`.

## Forme de la valeur

| Champ | Type | Notes |
|-------|------|-------|
| `url` | string | typiquement un blob URL local (`blob:...`) créé via `URL.createObjectURL` |
| `type` | string | MIME du fichier (`application/pdf`, `image/png`, …) |
| `title` | string | initialisé au nom du fichier sans extension, éditable par l'utilisateur |
| `description` | string | éditable par l'utilisateur via le popup |

Le composant **garde les blobs côté front** (préview locale). C'est au
caller de :

- transformer le blob en upload (`fetch(file.url).then(r => r.blob())`),
- décider du moment d'envoi (form submit, etc.),
- éventuellement libérer les blob URLs après usage si nécessaire (le
  composant le fait lui-même via `URL.revokeObjectURL` à l'unmount).

## Comportement

- **Importer un fichier** : bouton "Choisir un fichier" → file input
  natif. Après sélection, un `setTimeout(..., 1000)` simule une étape
  de "chargement" (spinner) avant d'ajouter le fichier dans la value.
  Le délai est en dur (voir limites).
- **Supprimer un fichier** : bouton "X" sur l'item. Révoque le blob URL
  s'il a été créé par le composant.
- **Éditer titre / description** : tap sur un item ouvre un `<Panel>`
  avec deux inputs (titre, description). Validation = fermeture du
  panel.

## Cleanup blob URLs

Le composant tient une liste interne des `URL.createObjectURL` qu'il a
créés (`objectUrlsRef`) et les révoque à l'unmount. Si le caller
réinjecte un `value` qui contient des blob URLs **créés ailleurs**, le
composant ne les révoquera pas (il ne connaît que les siens). Pas
d'incident côté mémoire mais à savoir si tu reroutes la valeur.

## Slots de styling

Très nombreux (24+) : tout est slot-able (`containerProps`,
`labelProps`, `inputProps`, `listProps`, `listItemProps`, `iconProps`,
`titleProps`, `typeProps`, `deleteButtonProps`, `panelProps`,
`fileProps`, `titleInputProps`, `descriptionInputProps`,
`buttonProps`…). Cf [src/lib/components/form/FilesUploader/props.js](../src/lib/components/form/FilesUploader/props.js)
pour la liste complète.

## Props

| Prop | Type | Défaut | Notes |
|------|------|--------|-------|
| `label` | string | - | label du champ |
| `labelRow` | bool | `false` | label sur la même ligne |
| `help` | string | - | aide affichée sous le label |
| `multiple` | bool | `false` | tableau de fichiers vs fichier unique |
| `value` | object \| array | - | controlled |
| `defaultValue` | object \| array | - | uncontrolled |
| `onValueChange` | func | `noop` | `(newValue) => void` |

Plus les props standards de `<Input>` (`required`, `disabled`,
`readOnly`, `id`) qui sont spread sur le `<input type="file">` interne.

## Limites connues

- **Pas d'upload built-in** : le caller assemble l'upload lui-même via
  `fetch(blob)` ou similaire. Pour intégration directe avec
  `/upload` smartAuth, regarder `<PhotosUploader outputFormat="upload">`
  qui sert de modèle mais n'a pas (encore) son équivalent pour fichiers
  arbitraires.
- **Délai de 1 s en dur** au sélection (animation fake-load). À forker
  si pas désiré.
- **Pas de queue offline** : si l'app est offline au moment du submit
  parent, gérer la file d'attente dans le caller (`useUploadQueue` +
  custom integration).
- **Pas de validation MIME** côté composant. Passer `inputProps={{
  accept: ".pdf,.docx" }}` pour borner.
- **Pas de taille max** native. Ajouter une validation côté caller.
- Commentaire `TODO Add retake or reimport system` dans le code :
  re-importer un fichier déjà choisi (override) n'est pas supporté.

## Composants frères

Le pattern `<FilesUploader>` se décline pour les médias spécialisés :

- **`<PhotosUploader>`** : ajoute compression `browser-image-compression`,
  capture caméra mobile, EXIF preserved, mode `outputFormat="upload"`
  avec smartAuth `/upload`, mode `queue` offline-first. Cf
  [photo-annotator.md](photo-annotator.md) pour le composant adjacent
  (annotation), et [upload-queue.md](upload-queue.md) pour le mode
  queue.
- **`<AudiosUploader>`** / **`<VideosUploader>`** : capture audio /
  vidéo via les APIs natives, sans la compression/EXIF.

Pour un cas générique "n'importe quel fichier joint, sans traitement
particulier" -> `<FilesUploader>`. Pour des images spécifiquement
(galerie, justificatif photo, signature graphique) -> les variantes
spécialisées.

## Voir aussi

- `<PhotosUploader>` : pattern de référence pour le mode upload.
- `<Panel>` : utilisé pour l'édition titre/description (popup d'édition).
