# RouteGuard

`<RouteGuard>` est un wrapper de route React Router qui décide si une
page doit être rendue ou si l'utilisateur doit être redirigé en fonction
de son état d'authentification + de son état d'identification d'appareil.

Il remplace les patrons `Public/PrivatePagesLayout` et
`Pre/PostDeviceIdentificationLayout` qu'on retrouve dupliqués dans
chaque projet PWA cap-rel.

## Import

```jsx
import { RouteGuard } from "@cap-rel/smartcommon";
```

## Quand l'utiliser

Toutes les PWA cap-rel qui ont (a) une page de login, (b) une page de
choix d'appareil (smartAuth), et (c) des pages métier protégées.

## Exemple (react-router v7)

Wrapping en mode `<Outlet />` (le plus idiomatique avec react-router) :

```jsx
import { Routes, Route } from "react-router-dom";
import { RouteGuard } from "@cap-rel/smartcommon";

<Routes>
    {/* Routes publiques (login, register, ...). Renvoient les users
        connectés vers "/". */}
    <Route element={<RouteGuard requireGuest redirectTo="/" />}>
        <Route path="/login" element={<LoginPage />} />
    </Route>

    {/* Sas d'identification d'appareil : nécessite un user connecté
        ET la présence de user.deviceOptions. */}
    <Route element={<RouteGuard requireDeviceIdentification />}>
        <Route path="/device-identification" element={<DeviceIdentPage />} />
    </Route>

    {/* Toutes les pages métier : connecté + appareil identifié. */}
    <Route element={<RouteGuard requireDeviceIdentified />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/intervention/:id" element={<InterventionPage />} />
    </Route>
</Routes>
```

Wrapping en mode "children" (utile pour protéger un sous-arbre en dehors
de `<Routes>`) :

```jsx
<RouteGuard requireDeviceIdentified>
    <PrivateApp />
</RouteGuard>
```

## Les 4 modes

Chacun se combine librement avec un `redirectTo` custom (sauf pour les
modes device, voir plus bas).

| Prop | Comportement | `redirectTo` par défaut |
|------|--------------|------------------------|
| `requireAuth` | bloque si pas de user connecté | `/login` |
| `requireGuest` | bloque si un user EST connecté | `/` |
| `requireDeviceIdentification` | bloque sauf si `user.deviceOptions` set (le user doit encore choisir) | `/` (déjà identifié) |
| `requireDeviceIdentified` | bloque sauf si `user.deviceOptions` est vide / absent | `/device-identification` |

Les flags `requireDeviceIdentification` et `requireDeviceIdentified`
**impliquent `requireAuth`** : si aucun user, la redirection est forcée
vers `/login` même si un `redirectTo` custom est passé.

## Source de vérité

- `useApi().user` : présence = authentifié.
- `useApi().user.deviceOptions` : présent = le backend smartAuth attend
  encore une sélection d'appareil. Cleared par `api.identifyDevice()` et
  par les endpoints `account/user-devices/{create,link}`.

## Conflits de flags

Combiner deux flags mutuellement exclusifs (`requireAuth + requireGuest`
ou `requireDeviceIdentification + requireDeviceIdentified`) déclenche un
`console.warn` côté dev. Le premier flag listé l'emporte. En production,
le warn est silencieux (mais le comportement reste déterministe).

## Différence avec `<Navigate>` brut

`<RouteGuard>` :
- centralise la logique auth+device dans un seul composant ;
- expose 4 modes nommés au lieu de mélanger les conditions dans chaque
  écran ;
- gère le cas "user pas encore chargé" (rend `<Outlet/>` quand le state
  d'auth est cohérent, redirige sinon).

## Props

| Prop | Type | Défaut | Notes |
|------|------|--------|-------|
| `requireAuth` | bool | `false` | exige un user connecté |
| `requireGuest` | bool | `false` | exige l'absence d'un user |
| `requireDeviceIdentification` | bool | `false` | exige user + `deviceOptions` set |
| `requireDeviceIdentified` | bool | `false` | exige user + `deviceOptions` cleared |
| `redirectTo` | string | par-mode | URL de redirection custom |
| `children` | node | - | si omis, rend `<Outlet/>` (mode react-router) |

## Voir aussi

- [login-component.md](login-component.md) : composant pour `requireGuest`.
- [device-identification-component.md](device-identification-component.md) :
  composant pour `requireDeviceIdentification`.
