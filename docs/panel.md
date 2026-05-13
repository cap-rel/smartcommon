# Panel

`<Panel>` est un **drawer latéral** qui glisse depuis un bord (bas,
haut, gauche, droite). Animation framer-motion, gesture drag-to-close,
overlay sombre optionnel.

Cas d'usage : menu latéral, panneau de filtres, picker mobile, bottom
sheet riche (plus configurable que `<Modal position="bottom">`).

## Import

```jsx
import { Panel } from "@cap-rel/smartcommon";
```

## Exemple

```jsx
import { useState } from "react";
import { Panel } from "@cap-rel/smartcommon";

const Demo = () => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button onClick={() => setOpen(true)}>Filtres</button>
            <Panel
                id="filters"
                isOpen={open}
                close={() => setOpen(false)}
                position="right"
            >
                <div className="p-4">
                    Contenu du panel...
                </div>
            </Panel>
        </>
    );
};
```

## Positions

| `position` | Direction d'apparition |
|------------|------------------------|
| `bottom` (défaut) | monte depuis le bas |
| `top` | descend depuis le haut |
| `left` | glisse depuis la gauche |
| `right` | glisse depuis la droite |

## Comportement

- **Auto-mesure** : au mount, lit `offsetHeight`/`offsetWidth` et expose
  `--panel-height` / `--panel-width` en variables CSS (utile pour
  réserver l'espace dans le layout englobant).
- **Drag-to-close** : `closeOnDrag` (défaut `true`). Le user peut "tirer"
  le panel dans la direction d'apparition. Le seuil de fermeture est
  paramétré par `goBackLimit` (défaut `1/5` = il faut tirer plus que
  20 % de la dimension pour fermer ; en deçà, snap back).
- **Click overlay** : `closeOnClickOverlay` (défaut `true`) ferme via
  l'appel au callback `close`.
- **Animation** : framer-motion `transition: { duration }` (défaut
  0.18s) sur l'axe correspondant à la position.

## API close (legacy)

⚠ Cohérence : `<Panel>` utilise `close` (sans le préfixe `on`) là où
`<Modal>` utilise `onClose`. C'est un nom historique conservé pour
compat. Nouveaux composants à venir : préférer `onClose`.

## Slots de styling

| Slot | Cible |
|------|-------|
| `overlayProps` | overlay sombre |
| `panelProps` | panel lui-même (motion.div) |
| `dashProps` | poignée de drag (la "barre" au sommet pour signaler la zone draggable) |

## Props

| Prop | Type | Défaut | Notes |
|------|------|--------|-------|
| `id` | string | requis | identifiant logique |
| `isOpen` | bool | - | contrôle l'affichage |
| `close` | func | - | callback de fermeture |
| `position` | enum | `"bottom"` | `bottom` \| `top` \| `left` \| `right` |
| `overlay` | bool | `true` | overlay sombre |
| `closeOnClickOverlay` | bool | `true` | overlay = click outside |
| `closeOnDrag` | bool | `true` | gesture drag-to-close |
| `duration` | number | `0.18` | durée d'animation (s) |
| `goBackLimit` | number | `1/5` | seuil drag pour fermer (fraction de la dimension) |
| `responsive` | bool | `true` | adaptation desktop |
| `zIndex` | number | `40` | overlay z-index |
| `children` | node | - | contenu |

## Modal vs Panel vs Popup

- `<Modal>` : modale centrée ou bottom-sheet rapide, présets sm/md/lg/xl/full.
- `<Panel>` : drawer latéral animé avec drag-to-close, 4 directions.
- `<Popup>` : alternative legacy de Modal (à éviter pour les nouveaux écrans).

## Voir aussi

- [modal.md](modal.md), [popup.md](popup.md).
- `<Sidebar>` : navigation persistante (pas un panel animé).
