# Viewport (mobile / tablet / desktop)

Système de détection et d'override du mode UI courant. Une PWA cap-rel
peut s'adapter à 3 contextes :

- **mobile** : smartphones (cibles tactiles, layout vertical compact)
- **tablet** : tablettes et 2-en-1 en mode tactile (plus d'espace,
  reste touch-first)
- **desktop** : laptops et ordinateurs fixes (souris/trackpad, hover,
  drag)

Le système est composé de :

- `<ViewportProvider>` : décide du mode au boot, mémorise la
  préférence utilisateur, expose le contexte
- `useViewport()` : hook de consommation
- `<DualShell>` : sucre syntaxique pour rendre une UI différente par
  mode
- `detectAutoViewport()` : helper pour réutiliser la même heuristique
  ailleurs (ex : pré-sélection d'un radio)
- Persistance per-device via smartAuth (cf section "Persistance")

## Provider mount

```jsx
import { ViewportProvider } from "@cap-rel/smartcommon";

<ViewportProvider>
    <App />
</ViewportProvider>
```

Le provider est inclus dans le `<Provider>` racine de smartcommon
(cf [provider.md](provider.md)). Si tu utilises `<Provider>`, tu n'as
rien à monter en plus.

### Mount manuel sans `<Provider>` racine

```jsx
<ViewportProvider
    labels={{ confirmReloadMessage: "Recharger pour appliquer ?" }}
    onPreferenceChange={async (next) => {
        // Pour pousser le choix vers smartAuth (cf section Persistance) :
        // await api.setDeviceViewportMode(localUserDeviceId, next);
    }}
>
    <App />
</ViewportProvider>
```

## useViewport()

```jsx
import { useViewport } from "@cap-rel/smartcommon";

const { viewport, isMobile, isTablet, isDesktop, preference, setPreference } = useViewport();
```

| Champ | Type | Notes |
|-------|------|-------|
| `viewport` | `"mobile" \| "tablet" \| "desktop"` | mode effectif courant (figé pour la session) |
| `isMobile` | bool | exclusif (un seul vrai à la fois) |
| `isTablet` | bool | exclusif |
| `isDesktop` | bool | exclusif |
| `preference` | `"auto" \| "mobile" \| "tablet" \| "desktop"` | choix utilisateur stocké dans `localStorage` (`"auto"` = détection à chaque boot) |
| `setPreference` | `(next, opts?) => Promise` | enregistre + reload, cf ci-dessous |

Le hook **throw** si appelé hors d'un `<ViewportProvider>`. Pour un
composant qui doit dégrader gracieusement, lire le contexte directement
via `useContext(ViewportContext)` (qui renvoie `null` si pas de
provider).

## setPreference

```js
await viewport.setPreference("tablet");
// 1. window.confirm(labels.confirmReloadMessage)
// 2. localStorage.setItem("smartcommon.viewport.preference", "tablet")
// 3. await onPreferenceChange("tablet")
// 4. window.location.reload()
```

Variante **silencieuse** (pas de confirm) :

```js
await viewport.setPreference("tablet", { silent: true });
```

Utilisée par `DeviceIdentificationComponent` après une identification :
l'utilisateur vient de cliquer sur le radio, demander confirmation
serait redondant. Le reload reste obligatoire (le viewport est figé
pour la session, cf "Pourquoi figé ?").

Le callback `onPreferenceChange(next)` du provider est await avant le
reload. Lever une exception dedans n'empêche PAS le reload (juste un
`log.error`).

## DualShell

Pour rendre une UI différente par mode sans wiring manuel :

```jsx
import { DualShell } from "@cap-rel/smartcommon";

<DualShell
    mobile={<MobileView />}
    tablet={<TabletView />}
    desktop={<DesktopView />}
/>
```

Fallback quand la prop matchante manque :

| viewport | rendu |
|----------|-------|
| `"mobile"` | `mobile ?? null` |
| `"tablet"` | `tablet ?? desktop ?? mobile ?? null` |
| `"desktop"` | `desktop ?? null` |

Le fallback `tablet -> desktop -> mobile` est volontaire : une tablette
a plus de place qu'un smartphone, le layout desktop y tient mieux que
le layout phone. Une app qui ne pense pas à tablet rend quelque chose
de sensé sans modification.

`<DualShell>` est un sucre. Quand les deux variantes partagent de la
data, ne PAS utiliser `<DualShell>` (chaque branche fetcherait son
propre lot). Préférer :

```jsx
const data = useXxxData();
const { isMobile } = useViewport();
return isMobile ? <MobileView data={data} /> : <DesktopView data={data} />;
```

## Détection auto : algorithme

```js
import { detectAutoViewport } from "@cap-rel/smartcommon";
```

Heuristique appliquée au boot (et exposée pour réutilisation ailleurs,
cf `DeviceIdentificationComponent` qui pré-sélectionne son radio
"Type d'appareil") :

1. `matchMedia("(pointer: fine)").matches` -> `"desktop"`
   (peu importe la taille d'écran)
2. Sinon, calcul du **côté court physique** :
   `Math.min(screen.width, screen.height)` (en pixels CSS).
   - `>= 600 px` -> `"tablet"`
   - `< 600 px` -> `"mobile"`

Pourquoi ce choix :

- **Pointer-primary** plutôt que **largeur viewport** : un iPhone 15
  Pro Max en landscape fait 932 px CSS et passait pour "desktop" sous
  l'ancien `(min-width: 768px)`. Un iPad mini portrait fait 744 px et
  passait pour "mobile". Le pointeur, lui, distingue correctement.
- **`(pointer: fine)`** plutôt que `(any-pointer: fine)` : un iPad +
  Magic Keyboard a un trackpad (`any-pointer: fine = true`) mais
  l'UI doit rester touch-first. iPadOS rapporte
  `(pointer: fine) = false` (touch est primary) -> bien classifié
  tablet.
- **Côté court** plutôt que `innerWidth` : robuste à l'orientation
  (un téléphone en landscape reste mobile).
- **`screen.width` / `screen.height`** plutôt que viewport : reflète
  la taille du moniteur, pas la fenêtre. Un navigateur étroit sur
  desktop continue de rendre du desktop (le pointeur reste fine).

### Cas particulier : Galaxy Fold

Déplié, son côté court est ~673 px (`>= 600`) -> classé **tablet**.
Volontaire : déplié, le Fold est sémantiquement une tablette.

### Cas particulier : iPad + Magic Keyboard

Décision : reste **tablet** (cf rationale ci-dessus). Si une future
version d'iPadOS inverse `(pointer: fine)`, iPad+keyboard basculerait
en desktop. Risque accepté contre le risque inverse de mal-classer
TOUS les iPad+keyboard aujourd'hui.

## Constantes exportées

| Constante | Valeur | Notes |
|-----------|--------|-------|
| `DESKTOP_MEDIA_QUERY` | `"(pointer: fine)"` | unique critère du mode desktop |
| `TABLET_MEDIA_QUERY` | `"(pointer: coarse) and (min-width: 600px)"` | approximation viewport-based ; le vrai test JS utilise `screen.width`/`screen.height` |
| `MOBILE_MEDIA_QUERY` | `"(pointer: coarse) and (max-width: 599.98px)"` | sémantique inverse |
| `MOBILE_MAX_SHORT_SIDE_PX` | `600` | FROZEN : modifier casse silencieusement la détection chez tous les consommateurs |
| `VIEWPORT_PREFERENCE_KEY` | `"smartcommon.viewport.preference"` | clé localStorage |

Pour des breakpoints en CSS pur, utiliser les `_MEDIA_QUERY` -- ils
restent imparfaits sur les smartphones en landscape (le vrai test
nécessite JS) mais suffisent pour des ajustements visuels.

## Préférence utilisateur

`setPreference(value)` accepte 4 valeurs :

| Valeur | Effet |
|--------|-------|
| `"auto"` | revient à la détection auto au prochain boot |
| `"mobile"` | force mobile, ignore l'auto-detect |
| `"tablet"` | force tablet |
| `"desktop"` | force desktop |

Le choix est stocké dans `localStorage` (clé `VIEWPORT_PREFERENCE_KEY`)
**par navigateur**. Pour le partager entre apps SmartMaker installées
sur le même appareil, cf section "Persistance" ci-dessous.

### Pourquoi figé pour la session ?

Le viewport est résolu UNE FOIS au mount du provider. Pas de listener
sur `matchMedia` ni sur `resize`. Conséquences :

- Brancher/débrancher un Magic Keyboard sur iPad ne change PAS le
  viewport en temps réel. Il faut un reload (ou `setPreference`).
- Une PWA qui spawn un BarcodeScanner sans Camera n'a aucun risque de
  basculer brutalement mid-session.

Trade-off accepté pour la stabilité du layout, comme i18n l'est dans
la plupart des apps (changer la langue impose un reload).

## Persistance per-device (smartAuth 2.0.21+)

Depuis smartcommon 1.0.335, le mode UI est persistable côté smartAuth
au niveau du **device logique** (`llx_smartauth_user_devices`). Toute
PWA SmartMaker installée sur le même appareil physique récupère
automatiquement le mode choisi.

### Flow

1. Login -> backend renvoie `existing_user_devices: [{ id, label,
   viewport_mode, ... }]`
2. `DeviceIdentificationComponent` lit cette liste + le legacy
   `deviceOptions` et joint par label
3. Si l'utilisateur pique un device connu, son `viewport_mode` stocké
   est appliqué via `setPreference(silent)` après le link
4. Si l'utilisateur crée un nouveau device, son choix sur le radio
   "Type d'appareil" est envoyé dans le body
   `identifyDevice({label, uuid, viewport_mode})` et persisté côté
   backend

### Updater plus tard (depuis un écran de prefs)

```js
import { useApi } from "@cap-rel/smartcommon";

const api = useApi();
// Trouver d'abord l'id du user_device courant :
const { devices } = await api.listUserDevices();
const current = devices.find(d => d.label === currentDeviceLabel);
// Update :
await api.setDeviceViewportMode(current.id, "tablet");
// Puis recharger localement :
await viewport.setPreference("tablet");
```

Ou plus élégant via `onPreferenceChange` du provider, qui push
automatiquement à chaque appel de `setPreference` :

```jsx
<ViewportProvider
    onPreferenceChange={async (next) => {
        const { devices } = await api.listUserDevices();
        const current = devices.find(d => d.label === api.user?.currentDeviceLabel);
        if (current) {
            await api.setDeviceViewportMode(current.id, next);
        }
    }}
>
```

### Dégradation gracieuse

Si le backend smartAuth est < 2.0.21 (pas de colonne `viewport_mode`),
le champ est `undefined` dans les réponses. Smartcommon traite ça comme
"pas de préférence stockée" -> auto-detect normal. Aucune erreur, aucun
warning. Mettre à jour smartAuth débloque la feature transparentement.

## Patterns courants côté pages

### Layout 100% différent par mode

```jsx
const HomePage = () => (
    <DualShell
        mobile={<HomeMobile />}
        tablet={<HomeTablet />}
        desktop={<HomeDesktop />}
    />
);
```

### Branchement conditionnel léger

```jsx
const Toolbar = () => {
    const { isMobile } = useViewport();
    return (
        <header>
            {isMobile ? <Hamburger /> : <SidebarLinks />}
            <Search />
        </header>
    );
};
```

### Ajout progressif d'un layout tablet

Aujourd'hui les apps cap-rel n'ont souvent que `mobile` + `desktop`.
Avec `1.0.335`, les tablettes sont identifiées comme `tablet` (et plus
comme `desktop`). Pour les pages où le rendu mobile suffit, RIEN à
faire : `<DualShell mobile={M} desktop={D} />` rend `desktop` sur
tablet par fallback (`tablet ?? desktop`). Pour proposer un layout
intermédiaire, ajouter `tablet={T}`.

## Tests

Mocker `matchMedia` + `window.screen` :

```js
const stubMatchMedia = (matchers = {}) => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: matchers[query] === true,
        media: query,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
    }));
};

const stubScreen = (width, height) => {
    Object.defineProperty(window, "screen", {
        configurable: true,
        value: { width, height },
    });
};

// Force tablet auto-detect :
stubMatchMedia({}); // pointer:fine = false
stubScreen(1024, 1366);
```

Voir
`src/lib/components/app/ViewportProvider/index.test.jsx` pour la suite
complète (auto-detect 3-tiers, edge cases iPhone landscape /
iPad+keyboard / Galaxy Fold, setPreference silent, DualShell
fallbacks).

## Voir aussi

- [provider.md](provider.md) : le `<Provider>` racine qui mount
  `ViewportProvider` automatiquement.
- [device-identification-component.md](device-identification-component.md) :
  le composant qui capture le mode UI à l'identification d'un appareil.
- Backend smartAuth : `~/dev/smartauth/ChangeLog.md` (entrée 2.0.21
  pour la colonne `viewport_mode`).
