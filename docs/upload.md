# Upload de photos depuis un téléphone

Briques pour envoyer une photo prise au téléphone sur smartauth
`POST /upload`, sans échec silencieux : préparation de l'image sous les
limites du serveur, envoi avec un délai adapté au réseau mobile, lecture de
la vraie cause d'un échec.

```jsx
import {
    useUpload,
    convertImageForUpload,
    uploadRefusalReason,
    uploadFailureDetail,
    isUploadSizeRefusal,
    readErrorBody,
    toMegabytes,
} from "@cap-rel/smartcommon";
```

## Pourquoi

Une photo qui part "telle quelle" échoue selon le téléphone :

- Safari ne sait pas encoder de WebP : sans réduction explicite, un iPhone
  envoie son JPEG de 3 à 8 Mo ;
- PHP refuse au-delà de `upload_max_filesize` (souvent 2 Mo) et vide
  `$_FILES` au-delà de `post_max_size` ;
- le délai par défaut de ky (10 s) coupe un envoi de quelques Mo en 4G.

Résultat vécu : "ça marche sur un téléphone et pas sur l'autre".

## `useUpload` : délai et nouvelle tentative

- Délai par défaut `UPLOAD_TIMEOUT` (120 s) au lieu des 10 s de ky, dans les
  deux modes (direct et file d'attente). Surcharge par hook
  (`useUpload({ timeout })`) ou par appel (`uploadFile(file, { timeout })`),
  `timeout: false` le désactive.
- Mode direct : quand rien n'est revenu du serveur (coupure réseau, délai
  dépassé), l'envoi repart `retries` fois (1 par défaut). Une réponse HTTP,
  même une erreur, n'est jamais renvoyée : elle répondrait la même chose.
- Mode file d'attente (`queue: true`) : inchangé, une coupure met le fichier
  en file d'attente.

## Préparer l'image : `convertImageForUpload`

```jsx
const converted = await convertImageForUpload(file, {
    serverWebp: config.webp_supported,
    acceptedMimes: config.accepted_mimes,
    maxBytes: config.max_upload_bytes,
});
// converted = { file, width, height, mime, dateTaken }
```

- La date de prise de vue (EXIF `DateTimeOriginal`) est lue sur l'original,
  avant le réencodage qui efface les métadonnées : `dateTaken` vaut
  `'YYYY-MM-DD HH:MM:SS'` ou `null`. Jamais `File.lastModified`, qui est la
  date du choix du fichier sur mobile.
- L'orientation EXIF est appliquée aux pixels.
- Format produit : WebP si le navigateur l'encode et que le serveur le lit,
  sinon JPEG quand l'original serait refusé (HEIC, type inconnu, trop lourd)
  ou dépasse `targetBytes` (2 Mo par défaut), sinon l'original intact.
- Plus grand côté : `maxSide` (2400 px par défaut). Si le résultat dépasse
  encore `maxBytes`, ou si le navigateur manque de mémoire, nouvel essai à
  1600 px.
- Ne rejette jamais : en cas d'échec de décodage ou d'encodage, l'original
  est renvoyé. Toujours le vérifier ensuite avec `uploadRefusalReason`.

`downscaleImage(file, { maxSide })` borne seulement les pixels (scanner de
documents, traitement OpenCV) et renvoie `null` si le navigateur ne sait pas
décoder le fichier.

## Appliquer les limites du serveur avant l'envoi

Le serveur annonce sa limite effective : le minimum entre la règle métier,
`SMARTAUTH_UPLOAD_MAX_BYTES`, `upload_max_filesize` et `post_max_size` moins
une marge pour l'enveloppe multipart. Chaque module l'expose aujourd'hui dans
sa propre route de configuration (ex. `albums/config` dans dsd).

```jsx
const refusal = uploadRefusalReason(converted.file, { acceptedMimes, maxBytes });
// "heic" | "bad-format" | "too-large" | null
if (refusal === "too-large") {
    // ne rien envoyer, dire à l'utilisateur :
    // "Photo de 2,6 Mo, le serveur accepte 2 Mo au plus"
    showError(t("too-large", {
        size: toMegabytes(converted.file.size),
        max: toMegabytes(maxBytes),
    }));
}
```

Les codes sont génériques : l'application les traduit dans ses propres
textes.

## Lire un échec

```jsx
try {
    await uploadFile(file, { silent: true });
} catch (error) {
    const body = await readErrorBody(error);
    if (isUploadSizeRefusal(error, body)) {
        // 413 d'un proxy, limite PHP ou smartauth
    }
    const detail = uploadFailureDetail(error);
    // { kind: "http", status } | { kind: "timeout", seconds } | { kind: "network", message }
}
```

- `isUploadSizeRefusal` reconnaît un refus pour taille quelle que soit la
  couche qui a répondu : 413, `File exceeds server limit` (PHP),
  `File too large` (smartauth), `No file uploaded` (`post_max_size` dépassé).
- `uploadFailureDetail` donne une trace à afficher sous le fichier. Un refus
  d'Apache, de ModSecurity ou d'un proxy n'atteint jamais le journal du
  serveur : le code HTTP vu dans l'application est la seule trace.
- Passer `{ silent: true }` quand l'application affiche son propre message,
  sinon le toast global s'ajoute au sien.
