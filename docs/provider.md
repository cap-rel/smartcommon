# Provider (root)

`<Provider>` est le composant d'amorçage qu'on monte une seule fois,
tout en haut de l'arbre React d'une PWA cap-rel. Il assemble dans
le bon ordre la pile de contextes indispensable au reste de
smartcommon (Redux, états globaux, API, routage, navigation, thème,
mises à jour PWA, captures d'erreurs, toasts).

Chaque composant cité ici a sa page dans le Storybook publié
(section Components / App), avec une démonstration quand il a un
rendu propre.

## Import

```jsx
import { Provider } from "@cap-rel/smartcommon";
```

## Quand l'utiliser

Toutes les PWA cap-rel. C'est le wrapper unique de `<App />` dans
`main.jsx`. Aucun composant smartcommon ne fonctionne sans lui : ils
consomment au minimum `LibConfigProvider`, `ReduxProvider` et
`ApiProvider`.

## Exemple minimal

```jsx
import { createRoot } from "react-dom/client";
import { Provider } from "@cap-rel/smartcommon";
import "@cap-rel/smartcommon/dist/smartcommon-style.css";

import { App } from "./App";
import { libConfig } from "./libConfig";

createRoot(document.getElementById("root")).render(
    <Provider config={libConfig} pwaUpdate={{ variant: "toast" }}>
        <App />
    </Provider>
);
```

## Schéma de montage

L'ordre est figé dans `components/app/Provider/index.jsx`. Lire de
l'extérieur vers l'intérieur :

```
<ErrorBoundary>              // capture tout ce qui throw en aval (onError, errorFallback, errorLabels)
  <LibConfigProvider>        // expose `config` via useLibConfig()
    <ThemeApplier />         // classe `dark` sur <html> selon config.theme
    <ReduxProvider>          // store RTK (reducers smartcommon + config.globalState.reducers)
      <GlobalStatesProvider> // gst : local / session / values
        <ApiProvider>        // useApi() : ky + auth + erreurs
          <Router>           // BrowserRouter ou HashRouter (config.router, config.basename)
            <NavigationProvider>
              <AnimatePresence mode="wait">
                {children}   // l'app du consommateur
              </AnimatePresence>
            </NavigationProvider>
          </Router>
          <Toaster />                 // monté en frère de Router
          {pwaUpdate && <UpdatePrompt {...pwaUpdate} />}
          {debug && <DebugConsole />}
          {debug && <DebugWarnings />}
        </ApiProvider>
      </GlobalStatesProvider>
    </ReduxProvider>
  </LibConfigProvider>
</ErrorBoundary>
```

Points clés :

- `ErrorBoundary` est le tout-extérieur : si un provider échoue
  pendant le mount initial, on attrape l'erreur ici.
- `LibConfigProvider` doit précéder `ReduxProvider` : ce dernier lit
  `config.globalState.reducers` via `useLibConfig()` pour fusionner
  les reducers du consommateur avec ceux de smartcommon.
- `ApiProvider` dépend de `GlobalStatesProvider` (le client API lit
  l'utilisateur, le device, les tokens dans `gst.local` / `gst.session`).
- `Router` doit englober `NavigationProvider` car ce dernier appelle
  `useLocation` / `useNavigate` de react-router.
- `Toaster`, `UpdatePrompt`, `DebugConsole`, `DebugWarnings` sont en
  frères du `Router`, pas dans `<AnimatePresence>` : ils ne doivent
  pas être démontés lors d'une transition de page.

## Props de `<Provider>`

| Prop | Type | Défaut | Rôle |
|------|------|--------|------|
| `children` | `node` | - | l'arbre applicatif |
| `config` | `object` | - | passé à `<LibConfigProvider value={config}>`, lu via `useLibConfig()` |
| `onError` | `(error, errorInfo) => void` | - | callback de l'`<ErrorBoundary>` racine (journalisation externe, Sentry, etc.) |
| `errorFallback` | `node` | - | élément React affiché si une erreur est capturée |
| `ErrorFallbackComponent` | `elementType` | - | composant `({ error, resetError }) => JSX` (prioritaire sur `errorFallback`) |
| `errorLabels` | `object` | anglais | textes de l'écran d'erreur par défaut, par exemple `locales.fr.ErrorBoundary` |
| `pwaUpdate` | `object` | - | si fourni, monte `<UpdatePrompt {...pwaUpdate} />` (voir section dédiée) |
| `debug` | `boolean` | `false` | monte `<DebugConsole>` + `<DebugWarnings>` en frères |

## Forme du `config`

Le `config` est libre côté schéma (pas de PropTypes stricts). Les clés
réellement lues par smartcommon :

| Clé | Lue par | Description |
|-----|---------|-------------|
| `api.prefixUrl`, `api.timeout` | `ApiProvider` (`useApi`) | URL de base et délai du client API |
| `api.onApiError`, `api.onSessionExpired`, `api.onLoginPersist` | `ApiProvider` | toast d'erreur, session expirée, enrichissement de l'utilisateur à la connexion |
| `theme` | `ThemeApplier` | `"light"` (défaut), `"dark"` ou `"auto"` (suit le système) |
| `router`, `basename` | `Router` | `"browser"` (défaut) ou `"hash"` ; chemin de base du routeur navigateur |
| `components.theme`, `components.themes`, `components.variants` | `useVariantMerger` | thème et variantes par composant |
| `globalState.reducers` | `ReduxProvider` | reducers RTK fusionnés avec ceux de smartcommon |
| `feedback.logBuffer` | journal (`createLogger`) | `false` coupe l'extrait de journal joint par `FeedbackButton` |
| `debug`, `api.debug`, `navigation.debug`, `globalStates.debug` | hooks | journaux détaillés, globalement ou par domaine |

Les clés `auth.api.*`, `i18n.translated` et `storage.*` de l'objet
d'exemple de `components/app/LibConfigProvider/index.jsx` ne sont lues
par aucun composant : ne pas s'appuyer dessus.

## `<ErrorBoundary>`

Class component classique React. Trois modes de fallback (par
priorité décroissante) :

1. `FallbackComponent` - composant `({ error, resetError }) => JSX`.
2. `fallback` - élément React figé.
3. Fallback par défaut (boîte rouge + bouton qui appelle
   `resetError`). Ses textes viennent de `labels`, en anglais par
   défaut : passer `locales.fr.ErrorBoundary` (ou, pour l'instance
   racine, `<Provider errorLabels={locales.fr.ErrorBoundary}>`) pour
   les afficher en français.

`componentDidCatch` journalise toujours dans la console avant d'appeler
`onError`. Le composant est exporté seul (`ErrorBoundary`) si on veut
le réutiliser plus bas dans l'arbre pour des sections critiques (par
exemple autour d'un `<Editor>` lourd).

## `<Toaster>`

Wrapper de `react-hot-toast` monté en frère de `<Router>` avec
`position="top-center"`. C'est lui qui rend les notifications émises
par les composants smartcommon (`toast.error(...)`, `toast.success(...)`).
Aucune prop pour l'instant : la personnalisation passe par les
appels `toast()` du consommateur.

Il n'est utile qu'une fois, au niveau du `<Provider>`. Ne pas le monter
manuellement : il l'est déjà.

## PWA Updates

`vite.config.js` doit utiliser :

```js
VitePWA({
    registerType: "autoUpdate",
    workbox: { skipWaiting: true, clientsClaim: true },
})
```

UI intégrée via `<Provider pwaUpdate={{ ... }}>` :

```jsx
<Provider
    config={libConfig}
    pwaUpdate={{
        variant: "toast", // "toast" | "banner" | "modal"
        position: "bottom", // pour variant="banner"
        autoReload: false,
        checkInterval: 0, // ms, 0 = pas de polling
        versionUrl: "version.json", // null pour ne pas lire de version
        labels: {
            title: "Mise à jour disponible",
            message: "Une nouvelle version est disponible.",
            messageWithVersion: (version) => `La version ${version} est disponible.`,
            reloadButton: "Rafraîchir",
        },
        onUpdateAvailable: () => {},
        onUpdateActivated: () => {},
    }}
>
```

Les trois modes (`toast`, `banner`, `modal`) n'affichent qu'un bouton,
"Rafraîchir" : une mise à jour n'est pas facultative, l'invite reste à
l'écran tant qu'elle n'est pas appliquée. Le libellé `dismissButton`
n'existe plus ; un projet qui le passe encore n'affiche rien de plus.
Pour bloquer l'application jusqu'à la mise à jour, choisir `modal`.

### Numéro de la nouvelle version

Le service worker ne connaît pas le numéro de version. Quand une mise à
jour est détectée, `usePWAUpdate` lit `versionUrl` (par défaut
`version.json`, relatif à l'URL de base du document), que le projet
produit à chaque build :

```json
{ "version": "1.4.0", "notes": "Synchronisation plus rapide." }
```

`notes` est facultatif (texte brut, retours à la ligne conservés).
`UpdatePrompt` affiche alors `messageWithVersion(version)` à la place de
`message`, puis les notes. Si le fichier manque ou est invalide, la
raison est journalisée (`[PWA] ...`) et l'invite garde le message sans
numéro. La lecture ajoute un paramètre anti-cache : sans lui, un projet
qui met tous les `*.json` en précache recevrait le `version.json` de la
version en cours.

Pour une UI sur mesure, utiliser le hook directement :

```js
const {
    updateAvailable,
    updateActivated,
    newVersion,     // null tant que version.json n'est pas lu
    releaseNotes,   // null si absent
    checkForUpdates,
    applyUpdate,
    reloadPage,
} = usePWAUpdate({ autoReload, checkInterval, versionUrl, ... });
```

Internes : le service worker met à jour en arrière-plan -> le hook
écoute `controllerchange` -> set `updateActivated` -> rechargement
automatique ou invite utilisateur.

## Providers NON auto-montés

`smartcommon` expose trois providers qui ne sont PAS dans
`<Provider>` : à brancher à la main si nécessaire, sous `<Provider>`.

### `<ConfirmProvider>`

Boîtes de dialogue `confirm()` / `alert()` accessibles via le hook
`useConfirm()`. À monter sous `<Provider>` mais au-dessus des pages
qui appellent `confirm()` :

```jsx
<Provider config={libConfig}>
    <ConfirmProvider labels={{ cancel: "Annuler", confirm: "OK" }}>
        <App />
    </ConfirmProvider>
</Provider>
```

### `<I18nextProvider>`

Fournit l'instance i18next à l'arbre. Smartcommon ne l'inclut pas
parce que l'instance est configurée par le consommateur (namespaces,
backend de traduction, langue par défaut). À monter au plus haut, en
général juste sous `<Provider>` :

```jsx
<Provider config={libConfig}>
    <I18nextProvider i18n={i18n} language={lang}>
        <App />
    </I18nextProvider>
</Provider>
```

Les textes des composants smartcommon ne passent pas par i18next : ils
se donnent par la prop `labels` (bundles `locales.fr`, `locales.en`...).

### `<ViewportProvider>`

Choisit une fois par session la mise en page mobile, tablette ou
ordinateur et la partage via `useViewport()` ; `<DualShell>` choisit
un rendu par mise en page. À monter sous `<Provider>` :

```jsx
<Provider config={libConfig}>
    <ViewportProvider labels={locales.fr.ViewportProvider}>
        <App />
    </ViewportProvider>
</Provider>
```

## Mode debug

`<Provider debug>` monte deux outils utiles en dev :

- `<DebugConsole>` - console flottante dans la page (utile sur
  mobile où la devtools n'est pas accessible).
- `<DebugWarnings>` - bandeau d'avertissements (warnings smartcommon
  remontés via `gst.local`).

À laisser à `false` en production. Aucune action n'est nécessaire
côté consommateur au-delà du flag.

## Pattern de montage standard

Le squelette type d'une PWA cap-rel :

```jsx
import { createRoot } from "react-dom/client";
import { Provider, ConfirmProvider, I18nextProvider, locales } from "@cap-rel/smartcommon";
import "@cap-rel/smartcommon/dist/smartcommon-style.css";

import { App } from "./App";
import { libConfig } from "./libConfig";
import { i18n } from "./i18n";

createRoot(document.getElementById("root")).render(
    <Provider
        config={libConfig}
        pwaUpdate={{ variant: "toast", labels: locales.fr.UpdatePrompt }}
        errorLabels={locales.fr.ErrorBoundary}
        onError={(err) => console.error("[App] uncaught", err)}
        debug={import.meta.env.DEV}
    >
        <I18nextProvider i18n={i18n} language="fr">
            <ConfirmProvider labels={{ cancel: "Annuler", confirm: "OK" }}>
                <App />
            </ConfirmProvider>
        </I18nextProvider>
    </Provider>
);
```

## Notes

- `<Provider>` n'a pas de démonstration dans le Storybook : il n'a
  aucun rendu propre isolable (c'est un assemblage de contextes). Sa
  page y documente le montage et les props ; le test fumée se trouve
  dans `Provider/index.test.jsx`.
- L'`<AnimatePresence mode="wait">` enveloppe `{children}` pour
  permettre les transitions entre pages via framer-motion. Un TODO du
  source se demande s'il faut le garder par défaut, puisque l'app
  fonctionne sans ; pour l'instant on le laisse.
- Si on retire `<Provider>` au profit d'un montage manuel des
  sous-providers (cas exceptionnel : tests d'intégration), il faut
  respecter exactement l'ordre du schéma ci-dessus.
