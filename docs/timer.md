# Timer

`<Timer>` est un champ de saisie de **durée** multi-unités : jours,
heures, minutes, secondes. La valeur sortie est un nombre de **secondes
total**. Form-aware via `useField` + validation `required` / `min` /
`max`.

Cas d'usage : durée d'intervention, temps passé, TTL d'un cache,
durée de réservation, etc.

## Import

```jsx
import { Timer } from "@cap-rel/smartcommon";
```

## Exemple

```jsx
import { useState } from "react";
import { Timer } from "@cap-rel/smartcommon";

const Demo = () => {
    const [duration, setDuration] = useState(0);
    return (
        <Timer
            label="Durée d'intervention"
            value={duration}             // en secondes
            onChange={setDuration}
            min={60 * 5}                  // 5 minutes minimum
            max={60 * 60 * 8}             // 8 heures maximum
        />
    );
};
```

Dans un `<Form>` :

```jsx
<Timer name="duration" label="Durée" required min={60} />
// form.values.duration -> nombre en secondes
```

## Forme de la valeur

**Nombre entier de secondes** (ou `0` quand vide). C'est la
représentation interne unique : pas d'objet `{ days, hours, ... }`.

Conversion :

- **Secondes -> objet `{ days, hours, minutes, seconds }`** : utiliser
  `secsToDuration(value)` du module `lib/utils` (utilisé en interne par
  le composant).
- **Objet -> secondes** : addition pondérée
  `d*86400 + h*3600 + m*60 + s`.

## Comportement

- **Cellules tappables + molette** : le bandeau affiche une cellule par
  unité visible ("Jours", "Heures", "Minutes", "Secondes"). Taper une
  cellule ouvre un **panneau unique** ancré sous le champ, avec une
  colonne defilante par unité (façon "wheel picker" tactile). La colonne
  tapée est mise en avant. Fermeture au clic-extérieur ou via le bouton
  "OK" (la valeur est appliquée en direct, le bouton ne fait que fermer).
  Aucun clavier système n'est sollicité : tout se fait au scroll/tap.
- **Plages par colonne** : heures 0-23, minutes 0-59, secondes 0-59.
  Pour les **jours**, la colonne est bornée à `maxDays` si fourni, sinon
  dérivée de `max` (`floor(max / 86400)`), sinon **0-99** par défaut (une
  liste 0-9999 serait inutilisable au scroll).
- **Pas de carry automatique** : choisir une valeur n'entraîne aucun
  débordement vers l'unité supérieure ; chaque colonne édite uniquement
  son unité.
- **Affichage zéro-padded** : `formatUnit(5)` -> `"05"` pour les
  unités à 2 chiffres (jours affichés sans padding).
- **`showSeconds={false}`** : la colonne et la cellule "Secondes" sont
  masquées. Dans ce mode, éditer une unité >= minute annule le résidu de
  secondes pré-existant (le user ne voit/contrôle que des minutes
  entières).

## Validation

Trois règles intégrées :

| Règle | Condition | Message |
|-------|-----------|---------|
| `required` | `required && currentValue === 0` | "Ce champ est requis." |
| `min` | `currentValue < min` (si `min` fourni) | "La durée doit être de {formatDuration(min)} au minimum." |
| `max` | `currentValue > max` (si `max` fourni) | "La valeur doit être de {formatDuration(max)} au maximum." |

`formatDuration(seconds)` produit une chaîne du genre `"1 h 30 min"`,
intégré dans le message.

## Slots de styling

| Slot | Cible |
|------|-------|
| `containerProps` | wrapper racine |
| `durationContainerProps` | bandeau bordé contenant les cellules |
| `cellProps` | cellule tappable d'une unité (état fermé) |
| `separatorProps` | séparateur ":" entre cellules |
| `dropdownProps` | panneau de molettes (état ouvert) |
| `columnsContainerProps` | conteneur flex des colonnes |
| `columnProps` | une colonne (par unité) |
| `columnHeaderProps` | en-tête de colonne (libellé d'unité) |
| `columnListProps` | liste défilante d'une colonne |
| `optionProps` | une valeur dans une colonne |
| `okButtonProps` | bouton "OK" du pied de panneau |

Plus les slots `<Label>` standards (label, requiredStar, help, errors).

## Props

| Prop | Type | Défaut | Notes |
|------|------|--------|-------|
| `id` / `name` | string | - | identifiant + form-awareness |
| `value` | number | - | controlled (secondes) |
| `defaultValue` | number | - | uncontrolled |
| `onChange` | func | `noop` | `(seconds) => void` |
| `required` | bool | - | active la règle |
| `min` | number | - | secondes minimum (validation) |
| `max` | number | - | secondes maximum (validation) ; borne aussi la colonne Jours si `maxDays` absent |
| `maxDays` | number | dérivé de `max`, sinon 99 | borne haute de la colonne Jours (la valeur 0 est toujours incluse) |
| `showSeconds` | bool | `true` | affiche/masque la colonne et la cellule Secondes |
| `disabled` / `readOnly` | bool | - | empêche l'ouverture du panneau |
| `label` / `help` / `icon` / `prefix` / `suffix` | - | - | passés à `<Label>` |

## Limites connues

- **Pas de carry entre unités** : saisir 90 minutes ne devient pas
  "1 h 30 min" automatiquement. Le user doit décomposer lui-même OU
  le caller normalise via `secsToDuration` après réception.
- **Pas de notation rapide** type "1h30" : sélection unité par unité.
- **Pas de mode "chronomètre"** : c'est un champ de saisie, pas un
  compteur live. Pour mesurer un temps écoulé, ajouter un `useEffect`
  + `setInterval` côté caller.
- **Messages d'erreur en français en dur** (pas extraits en `labels`).
- **Colonne Jours bornée** à `maxDays` / dérivé de `max` / 99 par
  défaut. Une durée plus longue reste représentable par la valeur en
  secondes, mais n'est pas sélectionnable à la molette au-delà de cette
  borne.
- **Valeurs négatives non supportées** : pas de "durée signée".

## Voir aussi

- `<Calendar>` : pour une date fixe (pas un intervalle).
- `formats/Duration` : formateur d'affichage de durée en lecture seule
  (utilise `formatDuration` en interne).
