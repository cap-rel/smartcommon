# DevicePicker

`<DevicePicker>` est l'UI smartAuth ≥ 2.1 qui permet à un utilisateur
de **choisir un appareil logique existant** (sa "voiture", son "iPhone
perso") ou d'**en créer un nouveau** au moment où il se connecte à
une PWA cap-rel sur un device qu'il a déjà utilisé pour d'autres
applications.

Différence avec `<DeviceIdentificationComponent>` :

- `<DevicePicker>` est le **frontale autonome** consommé directement
  par `<LoginComponent>` quand le backend renvoie
  `needs_device_pick: true` après le login. C'est lui qui appelle
  `api.linkUserDevice` / `api.createUserDevice`.
- `<DeviceIdentificationComponent>` est l'étape **post-login** branchée
  sur la valeur `user.deviceOptions` (smartAuth 2.0). Elle appelle
  `api.identifyDevice`.

Dans une PWA cap-rel typique, le caller n'instancie pas `<DevicePicker>`
directement : il passe `devicePickerProps` / `devicePickerLabels` à
`<LoginComponent>`. Le composant est néanmoins exporté pour les apps
qui veulent l'utiliser hors du flow login (ex : page "Gérer mes
appareils").

## Import

```jsx
import { DevicePicker } from "@cap-rel/smartcommon";
```

## Exemple

```jsx
import { DevicePicker } from "@cap-rel/smartcommon";

<DevicePicker
    existingDevices={[
        { id: 17, label: "Mon iPhone", icon: "phone",
          date_lastseen: "2026-05-10", session_count: 3 },
        { id: 18, label: "Mac perso",  icon: "laptop",
          date_lastseen: "2026-05-12", session_count: 1 },
    ]}
    onPick={async (deviceId) => {
        await api.linkUserDevice(deviceId);
    }}
    onCreate={async (label, icon) => {
        await api.createUserDevice({ label, icon });
    }}
/>
```

## Comportement

### Deux modes auto-déduits

- **`list`** (par défaut si `existingDevices.length > 0`) : grille des
  appareils existants + bouton "Nouvel appareil" en bas.
- **`form`** (par défaut si liste vide ; accessible aussi via le
  bouton) : champ "Nom de l'appareil" + `<IconSelect>` parmi phone /
  tablet / laptop / desktop + bouton "Créer cet appareil".

### Callbacks

- `onPick(deviceId)` : numérique. Le composant attend le résolveur (le
  bouton est désactivé pendant l'await). Pas de redirection auto —
  le caller décide.
- `onCreate(label, icon)` : `icon ∈ ["phone", "tablet", "laptop",
  "desktop"]` (toute autre valeur fallback vers `"phone"`, normalisée
  par le helper exporté `normaliseDeviceIcon`).
- `onCancel` : optionnel, affiche un bouton "Annuler". La plupart
  des intégrations le laissent `undefined` (le picker est obligatoire
  dans le flow login).

### Loading externe

`loading={true}` désactive toute l'UI et affiche un spinner sur le
bouton primaire. Utile pour superposer un loading externe (ex :
finalisation du routing post-login) en plus du `localSubmitting`
interne (qui couvre uniquement l'await du callback courant).

### Error externe

`error="..."` affiche un bloc d'erreur en haut du formulaire. Reset à
la charge du caller — le picker ne le clear jamais tout seul.

## Validation du label

- Champ `required` : message `validationLabelRequired`.
- Longueur max **100 caractères** (`DEVICE_LABEL_MAX_LENGTH` exporté) :
  message `validationLabelTooLong`.

## Cards "existing device"

Chaque appareil affiche :

- Icône selon `icon` (normalisée),
- Label,
- "N application(s) connectée(s)" via `formatSessionCount(count,
  labels)` (singulier vs `{count}` template, helper exporté),
- "Dernier accès : <date>" si `date_lastseen` présent.

## i18n

`labels` est mergé partiellement avec `DEFAULT_LABELS` exporté. Liste
des clés dans
[src/lib/components/others/DevicePicker/props.js](../src/lib/components/others/DevicePicker/props.js).

Helpers exportés :

- `SUPPORTED_DEVICE_ICONS` : whitelist `["phone", "tablet", "laptop",
  "desktop"]`.
- `DEFAULT_DEVICE_ICON` : `"phone"`.
- `DEVICE_LABEL_MAX_LENGTH` : 100.
- `normaliseDeviceIcon(icon)` : ramène toute string à une valeur de la
  whitelist.
- `formatSessionCount(count, labels)` : gère le singulier/pluriel.

## Slots de styling

13 slots (`containerProps`, `titleProps`, `descriptionProps`,
`listProps`, `itemProps`, `newDeviceButtonProps`, `formProps`,
`labelInputProps`, `iconSelectProps`, `submitButtonProps`,
`cancelButtonProps`, `errorAlertProps`).

## Props

| Prop | Type | Défaut | Notes |
|------|------|--------|-------|
| `existingDevices` | array | `[]` | `[{ id, label, icon?, date_lastseen?, session_count? }]` |
| `onPick` | func | requis | `async (deviceId) => void` |
| `onCreate` | func | requis | `async (label, icon) => void` |
| `onCancel` | func | - | affiche un bouton "Annuler" si défini |
| `loading` | bool | `false` | lock externe |
| `error` | string | - | bloc d'erreur (parent-driven) |
| `labels` | object | `DEFAULT_LABELS` | merge partiel |

## Voir aussi

- [login-component.md](login-component.md) : flow principal qui
  utilise `<DevicePicker>` en interne.
- [device-identification-component.md](device-identification-component.md) :
  l'autre brique de la chaîne d'identification (smartAuth 2.0,
  `user.deviceOptions`).
- Backend : `~/dev/smartauth/api/UserDeviceController.php`
  (endpoints `account/user-devices/*`).
