# Editor

`<Editor>` est un éditeur Markdown minimaliste à 2 modes : **édition**
(textarea brut markdown) et **rendu** (HTML sanitisé via DOMPurify +
`marked`). Bascule via deux boutons en bas du champ ("Markdown" /
"Preview" par défaut, traduits via `labels`).

Pensé pour les descriptions longues dans un formulaire (compte-rendu
d'intervention, note d'observation, description d'un produit) où on
veut laisser un peu de mise en forme sans imposer un éditeur WYSIWYG
lourd.

## Import

```jsx
import { Editor } from "@cap-rel/smartcommon";
```

## Exemple

```jsx
import { useState } from "react";
import { Editor } from "@cap-rel/smartcommon";

const Form = () => {
    const [text, setText] = useState("# Intervention\n\nNotes...");
    return (
        <Editor
            label="Compte-rendu"
            value={text}
            onValueChange={setText}
        />
    );
};
```

Le composant peut aussi tourner en **uncontrolled** (interne) en
passant un `defaultValue` au lieu de `value`/`onValueChange`. Le
contenu n'est alors pas remonté au parent.

## Modes (édition / rendu)

Deux boutons en bas du champ :

- **Markdown** (`labels.markdownButton`) : repasse en édition (textarea
  visible, preview HTML cachée). Désactivé quand déjà en édition.
- **Preview** (`labels.previewButton`, "Rendu" en français) : passe en
  preview HTML. Désactivé quand déjà en preview.

Les textes viennent de `labels` (clé `Editor` des bundles de langue),
en anglais par défaut :

```jsx
import { locales } from "@cap-rel/smartcommon";

<Editor label="Compte-rendu" labels={locales.fr.Editor} />
// ou une seule clé : labels={{ previewButton: "Aperçu" }}
```

À chaque bascule vers le rendu, la hauteur de la textarea est capturée
(`getBoundingClientRect()`) puis injectée dans le HTML rendu via une
variable CSS `--height`. Conséquence : le mode rendu garde la même
hauteur que ce que l'utilisateur avait laissé sur la textarea. Évite
le saut visuel.

## Sécurité (XSS)

Le rendu passe par `DOMPurify.sanitize(marked(value))`. Toutes les
balises et attributs dangereux (`<script>`, `onclick`, `<iframe>`, etc.)
sont strippés avant injection. Sûr pour afficher du contenu utilisateur
arbitraire.

> Note : DOMPurify est configuré avec les valeurs par défaut. Si tu
> veux **autoriser** des balises spécifiques (ex. `<video>`,
> `<details>`, attributs `data-*`), il faut adapter le composant - pas
> exposé via les props pour l'instant.

## Slots de styling

| Slot | Cible |
|------|-------|
| `containerProps` | wrapper racine |
| `labelContainerProps` / `labelProps` / `helpProps` | header label + aide |
| `starProps` | étoile "requis" (affichée avec `required`) ; `requiredStarProps`, ancien nom, reste accepté si `starProps` est absent |
| `textareaContainerProps` | wrapper autour de textarea + preview HTML |
| `textareaProps` | `<Textarea>` interne (mode édition) |
| `htmlProps` | `<div>` qui rend le HTML preview |
| `buttonContainerProps` | barre des 2 boutons (Markdown / Preview) |
| `mdButtonProps` / `mdButtonIconProps` / `mdButtonLabelProps` | bouton "Markdown" |
| `htmlButtonProps` / `htmlButtonIconProps` / `htmlButtonLabelProps` | bouton "Preview" |

Toutes les `className` sont mergées via `twMerge`.

## Props

| Prop | Type | Défaut | Notes |
|------|------|--------|-------|
| `label` | string | - | label du champ |
| `labelRow` | bool | `false` | label sur la même ligne que le champ |
| `help` | string | - | texte d'aide affiché sous le label |
| `value` | string | - | controlled : le markdown brut |
| `onValueChange` | func | - | `(newValue) => void`, requis en controlled |
| `defaultValue` | string | `""` | uncontrolled : valeur initiale |
| `labels` | object | `DEFAULT_LABELS` (anglais) | `markdownButton`, `previewButton` |

`<Editor>` accepte aussi tous les autres props standards de
`<Textarea>` (rest spread sur le textarea interne), notamment :
`required`, `disabled`, `readOnly`, `id`, `placeholder`.

## Limites connues

- **Pas de toolbar** (gras, italique, listes, lien) en mode édition.
  L'utilisateur tape du Markdown brut, pas de raccourci visuel.
- **Pas d'auto-resize** de la textarea (taille fixe via Tailwind).
- **DOMPurify config non exposée** via props : pour personnaliser les
  balises autorisées, forker le composant.
- Le commentaire `TODO Style view (h1, h2, ...)` indique que les
  styles Tailwind du HTML rendu sont sommaires : les titres ne sont
  pas mis en forme prose. Pour un rendu plus riche, surcharger
  `htmlProps.className` avec un set de classes Tailwind Typography.

## Alternative

Pour un éditeur WYSIWYG (toolbar, raccourcis clavier), regarder
`@uiw/react-md-editor` qui est déjà dans les deps de smartcommon mais
non utilisé activement (cf bloc commenté en bas de
`src/lib/components/form/Editor/index.jsx`).

## Voir aussi

- `<Textarea>` : champ texte simple sans markdown.
- `<Input>` : champ une ligne.
