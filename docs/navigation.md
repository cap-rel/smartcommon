# Navigation - Navbar, Sidebar, Tabbar

Smartcommon livre 3 chrome de navigation persistants pour les PWA
cap-rel, déclinés en 3 items spécialisés. Ils sont conçus pour
fonctionner ensemble (mobile = `<Tabbar>` en bas + `<Navbar>` en haut +
optionnel `<Sidebar>` overlay ; desktop = `<Tabbar>` en sidebar latéral
+ `<Navbar>` en haut).

| Composant | Position | Format | Responsive |
|-----------|----------|--------|------------|
| `<Navbar>` | haut écran | barre horizontale | toujours visible (sauf `hideOnScroll`) |
| `<Tabbar>` | bas mobile / latéral desktop | 3-5 onglets | bascule auto via `responsive` |
| `<Sidebar>` | overlay déclenché par bouton | drawer animé | toujours overlay (pas latéral fixe) |

## Auto-mesure et variables CSS globales

Les trois composants partagent un mécanisme : au mount, ils lisent
leur `offsetHeight` et `offsetWidth` et **exposent** ces valeurs en
**variables CSS globales** (via `setGlobalVariables(id, vars)`,
utilitaire `lib/utils`) :

```css
--navbar-height
--navbar-width
--upper-navbar-height
--upper-navbar-width
--tabbar-height
--tabbar-width
```

Conséquence : un layout `<Page>` ou un composant tiers peut réserver
l'espace correspondant via `pt-(--navbar-height)`,
`pb-(--tabbar-height)`, etc. Les variables sont préfixées par `id` du
composant pour permettre plusieurs navbars dans la même app si besoin.

`<Page>` détecte automatiquement la présence de `<Tabbar>` dans son
arborescence et applique le padding-bottom approprié. Pas besoin de
faire ce câblage à la main pour le cas standard.

## `<Navbar>`

Barre supérieure horizontale, "upper" (titre + actions gauche/droite)
+ "bottom" (slot pour tabs, filtres, etc. — caché si pas utilisé).

```jsx
<Navbar
    id="main"
    title="Mes interventions"
    left={[<Button icon={FaBars} onClick={openSidebar} />]}
    right={[<Button icon={FaBell} onClick={openNotifications} />]}
    bottom={[<TabbarItem ... />, <TabbarItem ... />]}
/>
```

Props :

- `id` (requis) : identifiant pour les variables CSS globales.
- `title` : string affiché au centre.
- `left` / `right` / `bottom` : arrays de nodes. Les zones masquées si
  vides.
- `hideOnScroll` (défaut `true`) : la navbar se masque vers le haut
  quand le user scrolle vers le bas, réapparaît au scroll vers le
  haut. Animation framer-motion.
- `responsive` (défaut `true`) : adaptation desktop.

Le `children` est aussi accepté en plus des slots `left`/`right`/`bottom`.

## `<Tabbar>`

Barre d'onglets mobiles (fixed en bas, full width) qui bascule en
sidebar latéral sur desktop quand `responsive=true`. À mounter dans
`<Page>` ou directement dans l'app shell.

```jsx
<Tabbar id="main">
    <TabbarItem id="home"   icon={FaHome}     label="Accueil"  active={path === "/"} onClick={() => navigate("/")} />
    <TabbarItem id="invs"   icon={FaWrench}   label="Interv."  active={path === "/intervention"} onClick={() => navigate("/intervention")} />
    <TabbarItem id="user"   icon={FaUser}     label="Profil"   active={path === "/profile"} onClick={() => navigate("/profile")} />
</Tabbar>
```

Props :

- `id` (requis) : variables CSS globales.
- `responsive` (défaut `true`) : bascule sidebar desktop.
- `hideOnScroll` (défaut `false` — à l'inverse de Navbar) : la
  Tabbar reste visible par défaut (les onglets de navigation principale
  ne devraient pas disparaître au scroll).

`centralButton` est listé comme TODO dans le code, pas implémenté.

## `<Sidebar>`

Drawer overlay déclenché par un bouton dédié. Repose sur `<Panel
position="left">` en interne pour l'animation glissière. Affiche une
liste de liens (`links` prop), chacun étant `{ icon, label, onClick,
badge?, active? }`.

```jsx
<Sidebar
    links={[
        { icon: FaHome,     label: "Accueil",       onClick: () => navigate("/"),     active: path === "/" },
        { icon: FaWrench,   label: "Interventions", onClick: () => navigate("/inter"), badge: 3 },
        { icon: FaGear,     label: "Paramètres",    onClick: () => navigate("/settings") },
    ]}
    toggleButton                                            // affiche le bouton hamburger
    duration={0.18}                                         // durée d'animation
/>
```

Alternative : `children` à la place de `links` pour un layout custom à
l'intérieur du drawer.

Props :

- `links` : array d'objets, ou utiliser `children`.
- `toggleButton` : affiche un hamburger qui ouvre/ferme le drawer.
- `open(fn)` : façon alternative d'exposer le contrôle d'ouverture
  (le caller passe une fonction qui sera appelée avec le toggle).
- `hideButtonOnScroll` : le bouton hamburger disparait au scroll vers
  le bas.
- `duration` : durée d'animation (s).

## Les 3 items spécialisés

Trois composants atomiques pour peupler `<Navbar>` et `<Tabbar>` :

### `<TabbarItem>`

Onglet de bottom-tabbar. Icône + label + badge optionnel + état
`active`.

```jsx
<TabbarItem
    id="home"
    icon={FaHome}
    activeIcon={FaHomeSolid}     // optionnel : icône différente quand active
    label="Accueil"
    badge="3"                    // optionnel : pastille
    active={pathname === "/"}
    onClick={() => navigate("/")}
/>
```

Layout vertical (icône au-dessus, label en-dessous), responsive (sur
desktop la tabbar bascule en sidebar).

### `<LowerNavbarItem>`

Item de la zone `bottom` d'une `<Navbar>`. Même API que `<TabbarItem>`
visuellement mais layout adapté pour une bande horizontale dans la
navbar (et non en bas d'écran).

### `<UpperNavbarItem>`

Item de la zone `upper` (`left`/`right`) d'une `<Navbar>`. Composant
minimaliste (pas de props.js défini), juste un wrapper styling.

> Note : pour des actions classiques dans `left`/`right`, on utilise
> souvent directement `<Button icon=... onClick=...>` plutôt que
> `<UpperNavbarItem>`.

## Pattern d'intégration complet

```jsx
import { Navbar, Tabbar, TabbarItem, Page, Sidebar } from "@cap-rel/smartcommon";

const AppShell = ({ children }) => {
    const { pathname } = useLocation();
    return (
        <>
            <Navbar
                id="main"
                title="smartIntervention"
                left={[<Sidebar links={SIDEBAR_LINKS} toggleButton />]}
                right={[<Button icon={FaBell} onClick={...} />]}
            />
            <Page id="content" location={location}>
                {children}
            </Page>
            <Tabbar id="main">
                <TabbarItem id="home"    icon={FaHome}     label="Accueil"  active={pathname === "/"} onClick={...} />
                <TabbarItem id="invs"    icon={FaWrench}   label="Interv."  active={pathname.startsWith("/inter")} onClick={...} />
                <TabbarItem id="profile" icon={FaUser}     label="Profil"   active={pathname === "/profile"} onClick={...} />
            </Tabbar>
        </>
    );
};
```

## Limites connues

- **`<Tabbar>.centralButton`** : TODO dans le code, pas implémenté (le
  bouton "central rehaussé" type Material n'existe pas encore).
- **Badge sur `<Sidebar>` links** : TODO, partiellement implémenté
  selon le code.
- **Label truncate** dans Tabbar : commentaire TODO mentionne que la
  troncature ne fonctionne pas comme attendu.
- **`<UpperNavbarItem>`** : composant squelette sans propTypes ni
  defaultProps. Préférer `<Button>` direct dans `<Navbar left/right>`
  pour les actions courantes.
- **Pas de mode "scroll horizontal" pour `<Tabbar>`** : si on a >5
  onglets, l'UI tasse. Pas de scroll latéral natif.
- **`hideOnScroll` listener** : posé au document.body, pas filtré par
  scope. Si l'app a un scroll interne (modale ouverte qui scroll), le
  hide peut se déclencher de manière inattendue.

## Voir aussi

- [page.md](page.md) : le conteneur d'écran qui détecte
  automatiquement `<Tabbar>` et réserve l'espace.
- [panel.md](panel.md) : composant sous-jacent à `<Sidebar>`.
- [route-guard.md](route-guard.md) : pour conditionner les écrans
  selon l'auth.
