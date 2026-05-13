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

- **4 inputs** : "Jours", "Heures", "Minutes", "Secondes". Chacun a un
  `max` interne (jours 9999, heures 23, minutes 59, secondes 59).
  Dépasser le max d'un champ ne déborde pas vers le suivant (pas de
  carry automatique) — c'est `min(saisie, max)`.
- **Affichage zéro-padded** : `formatUnit(5)` -> `"05"` pour les
  unités à 2 chiffres.

## Validation

Trois règles intégrées :

| Règle | Condition | Message |
|-------|-----------|---------|
| `required` | `required && currentValue === 0` | "Ce champ est requis." |
| `min` | `currentValue < min` (si `min` fourni) | "La durée doit être de {formatDuration(min)} au minimum." |
| `max` | `currentValue > max` (si `max` fourni) | "La valeur doit être de {formatDuration(max)} au maximum." |

`formatDuration(seconds)` produit une chaîne du genre `"1 h 30 min"` —
intégré dans le message.

## Slots de styling

| Slot | Cible |
|------|-------|
| `containerProps` | wrapper racine |
| `durationContainerProps` | wrapper des 4 inputs |
| `DaysInput` / `HoursInput` / `MinutesInput` / `SecondsInput` | sous-composants `<Input>` par unité |

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
| `max` | number | - | secondes maximum (validation) |
| `disabled` / `readOnly` | bool | - | |
| `label` / `help` / `icon` / `prefix` / `suffix` | - | - | passés à `<Label>` |

## Limites connues

- **Pas de carry entre unités** : saisir 90 minutes ne devient pas
  "1 h 30 min" automatiquement. Le user doit décomposer lui-même OU
  le caller normalise via `secsToDuration` après réception.
- **Pas de notation rapide** type "1h30" : 4 inputs distincts.
- **Pas de mode "chronomètre"** : c'est un input de saisie, pas un
  compteur live. Pour mesurer un temps écoulé, ajouter un `useEffect`
  + `setInterval` côté caller.
- **Messages d'erreur en français en dur** (pas extraits en `labels`).
- **Max 9999 jours** (env. 27 ans). Au-delà, l'input cap silencieusement.
- **Valeurs négatives non supportées** : pas de "durée signée".

## Voir aussi

- `<Calendar>` : pour une date fixe (pas un intervalle).
- `formats/Duration` : formateur d'affichage de durée en lecture seule
  (utilise `formatDuration` en interne).
