# Popup

`<Popup>` est un dialogue modal **legacy** : overlay sombre, titre +
bouton de fermeture, contenu centré. Il a précédé `<Modal>` qui le
remplace dans les nouveaux écrans.

> **À éviter pour nouveaux usages** : préférer `<Modal>` qui gère en
> plus l'escape, le scroll-lock du body et expose des tailles présets.
> `<Popup>` est documenté ici pour les modules qui s'en servent encore
> et pour expliquer la transition.

## Import

```jsx
import { Popup } from "@cap-rel/smartcommon";
```

## Exemple

```jsx
import { useState } from "react";
import { Popup } from "@cap-rel/smartcommon";

const Demo = () => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button onClick={() => setOpen(true)}>Ouvrir</button>
            <Popup
                isOpen={open}
                close={() => setOpen(false)}
                title="Information"
            >
                Contenu du popup...
            </Popup>
        </>
    );
};
```

## Comportement

- **Overlay** : `overlay` (défaut `true`) + `closeOnClickOverlay` (défaut
  `true`). L'overlay vient du composant `<Overlay>` partagé (le même
  que `<Panel>` utilise).
- **Bouton de fermeture** : `closeButton` (défaut `true`) affiche une
  croix en haut à droite. Click = `close()`.
- **Mounting** : contrairement à `<Modal>`, `<Popup>` **reste monté**
  même quand `isOpen=false` (transition CSS `opacity`). Les enfants
  sont donc dans le DOM en permanence.
- **Pas d'escape** : aucun listener `keydown` ; le seul moyen de fermer
  est le bouton X ou l'overlay.
- **Pas de scroll-lock body** : la page derrière reste scrollable
  quand le popup est ouvert.

## API close (legacy)

`close` (sans `on`) plutôt que `onClose`. Idem `<Panel>`. À garder en
tête lors d'un copier-coller depuis un `<Modal>`.

## Tailles

`<Popup>` n'a pas de prop `size`. Sur desktop il est dimensionné via
des classes Tailwind : `lg:w-200 lg:h-160 lg:max-w-3/5 lg:max-h-3/5`.
Pour customiser, utiliser le slot `popupProps` :

```jsx
<Popup
    isOpen={...}
    close={...}
    popupProps={{ className: "lg:w-150" }}
>
    ...
</Popup>
```

## Slots de styling

| Slot | Cible |
|------|-------|
| `Overlay` | `<Overlay>` interne (sous-composant capitalisé) |
| `popupBackdrop` | wrapper du popup (positionnement) |
| `popupProps` | popup lui-même (dimensions, fond) |
| `titleAndButtonContainerProps` | header titre + bouton X |
| `titleProps` | `<div>` du titre |
| `Button` | bouton X (sous-composant) |

## Props

| Prop | Type | Défaut | Notes |
|------|------|--------|-------|
| `isOpen` | bool | - | contrôle l'affichage (opacity, pas mount/unmount) |
| `close` | func | - | callback de fermeture |
| `title` | string | - | masque le header si absent et `closeButton=false` |
| `closeButton` | bool | `true` | croix en haut à droite |
| `overlay` | bool | `true` | overlay sombre |
| `closeOnClickOverlay` | bool | `true` | overlay = click outside |
| `responsive` | bool | `true` | dimensions desktop |
| `zIndex` | number | `40` | overlay z-index |
| `id` | string | - | utilisé par `data-component` |
| `children` | node | - | contenu |

## Migration `<Popup>` -> `<Modal>`

Quand c'est possible (nouveau code, ou refacto d'un écran existant) :

```diff
- <Popup
+ <Modal
    isOpen={open}
-   close={...}
+   onClose={...}
    title="..."
+   size="md"
+   position="center"
  >
    ...
- </Popup>
+ </Modal>
```

Différences à noter au passage :
- `Modal` se démounte (`return null`) quand `!isOpen`, `Popup` reste monté.
- `Modal` gère Escape + body scroll-lock automatiquement.
- `Modal` a des `size` présets, `Popup` doit override via `popupProps.className`.

## Voir aussi

- [modal.md](modal.md) : le remplaçant moderne.
- [panel.md](panel.md) : pour un drawer latéral.
