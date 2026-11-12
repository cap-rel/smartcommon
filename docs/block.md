# Block

`<Block>` regroupe une section de page : un titre, un texte d'en-tête,
une carte de contenu et un pied. Avec `type="title-bar"`, les enfants
forment une barre horizontale (retour, titre, action) au lieu d'une
carte.

## Import

```jsx
import { Block } from "@cap-rel/smartcommon";
```

## Exemple

```jsx
<Block id="customer" title="Client" header="Coordonnées du client">
    <Address value={customer.address} />
</Block>
```

## Titre

Le titre est un vrai titre HTML, `<h2>` par défaut : les lecteurs d'écran
listent les sections de la page et permettent d'y sauter. Ses classes
visuelles (`font-app-semibold text-strong-text text-app-base`) ne
changent pas. Pour respecter la hiérarchie de la page, choisir le
niveau avec `titleAs` :

```jsx
<Block id="lines" title="Lignes" titleAs="h3">...</Block>
```

Le slot `titleProps` cible ce titre.

## Ombre et mode desktop

Sur mobile et tablette, la carte garde son ombre. En session desktop
(`useViewport().isDesktop`, fourni par `<ViewportProvider>`), la carte
n'a plus d'ombre : les conventions UI desktop réservent l'ombre aux
éléments flottants (menus, popovers, modales). Le mode vient du
viewport de session, pas de la largeur de fenêtre. Sans
`<ViewportProvider>` monté, le rendu historique est conservé (ombre
au-delà du breakpoint `lg`).

Une page desktop qui veut une bordure à la place de l'ombre la passe
par `containerProps={{ className: "border border-border" }}`.

## Slots de styling

| Slot | Cible |
|------|-------|
| `containerProps` | conteneur de la section |
| `titleProps` | titre (`<h2>` par défaut) |
| `headerProps` | texte d'en-tête |
| `blockProps` | carte de contenu (ou barre en `title-bar`) |
| `footerProps` | pied |

`className` est fusionné sur le conteneur (tailwind-merge).

## Props

| Prop | Type | Défaut | Notes |
|------|------|--------|-------|
| `id` | string | requis | identifiant logique |
| `title` | string | - | titre de la section |
| `titleAs` | elementType | `"h2"` | élément du titre (`"h3"`, `"h4"`...) |
| `header` | string | - | texte sous le titre |
| `footer` | string | - | texte sous la carte |
| `type` | `"title-bar"` | - | barre horizontale au lieu de la carte |
| `className` | string | - | classes ajoutées au conteneur |
| `children` | node | - | contenu de la carte |

## Voir aussi

- [viewport.md](viewport.md) : le mode de session (mobile, tablette,
  desktop).
- [page.md](page.md) : la page qui accueille les sections.
