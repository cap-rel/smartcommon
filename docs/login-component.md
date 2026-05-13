# LoginComponent

`<LoginComponent>` est un formulaire de connexion Dolibarr clé en main :
email + mot de passe, sélection optionnelle d'entité multi-companies,
case "accès partagé", et flow QR pairing intégré avec smartAuth.

Cas d'usage typiques :

- toutes les PWA cap-rel (smartInterventions, capTodo, capCRM, eTicket,
  doliCollect, etc.) qui s'authentifient contre un Dolibarr + smartAuth ;
- desktop secondaire qui veut autoriser un mobile via scan QR depuis la
  page de login de Dolibarr.

## Import

```jsx
import { LoginComponent } from "@cap-rel/smartcommon";
```

## Exemple minimal

```jsx
import { LoginComponent } from "@cap-rel/smartcommon";
import { useNavigate } from "react-router-dom";

export const LoginPage = () => {
    const navigate = useNavigate();
    return (
        <LoginComponent
            onSuccess={() => navigate("/")}
            onError={(err) => console.error("[login]", err)}
        />
    );
};
```

`useApi` (monté par `<Provider>`) gère la persistance du token et la
détection `rememberMe` / `sharedDevice`. Pas d'appel manuel à
`api.login` ni de gestion d'`accessToken` côté consommateur.

## Comportement

- **Mode email + mot de passe** : `required` HTML5 sur les deux champs.
  Submit -> `api.login({ login, password, entity?, rememberMe })`.
- **Entité (multi-companies)** : `showEntities` (défaut `true`). Liste
  chargée via `api.getEntities()`. Cachée si une seule entité ou si
  `showEntities={false}`.
- **Accès partagé / non sécurisé** : `showSharedDevice` (défaut `true`).
  Case cochée par l'utilisateur => `rememberMe: false` envoyé à
  l'API. Décochée (défaut) => `rememberMe: true`, le user est persisté
  en localStorage et les retours d'app sautent la page de login.
- **QR pairing** (`enableQrPair`, défaut `true`) : un bouton "Scanner un
  QR code" ouvre le `<BarcodeScanner>` interne. Une fois un pairing_id
  valide capturé :
  1. `POST /qr-pair/{id}/claim` (avec `device_label`, `device_uuid`),
  2. poll `POST /qr-pair/{id}/poll` à `qrPollIntervalMs` (défaut 2s)
     jusqu'à `consumed` ou expiration globale `qrTimeoutMs` (défaut 2min),
  3. à `consumed` : tokens persistés en localStorage (QR = trusted
     device par design), `onSuccess` appelé.
  Pendant claim+poll, un overlay plein écran bloque l'UI et expose un
  bouton "Annuler". Le scanner se ferme dès qu'un QR a été lu (la caméra
  se libère).

### Garde-fous

- **Idempotence claim** : un double scan rapide (cas Android où le focus
  retraite le même payload) est rejeté côté composant pour éviter le
  409 "pairing_not_claimable" du backend.
- **Timeout global QR** : si `consumed` n'est pas atteint dans
  `qrTimeoutMs`, le poll est annulé et `labels.pairingTimeout` est
  affiché.
- **Erreur réseau / 4xx** : surfacée via la prop `getErrorLabel(err)` ou
  son équivalent QR `getQrErrorLabel(err)` (cf section "Mapping d'erreur").

## Post-login : choix d'appareil

À partir de smartAuth 2.1, le backend peut renvoyer `needs_device_pick:
true` + la liste des `user-devices` existants (les entités logiques
"mon iPhone", partagées par toutes les PWAs du même device). Dans ce
cas, `<LoginComponent>` bascule automatiquement sur `<DevicePicker>` :

- l'utilisateur choisit "Nouvel appareil" + saisit un label, ou
  sélectionne un appareil existant ;
- `<LoginComponent>` appelle `api.createUserDevice` ou
  `api.linkUserDevice` puis appelle `onSuccess` ;
- `devicePickerProps` / `devicePickerLabels` permettent d'injecter du
  styling et des labels custom au picker.

Si la prop `enableQrPair` était `false` (= projet sans smartAuth), ce
flux ne se déclenche jamais.

## Mapping d'erreur (`getErrorLabel` / `getQrErrorLabel`)

Par défaut, toute erreur sur le login affiche `labels.loginError`. Pour
afficher un message contextuel (verrouillage compte, captcha, etc.),
fournir :

```jsx
<LoginComponent
    getErrorLabel={(err) => {
        if (err.response?.status === 423) return "Compte verrouillé.";
        return null; // null -> fallback sur labels.loginError
    }}
/>
```

Pour le QR pairing, le mapping par défaut est exposé via
`buildDefaultGetQrErrorLabel(labels)` et couvre les codes smartAuth :

| code apiCode / status | label affiché |
|-----------------------|---------------|
| `pairing_not_claimable` / 409 | `pairingAlreadyClaimed` |
| `pairing_not_found` / 404 | `pairingNotFound` |
| `pairing_expired` / 410 | `pairingExpired` |
| `rate_limited` / 429 | `rateLimited` |
| `invalid_pairing_id` / 400 | `invalidQrError` |
| autre | `claimError` |

Override : passer `getQrErrorLabel={(err) => "..."}`. Retourner `null`
laisse jouer le mapping par défaut.

## Props

| Prop | Type | Défaut | Notes |
|------|------|--------|-------|
| `onSuccess` | func | requis | appelée après login ou device-pick |
| `onError` | func | - | log uniquement, l'UI affiche déjà l'erreur |
| `getErrorLabel` | `(err) => string\|null` | - | override label login |
| `getQrErrorLabel` | `(err) => string\|null` | mapping smartAuth | override label QR |
| `showEntities` | bool | `true` | cache le Select si `false` ou si 1 seule entité |
| `showSharedDevice` | bool | `true` | masque la case "Accès partagé" |
| `enableQrPair` | bool | `true` | masque le bouton "Scanner QR" si `false` |
| `qrPollIntervalMs` | number | `2000` | intervalle entre 2 polls |
| `qrTimeoutMs` | number | `120000` | timeout global de la séquence claim+poll |
| `deviceLabel` | string | - | envoyé au backend dans `device_label` |
| `deviceUuid` | string | - | envoyé au backend dans `device_uuid` |
| `abortTimeoutMs` | number | `15000` | fallback pour entities + login si non spécifiés |
| `entitiesTimeoutMs` | number | - | override timeout du `getEntities` |
| `loginTimeoutMs` | number | - | override timeout de `api.login` |
| `labels` | object | `DEFAULT_LABELS` | merge partiel, voir section i18n |
| `devicePickerProps` | object | - | spread au `<DevicePicker>` (styling) |
| `devicePickerLabels` | object | - | labels picker (merge partiel) |

### Slots de styling (`*Props`)

Chacun est spread sur l'élément cible :

| Slot | Cible |
|------|-------|
| `containerProps` | `<div>` racine |
| `formProps` | `<form>` |
| `inputProps` | champ email |
| `passwordInputProps` | champ mot de passe |
| `selectProps` | `<Select>` entité |
| `booleanProps` | case "Accès partagé" |
| `submitButtonProps` | bouton "Se connecter" |
| `scanQrButtonProps` | bouton "Scanner QR" |
| `qrSeparatorProps` | séparateur "ou" |
| `qrOverlayProps` | overlay plein écran pendant claim/poll |
| `errorAlertProps` | bloc d'erreur login |
| `qrErrorAlertProps` | bloc d'erreur QR |

`twMerge` est appliqué en interne donc les `className` du consommateur
écrasent proprement les classes par défaut sans collision Tailwind.

## i18n

La prop `labels` reçoit un objet partiel mergé avec `DEFAULT_LABELS`.
Liste complète des clés : voir `DEFAULT_LABELS` dans
[src/lib/components/others/LoginComponent/props.js](../src/lib/components/others/LoginComponent/props.js).

Exemple en anglais :

```jsx
<LoginComponent
    onSuccess={...}
    labels={{
        emailLabel: "Email",
        passwordLabel: "Password",
        submitLabel: "Sign in",
        loginError: "Invalid credentials or network error.",
    }}
/>
```

Important : `<LoginComponent>` n'utilise **PAS** `useTranslation()` en
interne. C'est le consommateur qui wire son moteur i18n et passe les
chaînes via `labels`.

## Helpers exportés

```js
import {
    LoginComponent,
    DEFAULT_LABELS,
    buildDefaultGetQrErrorLabel,
    extractPairingId,
} from "@cap-rel/smartcommon";
```

- `DEFAULT_LABELS` : objet des chaînes par défaut, utile pour construire
  un `labels` enrichi sans dupliquer les valeurs.
- `buildDefaultGetQrErrorLabel(labels)` : retourne le mapping d'erreur QR
  par défaut, paramétré par les labels. Utile si on veut composer son
  propre `getQrErrorLabel` au-dessus du mapping standard.
- `extractPairingId(raw)` : essaie d'extraire un pairing_id (32 hex)
  d'une chaîne arbitraire. Accepte : `"deadbeef..."`, URL contenant
  `/qrpair/{32hex}` ou `/qr-pair/{32hex}`, JSON contenant
  `{ pairing_id: "..." }`. Retourne `null` si rien trouvé. Utile pour
  intégrer le scan dans un flow custom.

## Référence backend

- `~/dev/smartauth/api/AuthController.php` (`POST /login`,
  `GET /entities`, `POST /refresh`).
- `~/dev/smartauth/api/QrPairController.php` (`POST /qr-pair/{id}/claim`,
  `POST /qr-pair/{id}/poll`).
- `~/dev/smartauth/api/UserDeviceController.php`
  (`POST /account/user-devices`, `POST /account/user-devices/{id}/link`).

## Voir aussi

- [device-identification-component.md](device-identification-component.md) :
  étape suivante après le login quand le user a plusieurs deviceUuid.
- [route-guard.md](route-guard.md) : `<RouteGuard>` redirige vers la
  page hébergeant `<LoginComponent>` quand `requireAuth` est posé.
- [offline.md](offline.md) : useApi (utilisé par LoginComponent en
  interne).
