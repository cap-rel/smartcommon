# DeviceIdentificationComponent

`<DeviceIdentificationComponent>` est le formulaire qu'affiche une PWA
juste après le login, lorsque smartAuth a renvoyé une liste d'appareils
logiques (`user.deviceOptions`) parmi lesquels l'utilisateur doit
choisir : sélectionner un appareil existant ("mon iPhone Eric") ou
nommer un nouvel appareil.

Depuis smartcommon `1.0.335`, le composant capture aussi le **mode UI**
(smartphone / tablette / ordinateur) pour cet appareil, persisté côté
smartAuth et partagé entre toutes les PWAs installées sur le même
appareil physique.

Cas d'usage :

- Mode "production" smartAuth 2.0+ où un même utilisateur peut avoir
  plusieurs appareils logiques pour partager une session entre toutes
  ses PWAs cap-rel sur le même téléphone.
- Premier login depuis un nouvel appareil physique : la liste est vide,
  on demande un label + un type d'appareil pour l'enregistrer.

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
(cf [route-guard.md](route-guard.md)) ET sous un `<ViewportProvider>`
(cf [viewport.md](viewport.md)) pour que le sync de mode UI fonctionne.
Sans `ViewportProvider`, le composant continue de fonctionner mais le
choix de mode UI est ignoré localement (le backend stocke quand même la
valeur pour les prochains démarrages).

## Comportement

Le composant lit `useApi().user.deviceOptions` pour décider du rendu :

- **`deviceOptions` vide ou absent** : champs "Nom de l'appareil" +
  "Type d'appareil" (radio) affichés. Submit = enregistrement d'un
  nouvel appareil avec le mode UI choisi.
- **`deviceOptions` présent** (liste d'objets `{ uuid, label }`) : un
  radio "checker" propose les appareils existants + une option "Nouvel
  appareil" (qui révèle les champs label + type d'appareil).

### Mode UI (`viewport_mode`)

Quand `enableViewportMode={true}` (défaut), un second radio "Type
d'appareil" apparaît UNIQUEMENT sur le chemin "nouvel appareil" (le
mode des appareils connus est déjà stocké côté backend). 4 choix :

- `auto` : détection automatique (défaut, pré-sélectionné via
  `detectAutoViewport()`)
- `mobile` : forcer le mode smartphone
- `tablet` : forcer le mode tablette
- `desktop` : forcer le mode ordinateur

Le composant pré-sélectionne le mode "raisonnable" via
`detectAutoViewport()` (qui inspecte `pointer:fine` + `screen.width`,
cf [viewport.md](viewport.md)). L'utilisateur n'a qu'à valider dans
95% des cas. Override possible via `defaultViewportMode`.

### Soumission

Submit -> `api.identifyDevice({ label, uuid, viewport_mode })` :

- `uuid === noDeviceValue` (défaut `"noDevice"`) -> backend doit créer
  un nouvel appareil avec le `label` + `viewport_mode` fournis.
- `uuid` correspond à un device existant -> backend lie l'appareil
  physique courant à cet appareil logique (aucun label requis, et
  `viewport_mode` PAS envoyé pour préserver le choix précédent stocké).

À succès, le backend smartAuth **clear automatiquement**
`user.deviceOptions` dans `gst.local`. **Ne pas dispatch** de
`updateUser({ deviceOptions: undefined })` redondant côté projet
(historiquement un no-op qui prête à confusion).

### Sync local du mode UI après identification

Si un `ViewportProvider` est monté ET que le mode résolu (du radio
pour un nouveau device, ou de l'entrée `existingUserDevices`
correspondante pour un device existant) diffère de la `preference`
courante, le composant appelle `viewport.setPreference(mode, { silent:
true })` qui déclenche un reload **silencieux** (sans confirmation
puisque l'utilisateur vient de faire son choix explicitement). Le
viewport effectif sur le prochain boot reflète le choix.

Si les valeurs coïncident, pas de reload, `onSuccess` est appelé
normalement.

## i18n + mapping d'erreur

Comme `<LoginComponent>`, pas de `useTranslation()` interne. Passer les
chaînes via `labels` (merge partiel avec `DEFAULT_LABELS` exporté). En
cas d'erreur réseau / 4xx, fournir `getErrorLabel(err)` pour un message
contextuel (retourner `null` -> fallback sur `labels.identifyError`).

Pour un projet avec react-i18next, mixer le bundle smartcommon + des
overrides :

```jsx
import { locales } from "@cap-rel/smartcommon";

<DeviceIdentificationComponent
    onSuccess={...}
    labels={{
        ...locales.fr.DeviceIdentificationComponent,
        // Surcharge d'un libellé spécifique projet :
        title: t("device.title"),
    }}
/>
```

## Props

| Prop | Type | Défaut | Notes |
|------|------|--------|-------|
| `onSuccess` | func | requis | appelée après `api.identifyDevice` réussi (sauf reload viewport en cours) |
| `onError` | func | - | log uniquement, l'UI affiche déjà le message |
| `getErrorLabel` | `(err) => string\|null` | - | override label d'erreur |
| `noDeviceValue` | string | `"noDevice"` | doit ne PAS collider avec un UUID réel de `deviceOptions` |
| `icon` | elementType | `MdDevices` | passer `null` masque icône + titre |
| `abortTimeoutMs` | number | `15000` | timeout par défaut |
| `identifyTimeoutMs` | number | - | override timeout du `api.identifyDevice` |
| `enableViewportMode` | bool | `true` | masque entièrement le radio "Type d'appareil" si `false` (la requête `identifyDevice` n'envoie alors PAS de `viewport_mode`) |
| `defaultViewportMode` | `"auto" \| "mobile" \| "tablet" \| "desktop"` | `detectAutoViewport()` | override de la pré-sélection (utile en tests) |
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
| `viewportModeCheckerProps` | `<Checker>` (radio "Type d'appareil") |
| `submitButtonProps` | bouton "Valider" |
| `errorAlertProps` | bloc d'erreur |

### Clés de labels

| Clé | Anglais (DEFAULT_LABELS) |
|-----|--------------------------|
| `title` | Device identification |
| `devicesDescription` | Select one of the devices registered on your account, or create a new one for this device. |
| `noDevicesDescription` | No device is registered on your account. Name this device to register it. |
| `devicesCheckerLabel` | Choose a device |
| `noDeviceLabel` | New device |
| `newDeviceInputLabel` | Device name |
| `newDeviceInputHelp` | Choose a name that will let you recognise this device among others (e.g. Eric's iPhone). |
| `newDeviceInputPlaceholder` | My device |
| `viewportModeLabel` | Device type |
| `viewportModeHelp` | Choose how the app should adapt its layout for this device. You can change this later in settings. |
| `viewportModeOptionAuto` | Auto-detect |
| `viewportModeOptionMobile` | Smartphone |
| `viewportModeOptionTablet` | Tablet |
| `viewportModeOptionDesktop` | Desktop |
| `submitLabel` | Validate |
| `identifyError` | Failed to register the device. Check your connection. |

Bundles traduits dans `locales.{fr,de,es,it,pl,nl,pt}.DeviceIdentificationComponent`.

## Voir aussi

- [viewport.md](viewport.md) : le système 3-tiers (mobile/tablet/desktop)
  et l'intégration avec ce composant.
- [login-component.md](login-component.md) : étape précédente. Quand le
  backend renvoie `needs_device_pick: true`, `<LoginComponent>` bascule
  directement sur son `<DevicePicker>` interne ; ce composant-ci sert
  pour le sas suivant (clé `deviceOptions`).
- [route-guard.md](route-guard.md) : pour mounter cette page derrière
  `requireDeviceIdentification`.
- Backend : `~/dev/smartauth/api/AuthController.php` (endpoint legacy
  `POST /device` qui accepte `viewport_mode` depuis smartAuth 2.0.21)
  et `~/dev/smartauth/api/Account/UserDeviceController.php` (endpoint
  `POST /account/user-devices/{id}/viewport-mode` pour update ultérieur).
