# DataTable

`<DataTable>` est un tableau de données configuré par colonnes, avec
**layout responsive automatique** (table desktop / cards mobile via
Tailwind, sans media query JS), tri, pagination, recherche et sélection
multi-rows. Conçu pour les listes "à la WordPress admin" (interventions,
factures, contacts, ...), pas pour les data-grids type Excel.

> **Pourquoi pas React Table / TanStack Table ?** React Table est
> headless (logique uniquement, à câbler à sa propre UI) et orienté
> data-grids riches (virtual scroll, grouping, aggregation, pivot,
> column resize). Smartcommon livre du prêt-à-brancher Tailwind, sans
> les features pivot/grouping. Importer React Table puis re-faire l'UI
> reviendrait à payer ~14 KB gzip de dep pour ne rien gagner. Le code
> maison (~590 lignes, `lodash.orderBy` + `useState`/`useMemo`) tient
> dans les besoins des PWA cap-rel.

## Import

```jsx
import { DataTable } from "@cap-rel/smartcommon";
```

## Exemple minimal

```jsx
const columns = [
    { key: "id",       label: "#",   width: "60px", align: "right" },
    { key: "name",     label: "Nom",      sortable: true },
    { key: "email",    label: "Email" },
    {
        key: "status",
        label: "Statut",
        render: (row) => (
            <Tag color={row.status === "active" ? "success" : "neutral"}>
                {row.status}
            </Tag>
        ),
    },
];

const data = [
    { id: 1, name: "Alice", email: "alice@example.com", status: "active" },
    { id: 2, name: "Bob",   email: "bob@example.com",   status: "inactive" },
];

<DataTable
    columns={columns}
    data={data}
    sortable
    searchable
    selectable
    onRowClick={(row) => navigate(`/users/${row.id}`)}
    onSelectionChange={(keys) => console.log("selected:", keys)}
/>
```

## Définition de colonnes

```js
{
    key: "name",            // accède à row[key]
    label: "Nom",           // header (node, peut être JSX)
    render: (row, ctx) =>   // facultatif : renvoie un node pour la cellule
        <strong>{row.name}</strong>,
    sortable: true,         // active le tri sur la colonne
    width: "200px",         // taille fixe (CSS)
    align: "left",          // "left" (défaut) | "center" | "right"
    headerClassName: "...", // classes additionnelles header
    cellClassName: "...",   // classes additionnelles cellules
}
```

Important : la recherche full-text se base sur `row[col.key]` brut
stringifié, **pas** sur ce que renvoie `render`. Si un `render` produit
"En cours" depuis un `row.status_id=2`, taper "en cours" dans la
recherche ne match pas. Solution : stocker la version textuelle dans
les données.

## Layout responsive (`mode`)

Trois valeurs :

- `"auto"` (défaut) : rend **simultanément** le `<table>` (visible
  `md:`+) et les cards (visible mobile uniquement). Bascule à 768 px
  via les classes Tailwind `hidden md:table` / `md:hidden`. **Pas de
  JS media query** : SSR-safe, pas de flash.
- `"table"` : force la table à tous les viewports.
- `"cards"` : force les cards à tous les viewports.

Le mode `auto` double le coût de rendu (deux arbres React en parallèle,
un des deux caché par CSS) — acceptable jusqu'à ~500 lignes paginées.
Au-delà, forcer un mode explicite.

## Tri (controlled / uncontrolled)

**Uncontrolled** (smartcommon gère l'état) :

```jsx
<DataTable columns={columns} data={data} sortable />
```

Pour qu'une colonne soit triable, elle doit avoir `sortable: true` ET
le composant doit avoir `sortable={true}` global. Tri implémenté côté
client via `lodash.orderBy`.

**Controlled** (le parent gère l'état, typique pour tri serveur) :

```jsx
const [sortBy, setSortBy] = useState({ key: "name", direction: "asc" });
<DataTable
    columns={columns}
    data={data}
    sortBy={sortBy}
    onSortChange={setSortBy}
/>
```

En mode controlled, `<DataTable>` ne trie pas le `data` lui-même — le
parent doit re-récupérer trié (ou trier explicitement). Le composant
émet juste les nouvelles intentions.

## Pagination

`pageSize=25` par défaut. Mettre `pageSize=0` désactive la pagination
(tout rendu).

Uncontrolled : la pagination est gérée en interne. À noter : si le
filtre rétrécit le dataset sous la page courante, la page est clamped
automatiquement.

Controlled :

```jsx
const [page, setPage] = useState(0);
<DataTable
    columns={columns}
    data={data}
    page={page}
    onPageChange={setPage}
/>
```

UI : bouton Précédent / "Page X sur Y" / bouton Suivant.

## Recherche

`searchable={true}` ajoute un `<Input>` au-dessus du tableau (debounce
**250ms**, constante interne `SEARCH_DEBOUNCE_MS=250`).

- Filtre case-insensitive, substring sur la concaténation des valeurs
  brutes de chaque colonne.
- Valeurs objets → `JSON.stringify`. Render functions JSX → **ignorées**
  (cf section "Définition de colonnes").
- Mode controlled : `search` + `onSearchChange` (l'input devient géré
  par le parent ; le debounce interne reste pour ne pas inonder le
  filter pass).

## Sélection multi-rows

`selectable={true}` ajoute :

- une colonne checkbox en première position du tableau (et un
  checkbox par card),
- une checkbox dans le header qui sélectionne / déselectionne **les
  rows actuellement visibles** (page courante + filtre courant) — pas
  toutes les rows du dataset, par design.
- une barre de notification "N ligne(s) sélectionnée(s)" affichée
  quand au moins une row est cochée.

Controlled : `selectedKeys` + `onSelectionChange`. Uncontrolled : état
interne.

Les checkboxes sont marquées `data-row-action`, ce qui les exclut du
`onRowClick` (cf section suivante).

## Click sur la row

`onRowClick(row, index)` est appelé quand l'utilisateur clique la row,
**sauf** si le click vient d'un descendant marqué `data-row-action` :

```jsx
{
    key: "actions",
    label: "",
    render: (row) => (
        <button data-row-action onClick={() => edit(row)}>
            Modifier
        </button>
    ),
}
```

Permet de mettre des boutons d'action sur chaque row sans qu'ils
déclenchent la navigation de détail.

## États

- **Loading** (`loading={true}`) : remplace le corps par un `<Spinner>`.
  Les headers + la search box restent visibles. La pagination devient
  inactive.
- **Empty** : si `data` est vide après filtrage et que `loading=false`,
  affiche `empty` (node passé en prop) ou `labels.empty` par défaut
  ("Aucune donnée à afficher").

## i18n

`labels` est un objet partiel mergé avec `DEFAULT_LABELS` :

```js
{
    empty: "Aucune donnée à afficher",
    searchPlaceholder: "Rechercher...",
    page: "Page",
    of: "sur",
    previous: "Précédent",
    next: "Suivant",
    sortAscending: "Tri ascendant",
    sortDescending: "Tri descendant",
    rowsSelected: (n) => `${n} ligne(s) sélectionnée(s)`,
}
```

`rowsSelected` est une fonction `(n) => string` pour gérer le pluriel
selon la locale. `DEFAULT_LABELS` est exporté depuis le module pour
extension partielle.

## Slots de styling

| Slot | Cible |
|------|-------|
| `containerProps` | wrapper racine |
| `searchProps` | `<Input>` de recherche |
| `tableProps` | `<table>` |
| `headerProps` | `<thead>` |
| `headerCellProps` | `<th>` de chaque colonne |
| `rowProps` | `<tr>` (table) ET `<div>` (card) |
| `cellProps` | `<td>` |
| `cardProps` | `<div>` de la card (mode cards uniquement) |
| `paginationProps` | barre de pagination |
| `selectionBarProps` | bandeau "N ligne(s) sélectionnée(s)" |

Toutes les `className` sont mergées via `twMerge` pour résoudre les
conflits Tailwind.

## Props

| Prop | Type | Défaut | Notes |
|------|------|--------|-------|
| `columns` | array | requis | voir "Définition de colonnes" |
| `data` | array | requis | les rows |
| `keyField` | string | `"id"` | clé d'identification de row (selection, react key) |
| `sortable` | bool | `false` | active le tri global |
| `sortBy` | `{key, direction}` | - | controlled |
| `onSortChange` | func | - | requis si controlled |
| `pageSize` | number | `25` | 0 = pagination off |
| `page` | number | - | controlled |
| `onPageChange` | func | - | requis si controlled |
| `searchable` | bool | `false` | affiche la search box |
| `search` | string | - | controlled |
| `onSearchChange` | func | - | requis si controlled |
| `selectable` | bool | `false` | colonne checkbox + selection bar |
| `selectedKeys` | array | - | controlled |
| `onSelectionChange` | func | - | requis si controlled |
| `mode` | enum | `"auto"` | `auto` \| `table` \| `cards` |
| `loading` | bool | `false` | rend un spinner |
| `empty` | node | - | fallback empty state (sinon `labels.empty`) |
| `onRowClick` | func | - | `(row, index) => void`, ignoré sur `data-row-action` |
| `labels` | object | `DEFAULT_LABELS` | merge partiel, `rowsSelected` est une fn |

## Limites connues

- **Recherche basée sur les valeurs brutes**, pas sur le rendu. Pour
  matcher du texte "calculé" (statut, labels traduits), stocker la
  version textuelle dans la row.
- **Sélection "tout sur page courante"**, pas "tout sur dataset". Pour
  l'inverse, faire une action custom appelant `onSelectionChange(
  data.map(r => r[keyField]) )`.
- **Pas de virtual scroll** : >2000 lignes paginées commencent à ramer,
  >5000 à freezer le rendu. Borner `pageSize` ou utiliser un autre
  composant pour les datasets massifs.
- **Pas de column resize / reorder / pinning** : par design (cf intro).
- **Tri client-side via `lodash.orderBy`** : strings comparées
  lexicographiquement (pas de locale-aware sort). Pour un tri
  "français-friendly", utiliser le mode controlled + `Intl.Collator`
  côté parent.

## Voir aussi

- `<Tag>`, `<Button>` pour les cellules `render`.
- [modal.md](modal.md) si vous voulez ouvrir un détail de row dans une
  modale plutôt que de naviguer.
