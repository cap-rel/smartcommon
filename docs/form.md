# Form

`<Form>` est un provider qui orchestre un formulaire **smartcommon
form-aware** : il fournit un `FormContext` aux champs descendants
(`<Input>`, `<Select>`, `<Boolean>`, `<Calendar>`, etc.) via le hook
`useField`, gère le cycle de submit (pré-submit -> validation ->
submit) et expose les flags `isFormSubmitted` / `isFormSubmitting`
pendant tout le cycle.

Le trio à connaître : **`useForm`** (state), **`<Form>`** (provider),
**`useField`** (consommé par chaque champ).

## Import

```jsx
import { Form, useForm } from "@cap-rel/smartcommon";
```

## Exemple complet

```jsx
import { Form, useForm, Input, Button, useFormContext } from "@cap-rel/smartcommon";

const InterventionFormPage = () => {
    const form = useForm({
        defaultValues: { customer: "", note: "" },
    });

    const onSubmit = async () => {
        await api.post("intervention", { json: form.values });
    };

    return (
        <Form
            form={form}
            onPreSubmit={async () => {
                // Hook avant validation : log, analytics, normalize, etc.
            }}
            onSubmit={onSubmit}
        >
            <Input
                name="customer"
                label="Client"
                required
            />
            <Input
                name="note"
                label="Note"
            />
            <SubmitButton />
        </Form>
    );
};

// Un bouton qui sait quand le formulaire est en cours de submit.
const SubmitButton = () => {
    const { submit, isFormSubmitting } = useFormContext();
    return (
        <Button
            onClick={submit}
            loading={isFormSubmitting}
            label="Valider"
        />
    );
};
```

## `useForm` (state)

```js
const form = useForm({
    defaultValues: { name: "", age: 0 },
});
```

Retourne un objet stateful :

| Champ | Type | Notes |
|-------|------|-------|
| `values` | object | values courantes par `name` de champ |
| `errors` | object | erreurs par `name`, sous-clé par règle (`{ customer: { required: true } }`) |
| `isFormSubmitting` | bool | true pendant l'await de `onSubmit` |
| `isFormSubmitted` | bool | true après le 1er clic submit, jamais reset |
| `get(path)` / `set(path, value)` / `unset(path)` | fns | lodash-style |
| `setField({ name, value, errors })` | fn | utilisé par `useField` en interne |

`isFormSubmitted` reste à `true` une fois activé : c'est le flag utilisé
par les champs pour décider d'afficher leurs erreurs (un champ ne montre
ses erreurs **qu'après** la première tentative de submit, pas pendant
la saisie initiale).

## `<Form>` (provider)

```jsx
<Form
    form={form}                              // l'objet retourné par useForm
    onPreSubmit={async () => {...}}          // facultatif, awaité avant validation
    onSubmit={async () => { ... }}           // appelé si pas d'erreurs
>
    {children}
</Form>
```

Cycle de submit (déclenché par `form.submit(e)` ou par un descendant qui
appelle `useFormContext().submit`) :

1. `e.preventDefault()` (le caller passe l'event s'il vient d'un
   `<form>` HTML).
2. `await onPreSubmit()` — utile pour normaliser les valeurs, logger,
   trigger analytics. Pas pour valider.
3. `form.set("isFormSubmitted", true)` — déclenche le rendu des erreurs
   sur tous les champs montés.
4. Un effet sur un compteur `submitToken` interne re-évalue les
   `errors` :
   - **Aucune erreur active** -> `form.set("isFormSubmitting", true)`,
     puis `await onSubmit()`, puis `form.set("isFormSubmitting", false)`.
   - **Au moins une erreur** -> rien d'autre (les champs ont déjà
     re-rendu leurs messages).
5. Si le user re-clique submit après correction, le `submitToken`
   bumpe et l'effet refait tourner la validation. (Sans ce token,
   un second submit ne ferait rien car `isFormSubmitted` est déjà à
   `true` et ne déclenche pas de nouveau cycle.)

## `useField` (côté champ)

Chaque champ `<Input>`, `<Select>`, etc. appelle `useField({ name,
defaultValue, errors })` en interne. Comportement :

- Si **pas de FormContext** ou si `value` est passé en prop -> mode
  contrôlé externe (le parent gère la valeur via `value`+`onChange`).
- Sinon -> le champ se branche sur le `FormContext`, register son
  `name` + `defaultValue`, met à jour `values[name]` à chaque saisie,
  recalcule ses `errors[name]` à chaque changement.

Pour rendre un composant custom "form-aware", il suffit d'appeler
`useField({ name, defaultValue, value, onChange, errors })` et de
brancher `currentValue` + `setValue` sur le rendu. La fonction
`errors(value)` retourne le dictionnaire de règles (`{ required: {
condition: bool, message: string } }`).

## Erreurs : structure et affichage

L'objet `form.errors` ressemble à :

```js
{
    customer: { required: false, min: false },
    note:     { required: true,  min: false },
}
```

Une règle est "active" quand son `condition` est truthy. Le helper
`every(errors, field => !some(field, Boolean))` (utilisé en interne)
détermine si le formulaire est globalement valide.

Chaque champ rend ses propres messages via le composant `<Label>` qui
combine `filteredErrors` + `isFormSubmitted` pour afficher (ou non) le
texte. Pas besoin de boucler manuellement sur `form.errors` côté caller.

## Limites connues

- `isFormSubmitted` **ne reset jamais**. C'est volontaire (les champs
  doivent continuer d'afficher leurs erreurs jusqu'à correction
  manuelle ET un nouveau submit réussi). Pour un reset propre
  (formulaire effacé après submit), re-créer un nouveau `useForm`
  via key prop sur le `<Form>`.
- Pas de gestion native de **arrays de champs** (FieldArray). Les
  composants comme `<PhotosUploader>` gèrent leur propre valeur tableau
  via `value` + `onChange`.
- Pas de gestion native de **dépendances entre champs** (validation
  cross-field). Faire la validation dans `onPreSubmit` ou exposer
  l'erreur via `errors(value)` qui peut lire `form.values` via le
  scope englobant.
- Pas de **support i18n** des messages d'erreur : à toi de les passer
  en dur via `errors` (ils restent en français par défaut dans les
  composants livrés).

## Voir aussi

- `useField` : hook consommé par chaque champ (cf
  `src/lib/hooks/local/useField/index.jsx`).
- `<Input>`, `<Textarea>`, `<Select>`, `<Boolean>`, `<Calendar>`,
  `<Editor>` : tous form-aware via `useField`.
- `<PhotosUploader>`, `<SignaturePad>` : gèrent une valeur complexe
  (objet ou tableau) via `useField`.
