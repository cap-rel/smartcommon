# Calendar

`<Calendar>` est un date picker de type "calendrier mensuel" avec
navigation par mois et par année. Sélection d'une seule date (string
ISO `YYYY-MM-DD`). Form-aware via `useField` : se câble directement
dans un `<Form>` via la prop `name`.

> Note : un composant `<PlainCalendar>` (vue mensuelle/annuelle) est en
> cours de développement pour les cas où l'on veut afficher un planning
> sans être un champ de formulaire. Quand il sera livré, `<Calendar>`
> restera dédié à la saisie d'une date dans un formulaire.

## Import

```jsx
import { Calendar } from "@cap-rel/smartcommon";
```

## Exemple

### Dans un formulaire (recommandé)

```jsx
import { Form, useForm, Calendar, Button } from "@cap-rel/smartcommon";

const InterventionFormPage = () => {
    const form = useForm({ defaultValues: { date: null } });

    return (
        <Form form={form} onSubmit={() => console.log(form.values)}>
            <Calendar name="date" label="Date d'intervention" />
            <Button label="Valider" onClick={form.submit} />
        </Form>
    );
};
```

`form.values.date` sera un string ISO (`"2026-05-12"`) ou `null`.

### Standalone (controlled)

```jsx
import { useState } from "react";
import { Calendar } from "@cap-rel/smartcommon";

const Demo = () => {
    const [date, setDate] = useState(null);
    return (
        <Calendar
            value={date}
            onChange={setDate}
        />
    );
};
```

## Format de la valeur

`value` (et `defaultValue`) sont un **string ISO** (`"YYYY-MM-DD"`)
ou `null`. Pas de support `Date` natif côté input. Pour convertir :

```js
const isoFromDate = new Date().toISOString().slice(0, 10); // "2026-05-12"
const dateFromIso = new Date(isoString);
```

## Navigation

- **Flèches gauche / droite** au-dessus du calendrier : naviguent
  mois par mois. Quand on dépasse décembre, l'année incrémente
  automatiquement (et idem en sens inverse pour janvier).
- **Sélecteur d'année** : affiche l'année courante. Cliquer permet de
  changer d'année dans l'intervalle défini par `yearsInterval` (défaut
  `[2000, 2030]`).
- **Sélecteur de mois** : affiche le mois courant en toutes lettres
  (locale navigateur).

`onMonthChange(month)` et `onYearChange(year)` sont déclenchés à chaque
navigation — utile pour pré-charger des données contextuelles
(événements du mois, jours fériés, etc.).

## Intervalle d'années

```jsx
<Calendar yearsInterval={[2020, 2030]} />
```

Le sélecteur d'année est borné à cet intervalle. Si la valeur courante
sort de l'intervalle (typiquement on charge une date 1985 dans un picker
configuré `[2020, 2030]`), le composant l'affiche mais ne permet plus
de revenir dessus via le sélecteur.

## Localisation

Le composant utilise `Date.prototype.toLocaleString` avec la locale
navigateur ("default") pour formater les noms de mois et jours de
semaine. **Pas d'override de locale via props**.

Sur un user dont le navigateur est en `fr-FR`, l'affichage sera en
français. Sur un user en `en-US`, en anglais. Si tu veux forcer une
locale, fork le composant pour passer `"fr-FR"` à
`toLocaleString({...})`.

## Form-awareness

`<Calendar>` consomme `useField({ name, value, defaultValue, onChange,
errors: () => ({}) })`. La fonction d'errors est `() => ({})` : **pas
de validation native** intégrée. Pour valider :

- En tant que parent qui contrôle (`value` + `onChange`) : valide la
  date à la main et affiche l'erreur via ton propre `<Label>` /
  message.
- En tant que champ dans `<Form>` : ajouter une règle custom dans
  `onPreSubmit` pour vérifier `form.values.date`.

## Slots de styling

| Slot | Cible |
|------|-------|
| `containerProps` | wrapper racine |
| `upperContainerProps` | barre supérieure (flèches + mois + année) |
| `PreviousButton` / `NextButton` | flèches de navigation mois |
| `monthAndYearContainerProps` | conteneur "Mois Année" |
| `monthProps` / `yearProps` | textes mois et année |
| `lowerContainerProps` | grille des jours (scrollable horizontalement) |
| `dayAndWeekDayContainerProps` | cellule (jour + libellé jour de la semaine) |
| `weekDayProps` | libellé "Lun", "Mar", … |
| `dayProps` | numéro du jour |

## Props

| Prop | Type | Défaut | Notes |
|------|------|--------|-------|
| `id` | string | - | identifiant logique |
| `name` | string | - | pour form-awareness |
| `value` | string ISO | - | controlled |
| `onChange` | func | - | `(isoString) => void` |
| `defaultValue` | string ISO | `null` | uncontrolled |
| `yearsInterval` | `[number, number]` | `[2000, 2030]` | borne du sélecteur d'année |
| `onMonthChange` | func | - | `(month: 1..12) => void` |
| `onYearChange` | func | - | `(year: number) => void` |

## Limites connues

- **Sélection unique** : pas de range (la note `// IDEA interval` dans
  le code marque cette feature comme envisagée mais pas livrée).
- **Pas de désactivation de dates** (weekends, jours fériés, dates
  passées) via props. Solution : surcharger `dayProps` avec un
  callback qui inspecte la date affichée — pas évident, mieux vaut
  forker pour cet usage.
- **Pas de minutes / secondes** : c'est un date picker, pas un datetime
  picker. Pour l'heure, mixer avec `<Input type="time">`.
- **Locale non configurable** via props.
- **Format ISO uniquement** côté valeur.

## Voir aussi

- `<Form>` + `useForm` pour le câblage formulaire.
- `formats/Datetime` pour formater une date à l'affichage (lecture
  seule).
