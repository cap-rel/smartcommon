# ListItem

`<ListItem>` affiche une ligne de liste : logo ou icône, titre, statut,
sous-titre et description.

## Import

```jsx
import { ListItem } from "@cap-rel/smartcommon";
```

## Icône de fin de titre

L'icône après le titre n'apparaît que sur demande :

- `link` : le crayon historique (rendu inchangé pour les écrans qui
  passent déjà `link`) ;
- `trailingIcon` : `true` pour le crayon, un composant react-icons
  (`trailingIcon={FaChevronRight}`) ou un élément pour une autre icône,
  `false` pour n'en afficher aucune, même avec `link`.

Sans `link` ni `trailingIcon`, aucune icône : une ligne purement
informative n'annonce plus une action qu'elle n'a pas.

## Ligne cliquable

```jsx
// Action : bouton accessible au clavier
<ListItem title="Facture 42" onClick={() => open(42)} />

// Navigation : vrai lien
<ListItem title="Facture 42" href="/invoices/42" link />
```

- `onClick` : la ligne devient un bouton (`role="button"`,
  `tabIndex=0`). Entrée l'active à l'appui, Espace au relâchement,
  comme un `<button>` natif. Une touche pressée sur un contrôle placé
  dans la ligne (dans `status` par exemple) ne déclenche pas la ligne.
- `href` (avec `target` et `rel` optionnels) : la ligne est un `<a>`,
  ouvrable dans un nouvel onglet et lue comme un lien. Un `onClick`
  passé en plus est appelé au clic.
- Les attributs `data-*` et `aria-*` posés sur `<ListItem>` arrivent
  sur cet élément racine (`data-testid`, `aria-label`...).

## Slots de styling

| Slot | Cible |
|------|-------|
| `containerProps` | élément racine (`div`, bouton ou `<a>`) |
| `trailingIconProps` | icône de fin de titre |

## Props

| Prop | Type | Défaut | Notes |
|------|------|--------|-------|
| `title` | node | - | titre (en couleur primaire) |
| `subtitle` | node | - | ligne en italique |
| `description` | node | - | ligne de texte |
| `status` | node | - | fin de la ligne de titre (un `Tag` par exemple) |
| `logo` | string | - | URL d'image en tête de ligne |
| `logoAlt` | string | `"Logo"` | texte alternatif du logo |
| `icon` | func | - | `() => node`, rendu sans `logo` |
| `link` | bool | `false` | affiche le crayon de fin de titre |
| `trailingIcon` | bool, composant, élément | - | voir plus haut |
| `onClick` | func | - | ligne bouton |
| `href` | string | - | ligne lien (`<a>`) |
| `target`, `rel` | string | - | attributs du lien |
