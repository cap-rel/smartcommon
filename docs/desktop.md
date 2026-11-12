# Briques desktop

Composants et hooks pour les écrans desktop (souris, clavier, écran large)
des PWA SmartMaker. Ils reprennent le contrat des briques locales de
smartInterventions décrit dans `capdoc:pwa/DESKTOP_UI.md` (section 5) :
un écran qui les utilisait en local passe à smartcommon en changeant
l'import.

Conventions communes :

- textes en anglais par défaut (`DEFAULT_LABELS`), traduits dans les
  bundles (`labels={locales.fr.UserMenu}`) ; aucun `useTranslation`
  interne ;
- slots de style `<élément>Props` (fusion `twMerge`) ;
- bordures, pas d'ombre, sauf pour les éléments flottants (menus) ;
- accessibles au clavier et aux lecteurs d'écran.

## Import

```jsx
import {
    Dropdown, ContextMenu, useContextMenu, useHotkeys, UserMenu, DesktopHeader,
    DesktopSplit,
} from "@cap-rel/smartcommon";
```

## `<Dropdown>`

Menu ouvert au clic : menu utilisateur, menu kebab d'une ligne ou d'une
carte.

```jsx
<Dropdown
    trigger={<button type="button" aria-label="Actions"><FaEllipsisVertical /></button>}
    align="right"
    items={[
        { label: "Modifier", icon: <FaPen />, onClick: edit },
        { label: "Archiver", disabled: !canArchive, onClick: archive },
        { divider: true },
        { label: "Supprimer", danger: true, onClick: remove },
    ]}
/>
```

`items` : `{ label, icon?, onClick?, danger?, disabled?, divider?, key?, testId? }`.

`trigger` :

- un élément (un `<button>` en général) : il reçoit `aria-haspopup`,
  `aria-expanded`, `aria-controls` et le clic qui ouvre et ferme le menu ;
  son propre `onClick` est conservé ;
- une fonction `({ open, toggle, triggerProps }) => node` : l'appelant
  branche `toggle` et étale `triggerProps` (attributs ARIA, id, flèches)
  sur son bouton ;
- tout autre contenu (texte) : enveloppé dans un `<button>`.

Le menu est en `position: fixed`, placé sous le déclencheur (aligné à
droite ou à gauche selon `align`) : il échappe au rognage des conteneurs
scrollables. Il se ferme au clic extérieur, sur Échap, Tab, scroll et
redimensionnement.

Clavier (motif "menu button" WAI-ARIA) :

- Entrée, Espace ou clic ouvrent le menu sur la première entrée ;
  Flèche bas et Flèche haut sur le déclencheur fermé l'ouvrent sur la
  première ou la dernière entrée ;
- dans le menu (`role="menu"`, entrées `role="menuitem"`), les flèches
  passent d'une entrée à l'autre en bouclant et en sautant les entrées
  désactivées, Début et Fin vont aux extrémités ;
- Échap ferme le menu et rend le focus au déclencheur. L'événement est
  marqué traité : une `<Modal>` qui contient le menu reste ouverte ;
- Tab ferme le menu et laisse le focus avancer.

Dans un `DataTable`, envelopper le menu d'une ligne dans
`<span data-row-action>` pour que son clic n'ouvre pas la ligne.

| Prop | Type | Défaut | Notes |
|------|------|--------|-------|
| `items` | array | `[]` | entrées du menu |
| `trigger` | élément, fonction, node | - | déclencheur |
| `align` | `"right"` \| `"left"` | `"right"` | bord du menu aligné sur le déclencheur |
| `menuClassName` | string | `""` | classes du menu |
| `testId` | string | `"dropdown"` | `data-testid` du menu : `${testId}-menu` |
| `zIndex` | number | `50` | z-index du menu |

Slots : `triggerWrapperProps` (enveloppe du déclencheur), `menuProps`,
`itemProps`, `dividerProps`.

## `<ContextMenu>` + `useContextMenu()`

Menu au clic droit, le réflexe "appli native" qui paie dans un outil de
données dense (agir sur une ligne sans chercher son bouton kebab).

```jsx
const ctx = useContextMenu();

<tr onContextMenu={(e) => ctx.open(e, [
    { label: "Ouvrir", onClick: () => openInvoice(row) },
    { divider: true },
    { label: "Supprimer", danger: true, onClick: () => remove(row) },
])}>
    ...
</tr>

// une seule fois dans la page :
<ContextMenu state={ctx} labels={locales.fr.ContextMenu} />
```

`ctx.open(event, items)` annule le menu du navigateur et ouvre celui-ci
au pointeur, gardé dans la fenêtre. Ouvert au clavier (touche menu,
Maj+F10 : pas de position de pointeur), il s'ouvre sous la cible. Les
`items` ont la forme de ceux de `Dropdown`.

`useContextMenu()` renvoie `{ isOpen, x, y, items, returnFocusTo, open,
close }`. `open` est la fonction d'ouverture, comme dans la brique de
smartInterventions ; l'état ouvert se lit dans `isOpen`.

Même menu et même clavier que `Dropdown` (flèches, Début, Fin, Tab). Le
menu prend le focus sur sa première entrée. Échap, ou une entrée
choisie, le ferment et rendent le focus à l'élément qui l'avait à
l'ouverture (la ligne, si elle est focalisable). Un clic extérieur, un
scroll ou un redimensionnement le ferment aussi.

| Prop | Type | Défaut | Notes |
|------|------|--------|-------|
| `state` | object | - | retour de `useContextMenu()` |
| `labels` | object | anglais | `{ menu }` : nom accessible du menu ("Actions") |
| `testId` | string | `"context-menu"` | `data-testid` du menu |
| `zIndex` | number | `60` | z-index du menu |

Slots : `menuProps`, `itemProps`, `dividerProps`.

## `useHotkeys(map, { enabled })`

Raccourcis clavier pour les utilisateurs avancés : "/" pour la
recherche, Échap pour fermer un détail, navigation...

```jsx
const { isDesktop } = useViewport();

useHotkeys({
    "mod+k": () => searchRef.current?.focus(),
    "/": () => searchRef.current?.focus(),
    "escape": closeDetail,
}, { enabled: isDesktop });
```

Une combinaison est une touche en minuscules, précédée au besoin de
`mod+` (Ctrl, ou Cmd sur macOS), `alt+`, `shift+`, dans cet ordre :
`"mod+shift+s"`, `"escape"`, `"j"`, `"space"`. Un raccourci reconnu
annule le comportement du navigateur et appelle `handler(event)`.

- Un raccourci sans Ctrl, Cmd ni Alt (`"/"`, `"j"`) est ignoré pendant la
  saisie dans un champ (`input`, `textarea`, `select`, `contenteditable`) ;
  les combinaisons avec modificateur et Échap restent actives.
- Un événement déjà traité (`defaultPrevented` : l'Échap qui ferme un
  `Dropdown`, un `ContextMenu` ou une confirmation) est ignoré, comme
  une touche tapée pendant une composition de texte (IME).
- La dernière `map` passée est toujours utilisée : un objet écrit en
  ligne ne réabonne pas l'écouteur à chaque rendu.
- `enabled: false` détache l'écouteur (hors viewport desktop par
  exemple).

## `<UserMenu>`

Menu utilisateur épinglé en haut à droite (par `DesktopHeader`) : avatar
(initiales) + nom, puis un `Dropdown` avec Réglages et Déconnexion.

```jsx
<UserMenu labels={locales.fr.UserMenu} />
```

Sans prop, dans le `<Provider>` racine :

- l'utilisateur vient de l'état global (`gst.get("user")`, `username`
  sinon `email`) ;
- Réglages navigue vers `settingsPath` (`"/settings"`) par
  `useNavigation().replace().to()` ;
- Déconnexion appelle `useApi().logout()` avec un `AbortSignal` de
  `logoutTimeoutMs` ms (15 s). L'entrée est désactivée pendant l'appel
  (`labels.loggingOut`), une erreur est journalisée.

Chaque comportement se remplace : `user`, `onSettings`, `onLogout`
(peut renvoyer une promesse). `items` ajoute des entrées entre Réglages
et Déconnexion ; `showSettings={false}` retire Réglages.

Le nom visible est le nom accessible du bouton ; sans nom d'utilisateur,
le bouton est nommé par `labels.account`. Les `data-testid` reprennent
ceux de smartInterventions : `user-menu-trigger`, `user-menu-menu`,
`user-menu-settings`, `user-menu-logout` (préfixe réglable par `testId`).

| Prop | Type | Défaut | Notes |
|------|------|--------|-------|
| `user` | object | état global | `{ username?, email? }` |
| `settingsPath` | string | `"/settings"` | route de Réglages |
| `onSettings` | func | - | remplace la navigation |
| `onLogout` | func | - | remplace `useApi().logout()` |
| `logoutTimeoutMs` | number | `15000` | délai d'abandon du logout |
| `showSettings` | bool | `true` | affiche Réglages |
| `items` | array | `[]` | entrées ajoutées |
| `align` | `"right"` \| `"left"` | `"right"` | alignement du menu |
| `testId` | string | `"user-menu"` | préfixe des `data-testid` |
| `labels` | object | anglais | `settings`, `logout`, `loggingOut`, `account` |

Slots : `triggerProps`, `avatarProps`, `Dropdown` (props du `Dropdown`).

## `<DesktopHeader>`

Barre du haut standard d'une page desktop : bouton retour éventuel,
titre (`<h1>`) avec sous-titre et fil d'Ariane à gauche, recherche au
centre, actions de la page puis `UserMenu` à droite.

```jsx
<div className="flex flex-col h-full">
    <DesktopHeader
        title="Interventions"
        subtitle={`${count} en cours`}
        onBack={() => navigate(-1)}
        search={<Input type="search" placeholder="Rechercher" ... />}
        actions={<Button label="Nouvelle" onClick={create} />}
        labels={locales.fr.DesktopHeader}
        UserMenu={{ labels: locales.fr.UserMenu }}
    />
    <div className="flex-1 min-h-0">...</div>
</div>
```

Séparée du contenu par une bordure basse, sans ombre, `shrink-0` : la
placer au-dessus d'un corps `flex-1 min-h-0`. Le bouton retour, sans
texte visible, est nommé par `labels.back` (aussi en infobulle) et garde
le `data-testid="desktop-header-back"` de smartInterventions.

| Prop | Type | Défaut | Notes |
|------|------|--------|-------|
| `title` | node | - | titre de la page (`<h1>`) |
| `subtitle` | node | - | à côté du titre (référence, compteur) |
| `breadcrumb` | node | - | sous le titre |
| `onBack` | func | - | affiche le bouton retour |
| `search` | node | - | champ de recherche, centré |
| `actions` | node | - | boutons de la page, à gauche du `UserMenu` |
| `showUserMenu` | bool | `true` | `false` sur un écran sans chrome |
| `labels` | object | anglais | `{ back }` |

Slots : `headerProps`, `backButtonProps`, `titleProps`, `subtitleProps`,
`searchProps`, `actionsProps`, `UserMenu` (props du `UserMenu`). Les
attributs `data-*` / `aria-*` posés sur `<DesktopHeader>` arrivent sur le
`<header>`.

## `<DesktopSplit>`

Maître-détail desktop, toujours côte à côte : un écran desktop est large,
il n'y a pas de bascule d'orientation (contrairement au maître-détail
tablette). Le maître (un `DataTable` en général) garde sa largeur, le
détail prend le reste et affiche `placeholder` tant que rien n'est
sélectionné. Chaque volet défile seul.

```jsx
<div className="flex flex-col h-full">
    <DesktopHeader title="Interventions" />
    <div className="flex-1 min-h-0">
        <DesktopSplit
            master={<DataTable ... onRowClick={(row) => setSelected(row)} />}
            detail={<InterventionDetail intervention={selected} />}
            hasSelection={!!selected}
            placeholder={<p className="p-4 text-soft-text">Choisir une intervention</p>}
            masterProps={{ "aria-label": "Interventions" }}
        />
    </div>
</div>
```

`DesktopSplit` prend toute la hauteur (`h-full`) : l'envelopper dans un
conteneur `flex-1 min-h-0` sous le `DesktopHeader`.

Largeur du maître : `masterWidth`, `"w-[56%] max-w-[860px]"` par défaut,
sans préfixe `lg:` : les deux volets restent côte à côte même dans une
fenêtre desktop étroite (la brique de smartInterventions passait le
maître en pleine largeur sous 1024 px et écrasait le détail).

| Prop | Type | Défaut | Notes |
|------|------|--------|-------|
| `master` | node | - | volet gauche |
| `detail` | node | - | volet droit, affiché si `hasSelection` |
| `hasSelection` | bool | `false` | affiche `detail` plutôt que `placeholder` |
| `placeholder` | node | `null` | volet droit sans sélection |
| `masterWidth` | string | `"w-[56%] max-w-[860px]"` | classes de largeur du maître |
| `masterClassName` | string | `""` | classes du maître |
| `detailClassName` | string | `""` | classes du détail |
| `testId` | string | `"desktop-split"` | `data-testid` ; volets `-master` et `-detail` |

Slots : `containerProps`, `masterProps`, `detailProps`. Les volets sont
des `<section>` : un `aria-label` passé par `masterProps` / `detailProps`
en fait des régions nommées pour les lecteurs d'écran.
