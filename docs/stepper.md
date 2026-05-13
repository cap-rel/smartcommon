# Stepper

`<Stepper>` est un indicateur visuel d'étapes (onboarding, formulaire
multi-pages, workflow). Affichage horizontal ou vertical, 4 statuts par
étape (`completed`, `current`, `upcoming`, `error`), navigation cliquable
optionnelle.

## Import

```jsx
import { Stepper } from "@cap-rel/smartcommon";
```

## Exemple

```jsx
const steps = [
    { label: "Identité", description: "Email + mot de passe" },
    { label: "Appareil", description: "Choix de l'appareil" },
    { label: "Accueil",  description: "Tableau de bord" },
];

<Stepper
    steps={steps}
    currentStep={1}
    orientation="horizontal"
    onStepClick={(index) => navigate(`/onboarding/${index}`)}
/>
```

## Statuts

Un step peut porter un `status` explicite, sinon il est dérivé par
position relative à `currentStep` :

| index vs `currentStep` | status dérivé |
|------------------------|---------------|
| `index < currentStep` | `completed` (badge plein, icône `✓`) |
| `index === currentStep` | `current` (badge bordé, numéro) |
| `index > currentStep` | `upcoming` (badge gris, numéro) |

Le status `error` est explicite (à poser via `step.status = "error"` —
typiquement après une validation échouée). Affiche un badge rouge avec
icône `!`.

## Step shape

```js
{
    label: "Identité",          // node, principal
    description: "Email + ...", // node, optionnel
    icon: FaUser,               // optionnel : remplace le numéro par une icône
    status: "error",            // optionnel : override la dérivation auto
}
```

`icon` accepte un composant (`FaUser`) ou un élément (`<FaUser />`).

## Orientation

- `horizontal` (défaut) : steps en ligne, connecteur horizontal entre.
  Adapté en haut d'un écran d'onboarding ou d'un wizard.
- `vertical` : steps empilés, connecteur vertical. Adapté en sidebar
  d'un workflow long, ou sur mobile pour les workflows avec
  description longue.

## Connecteurs

Entre deux steps, un connecteur visuel (ligne) prend la couleur du
**destination** (le step de droite/bas) :

- destination `completed` ou `current` : connecteur plein (couleur
  primary) = "on est arrivé là".
- destination `upcoming` : connecteur gris = "pas encore".
- destination `error` : connecteur rouge = "blocage ici".

## Click sur un step

`onStepClick(index)` rend tous les steps cliquables. Le composant ne
filtre pas (à toi de décider si tu autorises le retour arrière, le
saut en avant, etc.) :

```jsx
<Stepper
    steps={steps}
    currentStep={2}
    onStepClick={(index) => {
        // permettre uniquement le retour arrière
        if (index < currentStep) navigate(`/step/${index}`);
    }}
/>
```

Si `onStepClick` n'est pas fourni, les steps ne sont pas cliquables
(curseur normal).

## i18n

Une seule chaîne : `labels.stepN(n) => string`. Utilisée comme
`aria-label` des badges :

```jsx
<Stepper
    steps={steps}
    currentStep={0}
    labels={{ stepN: (n) => `Step ${n}` }}
/>
```

`DEFAULT_LABELS.stepN = (n) => \`Étape ${n}\`` est exporté pour
extension.

## Slots de styling

| Slot | Cible |
|------|-------|
| `containerProps` | `<div>` racine |
| `stepProps` | `<div>` de chaque step |
| `stepIndicatorProps` | badge (numéro / icône / `✓` / `!`) |
| `stepIconProps` | icône à l'intérieur du badge |
| `stepLabelProps` | label texte |
| `stepDescriptionProps` | description texte |
| `stepConnectorProps` | ligne de connexion entre 2 steps |

## Props

| Prop | Type | Défaut | Notes |
|------|------|--------|-------|
| `steps` | array | `[]` | `[{ label, description?, icon?, status? }]` |
| `currentStep` | number | `0` | index du step courant |
| `orientation` | enum | `"horizontal"` | `horizontal` \| `vertical` |
| `onStepClick` | func | - | rend les steps cliquables |
| `labels` | object | `DEFAULT_LABELS` | `{ stepN: (n) => string }` |

## Voir aussi

- `<RouteGuard>` + `useNavigate` pour câbler un wizard multi-pages.
- `<Form>` + `useField` pour la validation step-par-step.
