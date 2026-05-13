# Fab

`<Fab>` est un **Floating Action Button** (bouton flottant) classique
Material : un bouton circulaire toujours visible à un coin de l'écran
pour l'action principale du contexte. Mode "speed-dial" optionnel
(plusieurs sous-actions qui se déploient en éventail au tap).

Cas d'usage : nouveau document, nouvelle entrée, scan rapide,
chat support, sélecteur d'actions contextuelles.

## Import

```jsx
import { Fab } from "@cap-rel/smartcommon";
```

## Exemple simple (bouton unique)

```jsx
import { Fab } from "@cap-rel/smartcommon";
import { FaPlus } from "react-icons/fa6";

<Fab
    icon={FaPlus}
    onClick={() => navigate("/new")}
    position="bottom-right"
    color="primary"
/>
```

## Exemple speed-dial (plusieurs actions)

```jsx
import { FaPlus, FaCamera, FaFileImport, FaMicrophone } from "react-icons/fa6";

<Fab
    icon={FaPlus}
    direction="up"
    actions={[
        { icon: FaCamera,     label: "Photo",  onClick: () => capturePhoto() },
        { icon: FaFileImport, label: "Import", onClick: () => importFile() },
        { icon: FaMicrophone, label: "Audio",  onClick: () => recordAudio() },
    ]}
/>
```

Quand `actions` est défini et non-vide, le main click ne déclenche plus
`onClick` mais ouvre / ferme l'éventail. Chaque action a sa propre
`onClick`. Après click sur une action, l'éventail se referme
automatiquement.

## Positions

6 positions absolues à l'écran :

`bottom-right` (défaut) · `bottom-left` · `bottom-center` ·
`top-right` · `top-left` · `top-center`.

Marges fixes (`bottom-4 / right-4` etc.) — les valeurs sont en dur
dans le composant, ajustables via `fabProps.className` si besoin.

## Tailles

| `size` | Main button | Actions (speed-dial) |
|--------|-------------|----------------------|
| `sm` | 40 × 40 px | 32 × 32 px |
| `md` (défaut) | 56 × 56 px | 48 × 48 px |
| `lg` | 64 × 64 px | 56 × 56 px |

L'écart entre les actions dépend de la taille : `sm` → 44 px, `md` →
60 px, `lg` → 72 px.

## Couleurs

Quatre presets du thème (mappés sur les variables CSS Tailwind du
projet) :

- `primary` (défaut) — couleur principale
- `secondary` — couleur secondaire
- `tertiary` — couleur tertiaire
- `neutral` — gris (utile pour les actions "annexes")

Chaque action peut surcharger sa propre couleur :

```jsx
actions={[
    { icon: FaCamera, label: "Photo", onClick: ..., color: "secondary" },
    { icon: FaTrash,  label: "Delete", onClick: ..., color: "neutral"  },
]}
```

## Direction du déploiement (speed-dial)

- `up` (défaut) : actions au-dessus du main button.
- `down` : actions en-dessous.
- `left` / `right` : actions horizontalement.

Le choix dépend de la position : un FAB `bottom-right` + `direction="up"`
est la combinaison standard. Un FAB `top-left` + `direction="down"` ou
`direction="right"` selon la place.

## Controlled / uncontrolled

Par défaut, l'ouverture du speed-dial est gérée en interne. Pour la
contrôler depuis l'extérieur :

```jsx
const [open, setOpen] = useState(false);

<Fab
    icon={FaPlus}
    actions={[...]}
    isOpen={open}
    onOpenChange={setOpen}
/>
```

Permet par exemple d'ouvrir le speed-dial depuis un autre composant
(menu contextuel), ou de le fermer programmatiquement quand un autre
overlay s'ouvre.

## Slots de styling

| Slot | Cible |
|------|-------|
| `fabProps` | main button (le bouton circulaire principal) |
| `actionProps` | bouton de chaque action (speed-dial) |
| `labelProps` | label texte affiché à côté de chaque action |

## Props

| Prop | Type | Défaut | Notes |
|------|------|--------|-------|
| `id` | string | - | identifiant logique |
| `icon` | elementType | `FaPlus` | icône du main button |
| `label` | string | - | tooltip / aria-label |
| `onClick` | func | - | ignoré si `actions` défini (le main click ouvre le speed-dial) |
| `position` | enum | `"bottom-right"` | 6 positions |
| `size` | enum | `"md"` | `sm` \| `md` \| `lg` |
| `color` | enum | `"primary"` | `primary` \| `secondary` \| `tertiary` \| `neutral` |
| `zIndex` | number | `50` | au-dessus des modales (40) |
| `actions` | array | - | si défini : mode speed-dial |
| `direction` | enum | `"up"` | `up` \| `down` \| `left` \| `right` |
| `isOpen` | bool | - | controlled |
| `onOpenChange` | func | - | requis si `isOpen` controlled |

## Fab interne du Calculator

Note : `<Calculator>` a son **propre** FAB embarqué (`showFab={true}`),
pas le composant `<Fab>` documenté ici. Si tu utilises `<Fab>` ET
`<Calculator showFab>` en même temps, gère les positions pour éviter
qu'ils se chevauchent (ou désactive l'un des deux).

## Voir aussi

- [calculator.md](calculator.md) : pour le FAB intégré à la
  calculatrice.
- `<KeyboardStickyAction>` : alternative quand on veut un bouton qui
  reste au-dessus du clavier mobile (pas à un coin fixe).
