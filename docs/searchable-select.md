# SearchableSelect

`<SearchableSelect>` est un `<Select>` enrichi d'un champ de recherche
type-ahead : l'utilisateur tape pour filtrer la liste des options.
Form-aware via `useField` quand monté dans un `<Form>`.

Quand utiliser :

- **`<SearchableSelect>`** : liste de 10-300 options où le scroll devient
  inefficace (pays, communes, catégories) - l'utilisateur tape 2-3
  lettres pour trouver.
- **`<Select>`** (sans search) : liste courte (<10 options).
- **`<ProductCategoryBrowser>`** : pour les catalogues produits avec
  hiérarchie + adapters async. Bien plus riche.

## Import

```jsx
import { SearchableSelect } from "@cap-rel/smartcommon";
```

## Exemple

```jsx
import { useState } from "react";
import { SearchableSelect } from "@cap-rel/smartcommon";

const countries = [
    { value: "FR", label: "France" },
    { value: "BE", label: "Belgique" },
    { value: "CH", label: "Suisse" },
    { value: "CA", label: "Canada" },
    // ...
];

const Demo = () => {
    const [country, setCountry] = useState(null);
    return (
        <SearchableSelect
            label="Pays"
            placeholder="Tapez pour rechercher..."
            options={countries}
            value={country}
            onChange={setCountry}
        />
    );
};
```

Dans un `<Form>` :

```jsx
<SearchableSelect name="country" label="Pays" options={countries} required />
```

`form.values.country` sera le `value` de l'option choisie (string ou
number).

## Format des options

```js
{
    value: "FR",       // string | number, c'est ce qui est stocké
    label: "France",   // affiché ET utilisé pour le filtre case-insensitive
}
```

## Comportement

- **Au focus / clic** : ouverture du dropdown.
- **Saisie clavier** : filtre `options` par `option.label` (substring,
  case-insensitive).
- **Sélection** : click sur une option -> `onChange(value)` + dropdown
  fermé + champ search vidé.
- **Click outside** : `mousedown` listener global ferme le dropdown +
  reset le champ search.
- **Bouton Effacer** : un X efface la sélection courante (re-mise à
  `null`).

## Form-awareness

`useField({ name, value, defaultValue, onChange, errors })` est appelé
avec une règle `required` intégrée :

```js
errors = (currentValue) => ({
    required: {
        condition: required && isEmptyValue(currentValue),
        message: labels.requiredError,
    }
});
```

Le message (`requiredError`), le placeholder par défaut
(`searchPlaceholder`) et le texte de la liste vide (`noResults`,
"No results" par défaut, "Aucun résultat" en français) passent par
`labels` (clé `SearchableSelect` des bundles de langue).

## Slots de styling

`containerProps` cible le wrapper extérieur rendu par `<Label>`, comme
pour `<Select>` et `<Input>`. Le wrapper relatif du champ, du bouton
d'effacement et de la liste se style via `selectContainerProps`.
Autres slots : `inputProps`, `clearButtonProps`, `dropdownProps`,
`emptyMessageProps`, `optionProps` et ceux de `<Label>` (`labelProps`,
`starProps`, `helpProps`...).

## Props

| Prop | Type | Défaut | Notes |
|------|------|--------|-------|
| `options` | `[{ value, label }]` | `[]` | label = ce qui est filtré |
| `name` | string | - | pour `<Form>` |
| `value` | string \| number | - | controlled |
| `defaultValue` | string \| number | - | uncontrolled |
| `onChange` | func | - | `(value) => void` |
| `placeholder` | string | `labels.searchPlaceholder` | texte si rien de sélectionné |
| `labels` | object | `DEFAULT_LABELS` (anglais) | `requiredError`, `searchPlaceholder`, `noResults` |
| `required` | bool | - | active la validation `required` |
| `disabled` | bool | - | grise le champ |
| `variant` | object | - | hook variantMerger (rare en usage direct) |

## Limites connues

- **Filtre client-only** sur `option.label`. Pour un dataset >300
  options, préférer un adapter async - pas géré nativement, à forker
  ou utiliser `<ProductCategoryBrowser>` qui a le pattern adapter.
- **Pas de groupe / sous-headers** dans le dropdown.
- **Pas de multi-select** (une seule valeur). Pour du multi, regarder
  `<Array>` (tag input) ou composer plusieurs `<SearchableSelect>`.
- **Pas de mise en surbrillance** du texte qui match dans les options
  (juste le filtre).

## Voir aussi

- `<Select>` : version plate sans search, pour les listes courtes.
- `<ProductCategoryBrowser>` : pour les catalogues hiérarchiques
  larges, avec adapter pattern et hierarchie de catégories.
- `<Array>` : pour la saisie multiple "à tags".
