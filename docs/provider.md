# Provider (root)

`<Provider>` est le composant d'amorçage qu'on monte une seule fois,
tout en haut de l'arbre React d'une PWA cap-rel. Il assemble dans
le bon ordre la pile de contextes indispensable au reste de
smartcommon (Redux, états globaux, API, routage, navigation, mises
a jour PWA, captures d'erreurs, toasts).

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
<ErrorBoundary>            // capture tout ce qui throw en aval
  <LibConfigProvider>      // expose `config` via useLibConfig()
    <ReduxProvider>        // store RTK (reducers smartcommon + libConfig.globalState.reducers)
      <GlobalStatesProvider> // gst : local / session / values
        <ApiProvider>      // useApi() : ky + auth + erreurs
          <Router>         // BrowserRouter (react-router-dom v7)
            <NavigationProvider>
              <AnimatePresence>
                {children} // l'app du consommateur
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
  `libConfig.globalState.reducers` via `useLibConfig()` pour fusionner
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
| `children` | `node` | -- | l'arbre applicatif |
| `config` | `object` | -- | passé à `<LibConfigProvider value={config}>`, lu via `useLibConfig()` |
| `onError` | `(error, errorInfo) => void` | -- | callback `<ErrorBoundary>` (logging externe, Sentry, etc.) |
| `errorFallback` | `node` | -- | élément React affiché si une erreur est capturée |
| `ErrorFallbackComponent` | `elementType` | -- | composant `(error, resetError) => JSX` (prioritaire sur `errorFallback`) |
| `pwaUpdate` | `object` | -- | si fourni, monte `<UpdatePrompt {...pwaUpdate} />` (voir section dédiée) |
| `debug` | `boolean` | `false` | monte `<DebugConsole>` + `<DebugWarnings>` en frères |

## Forme du `config`

Le `config` est libre côté schéma (pas de PropTypes stricts) mais
les sous-providers consomment des clés bien précises :

| Clé | Consommée par | Description |
|-----|---------------|-------------|
| `globalState.reducers` | `ReduxProvider` | reducers RTK fusionnés avec ceux de smartcommon |
| `i18n.translated` | composants formats / formulaires | active ou non `t()` interne |
| `components.theme` / `components.themes` / `components.variants` | `useVariantMerger` | thème + variantes par composant |
| `components.tailwindCss.mergedClass` | `twMerge` | classes additionnelles a faire reconnaitre |
| `storage.db` / `storage.local` / `storage.session` | hooks de stockage | options de compression |
| `auth.api.url` / `auth.api.paths` / `auth.api.errors` | `ApiProvider` (via `useApi`) | endpoint + mapping d'erreurs |

Voir `components/app/LibConfigProvider/index.jsx` pour la coquille
complète.

## `<ErrorBoundary>`

Class component classique React. Trois modes de fallback (par
priorité décroissante) :

1. `FallbackComponent` -- composant `({ error, resetError }) => JSX`.
2. `fallback` -- élément React figé.
3. Fallback par défaut (boite rouge + bouton "Réessayer" qui appelle
   `resetError`).

`componentDidCatch` log toujours dans la console avant d'appeler
`onError`. Le composant est exporté seul (`ErrorBoundary`) si on veut
le réutiliser plus bas dans l'arbre pour des sections critiques (par
exemple autour d'un `<Editor>` lourd).

## `<Toaster>`

Wrapper de `react-hot-toast` monté en frère de `<Router>` avec
`position="top-center"`. C'est lui qui rend les notifications émises
par les composants smartcommon (`toast.error(...)`, `toast.success(...)`).
Aucune prop pour l'instant -- la personnalisation passe par les
appels `toast()` du consommateur.

Le composant n'a pas de stories et est uniquement utile une fois,
au niveau du `<Provider>`. Ne pas le monter manuellement : il l'est
déjà.

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
        labels: {
            title: "Mise a jour disponible",
            message: "Une nouvelle version est disponible.",
            reloadButton: "Rafraichir",
            dismissButton: "Plus tard",
        },
        onUpdateAvailable: () => {},
        onUpdateActivated: () => {},
    }}
>
```

Pour une UI sur mesure, utiliser le hook directement :

```js
const {
    updateAvailable,
    updateActivated,
    checkForUpdates,
    applyUpdate,
    reloadPage,
} = usePWAUpdate({ autoReload, checkInterval, ... });
```

Internes : le service worker met a jour en arriere-plan -> le hook
ecoute `controllerchange` -> set `updateActivated` -> auto-reload ou
prompt utilisateur.

## Providers NON auto-montés

`smartcommon` expose deux providers qui ne sont PAS dans
`<Provider>` -- a brancher a la main si necessaire :

### `<ConfirmProvider>`

Boites de dialogue `confirm()` / `alert()` accessibles via le hook
`useConfirm()`. A monter sous `<Provider>` mais au-dessus des pages
qui appellent `confirm()` :

```jsx
<Provider config={libConfig}>
    <ConfirmProvider labels={{ cancel: "Annuler", confirm: "OK" }}>
        <App />
    </ConfirmProvider>
</Provider>
```

### `<I18nextProvider>`

Fournit l'instance i18next a l'arbre. Smartcommon ne l'inclut pas
parce que l'instance est configurée par le consommateur (namespaces,
backend de traduction, langue par défaut). A monter au plus haut, en
général juste sous `<Provider>` :

```jsx
<Provider config={libConfig}>
    <I18nextProvider i18n={i18n} language={lang}>
        <App />
    </I18nextProvider>
</Provider>
```

## Mode debug

`<Provider debug>` monte deux outils utiles en dev :

- `<DebugConsole>` -- console flottante dans la page (utile sur
  mobile où la devtools n'est pas accessible).
- `<DebugWarnings>` -- bandeau d'avertissements (warnings smartcommon
  remontés via `gst.local`).

A laisser à `false` en production. Aucune action n'est nécessaire
côté consommateur au-delà du flag.

## Pattern de montage standard

Le squelette type d'une PWA cap-rel :

```jsx
import { createRoot } from "react-dom/client";
import { Provider, ConfirmProvider, I18nextProvider } from "@cap-rel/smartcommon";

import { App } from "./App";
import { libConfig } from "./libConfig";
import { i18n } from "./i18n";

createRoot(document.getElementById("root")).render(
    <Provider
        config={libConfig}
        pwaUpdate={{ variant: "toast" }}
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

- `<Provider>` n'a pas de `.stories.js` : il n'a aucun rendu propre
  isolable (c'est un assemblage de contextes). Le test fumée se
  trouve dans `Provider/index.test.jsx`.
- L'`<AnimatePresence mode="wait">` enveloppe `{children}` pour
  permettre les transitions entre pages via framer-motion. Le TODO
  dans le source ("voir a quoi sert reellement AnimatePresence car
  ca fonctionne sans") concerne la question de savoir s'il faut le
  garder par défaut ; pour l'instant on le laisse.
- Si on retire `<Provider>` au profit d'un montage manuel des
  sous-providers (cas exceptionnel : tests d'intégration), il faut
  respecter exactement l'ordre du schéma ci-dessus.
