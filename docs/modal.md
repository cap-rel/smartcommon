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
- **Escape** : ferme la modale via `onClose`, sauf avec
  `closeOnEscape={false}`. Seul le dialogue ouvert en dernier réagit :
  avec deux dialogues empilés (une `<Popup>` ouverte dans une `<Modal>`,
  une seconde `<Modal>`), Escape ferme celui du dessus et laisse celui du
  dessous ouvert. Un Escape déjà traité (`defaultPrevented`, par
  exemple par `ConfirmProvider` ou un outil interne) est ignoré.
- **Click overlay** : `closeOnOverlayClick` (défaut `true`) ferme la
  modale. Le contenu intercepte le click pour ne pas fermer en cliquant
  dedans (`e.stopPropagation()`).
- **Mounting** : `if (!isOpen) return null` : pas de rendu invisible,
  Modal disparaît complètement du DOM quand fermée.
- **Thème** : fond `bg-soft-bg`, texte `text-strong-text`, bordure
  `border-border` : la modale suit le mode sombre comme le reste.

## Accessibilité

- Le contenu porte `role="dialog"` et `aria-modal="true"`. Il est nommé
  par le titre (`aria-labelledby`) ; sans `title`, passer `aria-label`
  sur la `<Modal>` (`<Modal aria-label="Aperçu photo" ...>`), il arrive
  sur le dialogue comme les autres attributs `aria-*` et `data-*`.
- À l'ouverture, le focus passe sur le dialogue (sauf si un champ
  `autoFocus` du contenu l'a déjà pris). Tab et Maj+Tab tournent dans
  le dialogue. À la fermeture, le focus revient sur l'élément qui
  l'avait (le bouton d'ouverture en général).
- Le bouton X est nommé par `labels.close` ("Close" par défaut, traduit
  dans les bundles : `labels={locales.fr.Modal}`).

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
pickers, les menus contextuels : toutes les UI où sur mobile on
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
| Escape | oui | oui si `closeOnClickOverlay` |
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
| `closeOnEscape` | bool | `true` | Escape = close (dialogue du dessus seulement) |
| `labels` | object | anglais | `{ close }` : nom du bouton X |
| `size` | enum | `"md"` | `sm` \| `md` \| `lg` \| `xl` \| `full` |
| `position` | enum | `"center"` | `center` \| `bottom` |
| `zIndex` | number | `50` | overlay z-index |

## Voir aussi

- [popup.md](popup.md) : alternative legacy.
- [panel.md](panel.md) : pour un drawer latéral plutôt qu'une modale.
- `useDialog({ isOpen, onClose, closeOnEscape })` : le hook partagé par
  `Modal`, `Popup` et `Panel` (focus, Tab, Escape, pile des dialogues),
  exporté pour un dialogue maison. Il renvoie `dialogRef` et `onKeyDown`
  à poser sur l'élément `role="dialog"`, et `titleId` pour son titre.
