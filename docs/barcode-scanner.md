# BarcodeScanner

`<BarcodeScanner>` est un scanner plein écran générique reposant sur
`html5-qrcode`. Lazy-loadé à la première ouverture (~150 KB qui ne
chargent pas tant que personne ne scanne), il propose un fallback de
saisie manuelle si la caméra est refusée.

Cas d'usage :

- Login par QR code (`<LoginComponent enableQrPair />` l'utilise en
  interne) ;
- Scan de codes-barres produits / batches en intervention, en inventaire ;
- Saisie rapide d'un numéro de série, d'un colis, etc.

## Import

```jsx
import { BarcodeScanner } from "@cap-rel/smartcommon";
```

## Exemple

```jsx
import { useState } from "react";
import { BarcodeScanner } from "@cap-rel/smartcommon";

export const ProductScanner = () => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button onClick={() => setOpen(true)}>Scanner un produit</button>
            <BarcodeScanner
                open={open}
                onClose={() => setOpen(false)}
                onScan={(text) => {
                    console.log("scanned:", text);
                    setOpen(false);
                }}
            />
        </>
    );
};
```

## Comportement

- **Lazy-load** : `await import("html5-qrcode")` au premier `open: true`.
  Coût ~150 KB une seule fois. Les ouvertures suivantes sont
  instantanées.
- **Caméra refusée** : si la permission est rejetée, l'UI bascule sur un
  champ `<input>` + bouton "Valider" pour saisie manuelle. Le
  `onScan(text)` est appelé sur validation.
- **Caméra indisponible** (pas de device, https requis, etc.) : même
  fallback. Le message d'erreur exact est exposé via `labels.cameraError`
  / `labels.cameraPermissionDenied`.
- **Modes** :
  - `continuous: false` (défaut) : scan unique. Dès qu'un code est lu,
    `onScan` est appelé puis le composant se ferme (la caméra est
    libérée).
  - `continuous: true` : scan répété. `onScan` est appelé pour chaque
    code détecté ; le composant reste ouvert jusqu'à `onClose`.
    Debounce de `debounceMs` (défaut 1500ms) sur la valeur lue pour ne
    pas inonder le caller.
- **Formats acceptés** : passer `formats: ["QR_CODE", "EAN_13", ...]`.
  Défaut = 7 formats courants (QR + EAN + UPC + CODE128/39). Liste
  complète exportée comme `FORMAT_NAMES`.
- **Test E2E** : pour Playwright, mocker `getUserMedia` ou le composant
  via `vi.mock`. Pas de méthode native pour injecter un scan simulé
  (limitation de html5-qrcode).

## Performance

`html5-qrcode` charge un wasm pour les formats 1D (CODE128, etc.). Le
premier rendu peut être lent (~200ms sur un mobile bas de gamme). Pour
des tests qui mountent `<BarcodeScanner>` répétitivement, warm up :

```js
beforeAll(async () => { await import("html5-qrcode"); });
```

## Props

| Prop | Type | Défaut | Notes |
|------|------|--------|-------|
| `open` | bool | requis | mounte / unmount le scanner |
| `onClose` | func | requis | appelée sur fermeture (croix, scan unique, manuel) |
| `onScan` | func | requis | `(text: string) => void` |
| `continuous` | bool | `false` | scan unique (false) ou répété (true) |
| `formats` | array | 7 formats | sous-ensemble de `FORMAT_NAMES` |
| `fps` | number | `10` | framerate de la caméra |
| `qrbox` | `{width, height}` | `{280, 150}` | zone de scan |
| `debounceMs` | number | `1500` | uniquement en mode continuous |
| `feedbackContent` | node | - | overlay info affiché par-dessus le scanner (typiquement le statut "claiming...") |
| `labels` | object | `DEFAULT_LABELS` | merge partiel |

## Voir aussi

- [login-component.md](login-component.md) : utilisateur principal de ce
  composant (mode QR pair).
- Référence html5-qrcode : https://github.com/mebjas/html5-qrcode.
