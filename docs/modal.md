# Modal

`<Modal>` est la modale générique des PWA cap-rel : dialog avec
overlay sombre, header (titre + bouton X), corps scrollable. Gère
l'escape, le scroll-lock du body, et propose 5 tailles + 2 positions.

## Import

```jsx
import { Modal } from "@cap-rel/smartcommon";
```

## Exemple

```jsx
import { useState } from "react";
import { Modal } from "@cap-rel/smartcommon";

const Demo = () => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button onClick={() => setOpen(true)}>Ouvrir</button>
            <Modal
                isOpen={open}
                onClose={() => setOpen(false)}
                title="Confirmation"
            >
                <div className="p-4">
                    Voulez-vous vraiment supprimer cet élément ?
                </div>
            </Modal>
        </>
    );
};
```

## Comportement

- **Scroll-lock body** : `document.body.style.overflow = "hidden"` quand
  `isOpen=true`, restauré au close ou à l'unmount.
- **Escape** : un listener global `keydown` ferme la modale via
  `onClose`. Désinstallé à l'unmount.
- **Click overlay** : `closeOnOverlayClick` (défaut `true`) ferme la
  modale. Le contenu intercepte le click pour ne pas fermer en cliquant
  dedans (`e.stopPropagation()`).
- **Mounting** : `if (!isOpen) return null` — pas de rendu invisible,
  Modal disparaît complètement du DOM quand fermée.

## Tailles (`size`)

Largeurs **desktop only** (mobile = toujours full width) :

| `size` | `max-width` desktop |
|--------|---------------------|
| `sm` | `max-w-sm` |
| `md` | `max-w-md` (défaut) |
| `lg` | `max-w-lg` |
| `xl` | `max-w-xl` |
| `full` | `max-w-4xl` |

## Positions (`position`)

- `center` (défaut) : centré sur écran, coins arrondis tout autour,
  marge horizontale mobile.
- `bottom` : mobile = bottom-sheet (ancré bas + coins haut arrondis +
  full width), desktop = redevient centré.

Le mode `bottom` est idéal pour les modales de confirmation, les
pickers, les menus contextuels — toutes les UI où sur mobile on
préfère "monter du bas" plutôt que "tomber au milieu".

## Pas de header / close button

- `showCloseButton={false}` : masque la croix X.
- Si ni `title` ni `showCloseButton`, le header n'est pas rendu du
  tout. Pratique pour les modales custom avec leur propre header dans
  les `children`.

## Modal vs Popup

| | `<Modal>` | `<Popup>` |
|---|-----------|-----------|
| API close | `isOpen` + `onClose` | `isOpen` + `close` |
| Sizes presets | sm/md/lg/xl/full | non |
| Positions | center / bottom | center seulement |
| Escape | oui | non |
| Body scroll-lock | oui | non |
| Implémentation | DOM brut + flex | composant `<Overlay>` partagé |
| Recommandation | nouveaux usages | usages legacy (à migrer) |

`<Modal>` est la version moderne. `<Popup>` est gardé pour
compatibilité avec les modules qui l'utilisent déjà.

## Slots de styling

| Slot | Cible |
|------|-------|
| `overlayProps` | overlay sombre (background + click handler) |
| `contentProps` | conteneur du contenu (rounded, max-w, max-h) |
| `headerProps` | header (titre + close button) |
| `titleProps` | `<h2>` du titre |
| `closeButtonProps` | bouton X |
| `bodyProps` | body scrollable |

`twMerge` est appliqué en interne.

## Props

| Prop | Type | Défaut | Notes |
|------|------|--------|-------|
| `isOpen` | bool | requis | rendu conditionnel |
| `onClose` | func | - | escape + close button + overlay |
| `title` | string | - | masque le header complet si absent et pas de close button |
| `children` | node | - | corps scrollable |
| `showCloseButton` | bool | `true` | masque la croix |
| `closeOnOverlayClick` | bool | `true` | click sur overlay = close |
| `size` | enum | `"md"` | `sm` \| `md` \| `lg` \| `xl` \| `full` |
| `position` | enum | `"center"` | `center` \| `bottom` |
| `zIndex` | number | `50` | overlay z-index |

## Voir aussi

- [popup.md](popup.md) : alternative legacy.
- [panel.md](panel.md) : pour un drawer latéral plutôt qu'une modale.
