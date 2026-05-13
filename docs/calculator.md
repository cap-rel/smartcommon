# Calculator

`<Calculator>` est une calculatrice flottante avec FAB déclencheur,
historique (5 lignes), mémoire (M+/M-/MR/MC), raccourcis clavier et
callback `onResult` pour récupérer la valeur calculée. Pensée pour les
saisies numériques où l'utilisateur veut faire un calcul rapide sans
quitter l'écran (saisie de montant, quantité, dimension, etc.).

## Import

```jsx
import { Calculator, CalculatorProvider, useCalculator } from "@cap-rel/smartcommon";
```

## Trois modes d'intégration

### 1. Standalone (uncontrolled, FAB visible)

Le plus simple : on monte le composant quelque part dans l'arbre, le
FAB s'occupe d'ouvrir/fermer la calculatrice tout seul.

```jsx
import { Calculator } from "@cap-rel/smartcommon";

const QuotePage = () => (
    <>
        <main>...</main>
        <Calculator
            position="bottom-right"
            onResult={(value) => console.log("result:", value)}
        />
    </>
);
```

### 2. Controlled (visibilité gérée par le parent)

Quand on veut ouvrir la calculatrice depuis un bouton custom, ou ne
l'afficher que dans un contexte donné. `isOpen` + `onOpenChange`
font office de paire contrôlée.

```jsx
import { useState } from "react";
import { Calculator } from "@cap-rel/smartcommon";

const QuoteLine = () => {
    const [calcOpen, setCalcOpen] = useState(false);
    const [amount, setAmount] = useState(0);

    return (
        <>
            <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value))}
            />
            <button onClick={() => setCalcOpen(true)}>Calculer</button>
            <Calculator
                isOpen={calcOpen}
                onOpenChange={setCalcOpen}
                showFab={false}
                closeOnResult
                onResult={(result) => setAmount(result)}
            />
        </>
    );
};
```

Notez `showFab={false}` (on a notre propre bouton) et `closeOnResult`
(la calculatrice se ferme dès qu'on appuie sur `=`).

### 3. Provider + hook `useCalculator()`

Pour partager une seule instance de calculatrice entre plusieurs
écrans sans la re-monter à chaque fois. Le `CalculatorProvider` la
monte une fois en haut de l'arbre et expose `open(onResult?)`,
`close()`, `toggle()` via `useCalculator()`.

```jsx
import { CalculatorProvider, useCalculator } from "@cap-rel/smartcommon";

// haut de l'app
const App = () => (
    <CalculatorProvider position="center" closeOnResult>
        <Routes>...</Routes>
    </CalculatorProvider>
);

// dans n'importe quel descendant
const PriceField = () => {
    const calc = useCalculator();
    const [price, setPrice] = useState(0);

    return (
        <button onClick={() => calc.open((result) => setPrice(result))}>
            Ouvrir la calculatrice ({price} €)
        </button>
    );
};
```

`open` accepte un callback `onResult` pour ne recevoir que les
résultats déclenchés depuis ce point d'entrée.

## Comportement

- **Operations supportées** : `+`, `-`, `×`, `÷`, `%`, `+/-`,
  `.`. Pas de parenthèses, pas de fonctions trig. Division par zéro
  retourne `0` (pas d'erreur).
- **Display** : auto-formatting des très grands nombres (≥ 1e12 ->
  notation exponentielle 6 décimales). Sinon affichage brut.
- **Historique** : 5 dernières opérations (constante interne
  `MAX_HISTORY=5`, non configurable). Affiché si `showHistory=true`
  (défaut).
- **Mémoire** : `MC` (clear), `MR` (recall), `M+` (ajouter au display),
  `M-` (soustraire du display). Indicateur "M: <valeur>" si non-zéro.
  Désactivable via `showMemory={false}`.
- **Backspace** : effacement du dernier digit du display.

## Raccourcis clavier

Actifs uniquement quand `isOpen=true` (listener global avec garde) :

| Touche | Action |
|--------|--------|
| `0`-`9` | digit |
| `.` | décimale |
| `+` `-` `*` `/` | opérateur (mapped to `+` `-` `×` `÷`) |
| `Enter` ou `=` | calcul |
| `Backspace` | efface dernier digit |
| `Delete` | clear all |
| `%` | percent |
| `Escape` | ferme la calculatrice |

## Positions (`position`)

6 préréglages pour placer la calculatrice ET son FAB :

| `position` | Calculatrice | FAB |
|------------|--------------|-----|
| `bottom-right` (défaut) | coin bas-droite | coin bas-droite |
| `bottom-left` | coin bas-gauche | coin bas-gauche |
| `bottom-center` | bas centré | bas centré |
| `center` | centré écran | coin bas-droite |
| `top-right` | coin haut-droite | coin haut-droite |
| `top-left` | coin haut-gauche | coin haut-gauche |

## Slots de styling

| Slot | Cible |
|------|-------|
| `fabProps` | bouton FAB flottant |
| `Overlay` | overlay sombre (sous-composant) |
| `backdropProps` | wrapper de positionnement |
| `calculatorProps` | corps de la calculatrice |
| `headerProps` | header (titre + close button) |
| `Button` | bouton X (sous-composant) |
| `displayProps` | zone affichage display + expression + mémoire |
| `historyProps` | zone historique |
| `memoryButtonsProps` | grille MC/MR/M+/M- |
| `buttonsProps` | grille principale 4×5 |

## Props

| Prop | Type | Défaut | Notes |
|------|------|--------|-------|
| `isOpen` | bool | - | controlled si défini ; sinon uncontrolled |
| `onOpenChange` | func | - | requis si `isOpen` controlled |
| `onResult` | func | - | `(result: number) => void`, déclenché sur `=` |
| `onClose` | func | - | déclenché à toute fermeture |
| `position` | enum | `"bottom-right"` | voir tableau positions |
| `title` | string | `"Calculator"` | header |
| `zIndex` | number | `40` | overlay z-index |
| `showFab` | bool | `true` | bouton flottant d'ouverture |
| `showOverlay` | bool | `true` | overlay sombre derrière |
| `showHistory` | bool | `true` | section historique |
| `showMemory` | bool | `true` | boutons mémoire + indicateur |
| `fabIcon` | elementType | `FaCalculator` | icône du FAB |
| `closeOnResult` | bool | `false` | auto-close après `=` |
| `id` | string | - | identifiant logique |

## Limites connues

- `MAX_HISTORY=5` non configurable (constante dans le composant).
- Pas de support i18n des labels (header `Calculator`, `M:`, `History`,
  `Delete` en dur). Renommer le titre via `title`, mais les labels
  internes ne sont pas extraits.
- Pas de parenthèses, pas de notation scientifique en entrée, pas de
  conversion d'unités.
- `closeOnResult` ne suspend pas le callback `onResult` qui est déjà
  passé : si le caller ferme la calc avant de capturer, le callback a
  déjà fait son effet (synchrone dans `performCalculation`).

## Voir aussi

- [fab.md](fab.md) (à venir) : composant FAB standalone si vous voulez
  un déclencheur plus riche que celui intégré.
- [modal.md](modal.md) : si vous voulez un dialogue qui inclut une
  calculatrice + autres champs, mounter `<Calculator>` dans une
  `<Modal>` avec `showFab=false` et `showOverlay=false`.
