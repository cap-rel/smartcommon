# Page

`<Page>` est le conteneur racine d'un écran d'une PWA cap-rel. Il gère :

- la **hauteur dynamique** (`100dvh` mobile, ajustée au visual viewport
  pour absorber le clavier virtuel iOS/Android) ;
- les **transitions animées** entre écrans (framer-motion) selon le
  pathname courant ;
- l'**adaptation desktop** (padding latéral, grille 2 colonnes
  optionnelle) ;
- la **réservation d'espace pour la `<Tabbar>`** (mobile = padding-bottom,
  desktop = margin-left).

Cas d'usage : à mettre comme racine de chaque route métier d'une PWA.

## Import

```jsx
import { Page } from "@cap-rel/smartcommon";
```

## Exemple

```jsx
import { Page } from "@cap-rel/smartcommon";

export const HomePage = () => (
    <Page id="home" responsive>
        <h1>Bienvenue</h1>
        <p>Contenu de la page...</p>
    </Page>
);
```

Sur mobile : page plein écran (`fixed inset-x-0 top-0 h-dvh`),
overflow-y scrollable, padding-bottom auto-réservé pour la Tabbar si
elle existe dans l'arborescence.

Sur desktop (`responsive=true`) : conteneur centré avec padding lateral
(`lg:px-20`), grille 2 colonnes (`lg:grid lg:grid-cols-2`) et marge à
gauche si la Tabbar est utilisée en sidebar.

## Détection auto de la Tabbar

`<Page>` cherche un élément `[data-component='Tabbar']` dans son
arbre au mount et lit son `offsetHeight`/`offsetWidth`. Ces valeurs
alimentent les variables CSS `--page-tabbar-height` / `--page-tabbar-width`
utilisées pour réserver l'espace (padding-bottom mobile, margin-left
desktop).

Implication : la `<Tabbar>` doit être un descendant de `<Page>`, ou
mountée en dehors avec une structure adaptée. Pour les usages les plus
courants (Tabbar globale à l'app), c'est plutôt l'inverse (la Tabbar
englobe les pages), et `<Page>` ne détecte rien — le padding reste
neutre.

## Animations

`<Page>` détecte le changement de `pathname` via la prop `location`
(typiquement `useLocation()` de react-router passé en prop) et déclenche
une animation framer-motion :

- desktop : `fade` toujours.
- mobile : déterminé par une matrice `pages[from][to]` interne. Par
  défaut, transitions `fade` entre les routes. Une route spécifique peut
  imposer un `slideLeft` / `slideRight` selon la direction.

Pour customiser : passer `animations` (objet `{ initial, animate, exit }`
framer-motion) en prop. Le défaut fonctionne pour la grande majorité
des cas.

## Adaptation au clavier virtuel

Sur mobile, `window.visualViewport` est écouté (`resize`, `scroll`). À
chaque changement, la hauteur du `<Page>` est réajustée à
`viewport.height` et son `top` à `viewport.offsetTop`. Conséquence :
quand le clavier mobile s'ouvre, la page rétrécit pile à la hauteur
visible, les champs de saisie en bas restent visibles, pas de scroll
fantôme.

## Slots de styling

| Slot | Cible |
|------|-------|
| `pageProps` | `motion.div` racine (background, padding lateral, classes responsive) |
| `contentProps` | conteneur interne (grille desktop) |

## Props

| Prop | Type | Défaut | Notes |
|------|------|--------|-------|
| `id` | string | - | data-component suffix, log debug |
| `responsive` | bool | `true` | active padding lateral + grille desktop |
| `animations` | object | matrice interne | override framer-motion |
| `location` | object | - | typiquement `useLocation()` de react-router |
| `children` | node | - | contenu de la page |
| `pageProps` | object | - | styling slot racine |
| `contentProps` | object | - | styling slot contenu |

## Voir aussi

- [panel.md](panel.md) : drawer latéral à mounter dans une `<Page>`.
- [popup.md](popup.md) / [modal.md](modal.md) : dialogues modaux.
- `<Tabbar>` : navigation persistante détectée automatiquement par `<Page>`.
