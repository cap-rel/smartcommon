# Web Push Notifications

Brique clé en main pour les notifications Web Push (VAPID) des PWA
cap-rel adossées à Dolibarr + smartAuth. Deux éléments complémentaires :

- `usePushNotifications` : hook qui gère tout le cycle de vie de
  l'abonnement push côté navigateur (permission, souscription,
  désinscription, liste des abonnements) contre les endpoints
  `/push/*` de smartAuth.
- `<NotificationToggle>` : composant prêt à poser, un interrupteur
  activer/desactiver qui consomme le hook et affiche le bon message
  selon l'état de la permission.

Cas d'usage typiques : une page "Paramètres" de PWA qui propose à
l'utilisateur d'activer les notifications, ou un onboarding qui demande
la permission au bon moment.

## Import

```jsx
import { usePushNotifications, NotificationToggle } from "@cap-rel/smartcommon";
```

## Exemple minimal

Le plus simple : poser le composant.

```jsx
import { NotificationToggle } from "@cap-rel/smartcommon";
import { locales } from "@cap-rel/smartcommon";

export const NotificationSettings = () => (
    <NotificationToggle
        label="Mon téléphone"
        labels={locales.fr.NotificationToggle}
    />
);
```

Pour un contrôle sur mesure, utiliser directement le hook :

```jsx
import { usePushNotifications } from "@cap-rel/smartcommon";

export const CustomToggle = () => {
    const { permission, isSubscribed, isLoading, subscribe, unsubscribe } =
        usePushNotifications();

    if (permission === "unsupported") return <p>Non supporté</p>;
    if (permission === "denied") return <p>Notifications bloquées</p>;

    return (
        <button
            onClick={() => (isSubscribed ? unsubscribe() : subscribe("Mon appareil"))}
            disabled={isLoading}
        >
            {isSubscribed ? "Désactiver" : "Activer"} les notifications
        </button>
    );
};
```

`useApi` (monté par `<Provider>`) fournit le client HTTP : aucun `fetch`
manuel, aucune gestion de token côté consommateur.

## `usePushNotifications`

### API publique

```js
const {
    // State
    permission,          // 'default' | 'granted' | 'denied' | 'unsupported'
    isSubscribed,        // bool : un abonnement push existe-t-il cote navigateur
    isLoading,           // bool : une action est en cours
    error,               // string | null : dernier message d'erreur (en anglais)
    subscriptions,       // Array : abonnements connus du backend

    // Actions
    subscribe,           // async (label?) => boolean
    unsubscribe,         // async () => boolean
    refreshSubscriptions, // async () => void
} = usePushNotifications();
```

### Détection de support

Au montage, le hook vérifie la présence de `serviceWorker` (sur
`navigator`), `PushManager` et `Notification` (sur `window`). Si l'un
manque, `permission` vaut `'unsupported'`, `isLoading` passe à `false`
et toutes les actions sont des no-op qui posent `error` et loguent la
raison. Le hook ne plante jamais dans un environnement non supporté
(vieux navigateur, iOS sans installation PWA, SSR).

### Flux `subscribe(label?)`

1. Demande la permission via `Notification.requestPermission()` si elle
   est encore `'default'` (refus -> `error` posée, retourne `false`).
2. Récupère la clé publique VAPID : `GET push/vapid-public-key`
   (endpoint **public**, sans authentification).
3. Convertit la clé base64url en `Uint8Array` et appelle
   `registration.pushManager.subscribe({ userVisibleOnly: true,
   applicationServerKey })`.
4. Sérialise la subscription et l'envoie au backend :
   `POST push/subscribe` avec `{ subscription: { endpoint, keys:
   { p256dh, auth } }, label }`.
5. Rafraîchit la liste `subscriptions` et retourne `true`.

`label` est optionnel : il permet de nommer l'appareil côté backend
(ex. "iPhone de Marie").

### Flux `unsubscribe()`

Désinscrit des **deux** côtés : `subscription.unsubscribe()` côté
navigateur, puis `DELETE push/unsubscribe` avec `{ endpoint }` côté
backend. Chaque côté est protégé indépendamment : si l'un échoue, la
raison est loguée mais l'autre est quand même tenté pour éviter une
dérive entre navigateur et serveur.

### `refreshSubscriptions()`

Appelle `GET push/subscriptions` et stocke `response.subscriptions`
dans l'état `subscriptions`. Erreur non fatale (endpoint absent, hors
ligne) : la liste précédente est conservée et la raison loguée.

### Renouvellement d'abonnement (`pushsubscriptionchange`)

Le Service Worker ne peut pas ré-enregistrer une nouvelle subscription
côté serveur (il n'a pas de token d'authentification). Le hook écoute
donc les messages `postMessage` du SW de type `push-resubscribe` et
rejoue l'envoi authentifié `POST push/subscribe` avec la nouvelle
subscription. Cette écoute est posée et retirée proprement au montage /
démontage.

## `<NotificationToggle>`

Composant autonome qui rend l'UI adaptée à chaque état de permission :

- `'unsupported'` : message `labels.unsupported`, pas d'interrupteur.
- `'denied'` : message `labels.denied` + indication `labels.deniedHint`.
- `'default'` / `'granted'` : une case à cocher qui bascule
  l'abonnement, désactivée pendant `isLoading`. Le message d'erreur
  éventuel (`error` du hook) est affiché sous l'interrupteur.

### Props

| Prop | Type | Défaut | Notes |
|------|------|--------|-------|
| `label` | string | - | transmis à `subscribe(label)` (nom d'appareil) |
| `labels` | object | `DEFAULT_LABELS` | merge partiel, voir i18n |
| `containerProps` | object | `{}` | spread sur le `<div>` racine |
| `className` | string | - | classes ajoutées au conteneur |

`twMerge` est appliqué en interne : les `className` du consommateur
écrasent proprement les classes par défaut sans collision Tailwind.

### i18n

Comme toutes les briques smartcommon, les `DEFAULT_LABELS` sont en
**anglais** (source de vérité) et 8 bundles de traduction sont fournis.

```jsx
import { NotificationToggle, locales } from "@cap-rel/smartcommon";

// Bundle complet
<NotificationToggle labels={locales.fr.NotificationToggle} />

// Bundle + override projet
<NotificationToggle
    labels={{
        ...locales.fr.NotificationToggle,
        toggleLabel: t("settings.push"),
    }}
/>
```

Clés disponibles : `toggleLabel`, `unsupported`, `denied`, `deniedHint`.
Liste complète à jour : voir `DEFAULT_LABELS` dans
[src/lib/components/others/NotificationToggle/props.js](../src/lib/components/others/NotificationToggle/props.js).

Note : les messages d'`error` renvoyés par le hook sont en anglais (le
hook n'est pas un composant à `labels`). Pour les afficher traduits,
mapper `error` côté consommateur ou utiliser un toggle custom.

## Contrat backend (smartAuth)

| Méthode | Endpoint | Auth | Réponse |
|---------|----------|------|---------|
| `GET` | `push/vapid-public-key` | non | `{ publicKey }` |
| `POST` | `push/subscribe` | oui | `{ id, message }` |
| `DELETE` | `push/unsubscribe` | oui | `{ message }` |
| `GET` | `push/subscriptions` | oui | `{ subscriptions: [...] }` |

Forme d'un élément de `subscriptions` : `{ id, label, user_agent,
created_at, last_used_at, success_count, status }`.

Les URLs sont relatives (sans slash initial) car `useApi` utilise un
`prefixUrl` ky. Les corps POST/DELETE passent par l'option `json:`.

## Dépendances hors smartcommon

Le hook ne produit des notifications visibles qu'avec deux briques
externes en place :

1. **Backend smartAuth** : la classe `PushController` et les routes
   `/push/*` doivent exister, avec des clés VAPID configurées. Tant que
   ce n'est pas le cas, `subscribe()` échoue proprement (erreur loguée,
   pas de crash). Référence : `~/dev/smartauth/documentation/spec_web_push.md`.
2. **Service Worker (template smartboot)** : le SW doit écouter les
   événements `push` et `notificationclick`, et poster un message
   `push-resubscribe` lors d'un `pushsubscriptionchange`. Sans cela,
   l'abonnement peut réussir mais aucune notification ne s'affiche. Le
   hook reste fonctionnel et cohérent dans ce cas (pas de plantage).

## Dégradation

| Situation | Comportement |
|-----------|--------------|
| API navigateur absente | `permission = 'unsupported'`, actions no-op |
| Permission refusée | `subscribe()` retourne `false`, `error` posée |
| Backend `/push/*` absent | erreur catchée et loguée, pas de crash |
| Hors ligne | `refreshSubscriptions` conserve la liste, log la raison |

## Voir aussi

- [provider.md](provider.md) : `<Provider>` qui monte `useApi`.
- [offline.md](offline.md) : le client `useApi` consommé par le hook.
