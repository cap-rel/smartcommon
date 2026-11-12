# Briques desktop

Composants et hooks pour les écrans desktop (souris, clavier, écran large)
des PWA SmartMaker. Ils reprennent le contrat des briques locales de
smartInterventions décrit dans `capdoc:pwa/DESKTOP_UI.md` (section 5) :
un écran qui les utilisait en local passe à smartcommon en changeant
l'import.

Conventions communes :

- textes en anglais par défaut (`DEFAULT_LABELS`), traduits dans les
  bundles (`labels={locales.fr.UserMenu}`) ; aucun `useTranslation`
  interne ;
- slots de style `<élément>Props` (fusion `twMerge`) ;
- bordures, pas d'ombre, sauf pour les éléments flottants (menus) ;
- accessibles au clavier et aux lecteurs d'écran.

## Import

```jsx
import { Dropdown } from "@cap-rel/smartcommon";
```

## `<Dropdown>`

Menu ouvert au clic : menu utilisateur, menu kebab d'une ligne ou d'une
carte.

```jsx
<Dropdown
    trigger={<button type="button" aria-label="Actions"><FaEllipsisVertical /></button>}
    align="right"
    items={[
        { label: "Modifier", icon: <FaPen />, onClick: edit },
        { label: "Archiver", disabled: !canArchive, onClick: archive },
        { divider: true },
        { label: "Supprimer", danger: true, onClick: remove },
    ]}
/>
```

`items` : `{ label, icon?, onClick?, danger?, disabled?, divider?, key?, testId? }`.

`trigger` :

- un élément (un `<button>` en général) : il reçoit `aria-haspopup`,
  `aria-expanded`, `aria-controls` et le clic qui ouvre et ferme le menu ;
  son propre `onClick` est conservé ;
- une fonction `({ open, toggle, triggerProps }) => node` : l'appelant
  branche `toggle` et étale `triggerProps` (attributs ARIA, id, flèches)
  sur son bouton ;
- tout autre contenu (texte) : enveloppé dans un `<button>`.

Le menu est en `position: fixed`, placé sous le déclencheur (aligné à
droite ou à gauche selon `align`) : il échappe au rognage des conteneurs
scrollables. Il se ferme au clic extérieur, sur Échap, Tab, scroll et
redimensionnement.

Clavier (motif "menu button" WAI-ARIA) :

- Entrée, Espace ou clic ouvrent le menu sur la première entrée ;
  Flèche bas et Flèche haut sur le déclencheur fermé l'ouvrent sur la
  première ou la dernière entrée ;
- dans le menu (`role="menu"`, entrées `role="menuitem"`), les flèches
  passent d'une entrée à l'autre en bouclant et en sautant les entrées
  désactivées, Début et Fin vont aux extrémités ;
- Échap ferme le menu et rend le focus au déclencheur. L'événement est
  marqué traité : une `<Modal>` qui contient le menu reste ouverte ;
- Tab ferme le menu et laisse le focus avancer.

Dans un `DataTable`, envelopper le menu d'une ligne dans
`<span data-row-action>` pour que son clic n'ouvre pas la ligne.

| Prop | Type | Défaut | Notes |
|------|------|--------|-------|
| `items` | array | `[]` | entrées du menu |
| `trigger` | élément, fonction, node | - | déclencheur |
| `align` | `"right"` \| `"left"` | `"right"` | bord du menu aligné sur le déclencheur |
| `menuClassName` | string | `""` | classes du menu |
| `testId` | string | `"dropdown"` | `data-testid` du menu : `${testId}-menu` |
| `zIndex` | number | `50` | z-index du menu |

Slots : `triggerWrapperProps` (enveloppe du déclencheur), `menuProps`,
`itemProps`, `dividerProps`.
