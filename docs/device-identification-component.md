# DeviceIdentificationComponent

`<DeviceIdentificationComponent>` est le formulaire qu'affiche une PWA
juste après le login, lorsque smartAuth a renvoyé une liste d'appareils
logiques (`user.deviceOptions`) parmi lesquels l'utilisateur doit
choisir : sélectionner un appareil existant ("mon iPhone Eric") ou
nommer un nouvel appareil.

Cas d'usage :

- Mode "production" smartAuth 2.0+ où un même utilisateur peut avoir
  plusieurs appareils logiques pour partager une session entre toutes
  ses PWAs cap-rel sur le même téléphone.
- Premier login depuis un nouvel appareil physique : la liste est vide,
  on ne demande qu'un label pour l'enregistrer.

## Import

```jsx
import { DeviceIdentificationComponent } from "@cap-rel/smartcommon";
```

## Exemple

```jsx
import { useNavigate } from "react-router-dom";
import { DeviceIdentificationComponent } from "@cap-rel/smartcommon";

export const DeviceIdentificationPage = () => {
    const navigate = useNavigate();
    return (
        <DeviceIdentificationComponent
            onSuccess={() => navigate("/")}
            onError={(err) => console.error("[device-ident]", err)}
        />
    );
};
```

À monter typiquement derrière `<RouteGuard requireDeviceIdentification>`
(cf [route-guard.md](route-guard.md)).

## Comportement

Le composant lit `useApi().user.deviceOptions` pour décider du rendu :

- **`deviceOptions` vide ou absent** : seul le champ "Nom de l'appareil"
  est affiché. Submit = enregistrement d'un nouvel appareil.
- **`deviceOptions` présent** (liste d'objets `{ uuid, label }`) : un
  radio "checker" propose les appareils existants + une option "Nouvel
  appareil" (qui révèle le champ label).

Submit -> `api.identifyDevice({ label, uuid })` :

- `uuid === noDeviceValue` (défaut `"noDevice"`) -> backend doit créer
  un nouvel appareil avec le `label` fourni.
- `uuid` correspond à un device existant -> backend lie l'appareil
  physique courant à cet appareil logique (aucun label requis).

À succès, le backend smartAuth **clear automatiquement**
`user.deviceOptions` dans `gst.local`. **Ne pas dispatch** de
`updateUser({ deviceOptions: undefined })` redondant côté projet
(historiquement un no-op qui prête à confusion).

## i18n + mapping d'erreur

Comme `<LoginComponent>`, pas de `useTranslation()` interne. Passer les
chaînes via `labels` (merge partiel avec `DEFAULT_LABELS` exporté). En
cas d'erreur réseau / 4xx, fournir `getErrorLabel(err)` pour un message
contextuel (retourner `null` -> fallback sur `labels.identifyError`).

## Props

| Prop | Type | Défaut | Notes |
|------|------|--------|-------|
| `onSuccess` | func | requis | appelée après `api.identifyDevice` réussi |
| `onError` | func | - | log uniquement, l'UI affiche déjà le message |
| `getErrorLabel` | `(err) => string\|null` | - | override label d'erreur |
| `noDeviceValue` | string | `"noDevice"` | doit ne PAS collider avec un UUID réel de `deviceOptions` |
| `icon` | elementType | `MdDevices` | passer `null` masque icône + titre |
| `abortTimeoutMs` | number | `15000` | timeout par défaut |
| `identifyTimeoutMs` | number | - | override timeout du `api.identifyDevice` |
| `labels` | object | `DEFAULT_LABELS` | merge partiel |

### Slots de styling (`*Props`)

| Slot | Cible |
|------|-------|
| `containerProps` | `<div>` racine |
| `formProps` | `<form>` |
| `iconWrapperProps` | wrapper de l'icône + titre |
| `iconProps` | icône |
| `titleProps` | titre |
| `descriptionProps` | description (l'un des deux variants) |
| `devicesCheckerProps` | `<Checker>` (liste radio des appareils) |
| `labelInputProps` | input "Nom de l'appareil" |
| `submitButtonProps` | bouton "Valider" |
| `errorAlertProps` | bloc d'erreur |

## Voir aussi

- [login-component.md](login-component.md) : étape précédente. Quand le
  backend renvoie `needs_device_pick: true`, `<LoginComponent>` bascule
  directement sur son `<DevicePicker>` interne ; ce composant-ci sert
  pour le sas suivant (clé `deviceOptions`).
- [route-guard.md](route-guard.md) : pour mounter cette page derrière
  `requireDeviceIdentification`.
- Backend : `~/dev/smartauth/api/UserDeviceController.php` (endpoint
  `device`).
