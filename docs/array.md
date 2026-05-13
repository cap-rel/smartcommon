# Array

`<Array>` est un **tag input** : un champ texte où l'utilisateur tape
une valeur, presse `Enter`, et chaque entrée devient un "tag" cliquable
(click sur le tag = suppression). La valeur sortie est un tableau de
strings.

Cas d'usage : tags, mots-clés, emails, hashtags, listes de tâches
courtes — toute saisie où l'utilisateur ajoute N items courts.

## Import

```jsx
import { Array } from "@cap-rel/smartcommon";
```

⚠ **Le nom `Array`** : importer ce composant overrider le `Array`
global JavaScript dans le scope du fichier. Si tu utilises beaucoup
`Array.from()`, `Array.isArray()`, etc., préfère **renommer** à
l'import :

```jsx
import { Array as TagInput } from "@cap-rel/smartcommon";
```

## Exemple

```jsx
import { useState } from "react";
import { Array as TagInput } from "@cap-rel/smartcommon";

const Demo = () => {
    const [tags, setTags] = useState([]);
    return (
        <TagInput
            label="Mots-clés"
            value={tags}
            onValueChange={setTags}
        />
    );
};
```

Workflow utilisateur :

1. Tape "intervention" → presse Enter → tag "intervention" ajouté.
2. Tape "urgent" → Enter → tag "urgent" ajouté.
3. Click sur "intervention" → tag supprimé.

`tags` aura la forme `["intervention", "urgent"]`.

## Mode uncontrolled

```jsx
<Array name="keywords" defaultValue={["alpha", "beta"]} />
```

`name` permet la liaison avec `<Form>` (lecture via `form.values.keywords`).
Sans `value` ni `onValueChange`, le composant gère un state interne.

## Comportement

- **Ajouter un tag** : tape dans le champ + presse `Enter`. La valeur
  est ajoutée au tableau et le champ est vidé. Une chaîne vide ou
  whitespace-only est ignorée.
- **Supprimer un tag** : click sur le tag.
- **Pas de drag-reorder** : ordre = ordre d'ajout.
- **Pas de doublons gérés** : le composant n'empêche pas l'ajout de
  doublons. À filtrer côté caller si nécessaire.

## Slots de styling

| Slot | Cible |
|------|-------|
| `containerProps` | wrapper racine (via `<Label>`) |
| `arrayContainerProps` | conteneur du champ + tags |
| `arrayInputProps` | `<Input>` interne (champ de saisie) |
| `tagsContainerProps` | wrapper de la liste de tags |
| `tagProps` | chaque tag (`<div>` cliquable) |
| `inputProps` | hidden inputs pour la sérialisation HTML form |

## Props

| Prop | Type | Défaut | Notes |
|------|------|--------|-------|
| `name` | string | - | pour `<Form>` |
| `value` | array | - | controlled |
| `defaultValue` | array | `[]` | uncontrolled |
| `onValueChange` | func | `noop` | `(newArray) => void` |
| `label` | string | - | label du champ |
| `help` | string | - | aide |
| `min` / `max` | number | - | conservés pour usage parent (pas de validation interne) |
| `hasCopyButton` | bool | `false` | déclaré dans les props mais pas utilisé dans le rendu actuel (TODO) |
| `required` / `disabled` / `readOnly` / `id` | - | - | spread sur l'input interne |

## Limites connues

- **Pas de validation native min/max** : les props existent mais ne
  bloquent pas l'ajout/suppression. Valider côté parent ou dans
  `onPreSubmit` de `<Form>`.
- **Pas de doublons filtrés**.
- **Pas de drag-reorder**.
- **Pas de touche Backspace pour supprimer le dernier tag** (à
  l'inverse des UIs Material). La suppression est click-only.
- **Valeurs uniquement string** : pas de support objets. Pour des
  tableaux d'objets riches, regarder `<PhotosUploader>` ou un pattern
  spécialisé.
- **Stylisation tag par défaut "uppercase"** : les classes default font
  `uppercase font-semibold text-primary bg-primary/10`. Pour un look
  plus neutre, override via `tagProps.className` avec `twMerge`.

## Voir aussi

- `<Input>` : pour une seule valeur.
- `<SearchableSelect>` : pour choisir une valeur dans une liste connue.
- `<ProductCategoryBrowser>` mode `multiple` : pour les "tags
  produits" depuis un catalogue.
