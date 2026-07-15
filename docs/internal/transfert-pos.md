# Transfert de briques smartpos vers smartcommon

## Statut

- **Phase 1 (mai 2026)** : audit smartpos, regroupement dans `mobile/src/features/`. **Fait**.
- **Phase 2 (mai 2026)** : remontée des 3 briques dans `@cap-rel/smartcommon` (PrintService, useBarcodeScanner, NumericPad). **Fait côté smartcommon** : voir la section "Implémentation effective" en fin de document. **Reste à faire côté smartpos** : publier la nouvelle version smartcommon, remplacer les imports `src/features/...` par `@cap-rel/smartcommon`, supprimer les dossiers locaux.

## Contexte

Le projet smartpos (POS Dolibarr, PWA React) a été audité en mai 2026 pour identifier les briques transverses pouvant remonter dans `@cap-rel/smartcommon`. Le chantier a abouti à une structure `mobile/src/features/` qui isole ces briques de la logique métier POS. Ce document liste ce qui est prêt à monter dans smartcommon et ce qui doit rester en local.

Source de vérité : `/home/cc/dev/smartpos/mobile/src/features/`

## État des lieux smartpos

```
mobile/src/features/
  barcodeScanner/
    index.js               # hook useBarcodeScanner
  numericPad/
    index.jsx              # composant NumericPad (variantMerger, tailwind)
    props.js
    variants/
  print/
    ticketBuilder.js       # API ESC/POS bytes (Uint8Array)
    webUSBPrinter.js       # driver WebUSB
    browserPrint.js        # window.print iframe
    printService.js        # queue + retry + registry de renderers
    index.js               # API publique
```

Toutes ces briques ont été extraites des dossiers `services/`, `hooks/`, `components/features/` de smartpos, sans rien casser fonctionnellement (build vite OK, 622 modules transformés).

## Candidats par priorité

### 1. Moteur Print (priorité haute)

**Pourquoi** : c'est la brique la plus juteuse, ~700 lignes de code 100% générique. Couvre USB (ESC/POS), browser print (iframe), gestion de queue avec retry. Toute PWA qui imprime des reçus, bons de livraison ou tickets peut s'en servir.

**Source** : `/home/cc/dev/smartpos/mobile/src/features/print/`

**API publique bas niveau** (classes framework-agnostiques) :
- `TicketBuilder` : classe pour construire des commandes ESC/POS via API fluide (text, line, separator, bold, doubleHeight, alignCenter, cut, openDrawer, qrCode, build)
- `WebUSBPrinter` : driver USB ESC/POS (connect, send, disconnect, isConnected, isSupported)
- `browserPrint(html)` : fonction qui imprime un document HTML via iframe + window.print
- `PrintService` : orchestrateur avec queue + retry. API :
  - `registerJobType(type, { escpos, html })` : enregistre un type de job avec ses renderers
  - `enqueue(type, data, printer)` : met un job en queue (retourne une Promise)
  - `cleanup()` : ferme la connexion USB
  - `pendingCount` : nombre de jobs en attente

**API publique haut niveau** (binding React) :
- `usePrintService({ templates, labels? })` : hook qui instancie un `PrintService`, enregistre tous les types depuis l'objet `templates`, retourne `{ enqueue, pendingCount }`, et appelle `cleanup()` au démontage.

**Emplacement cible dans smartcommon** :
- Classes -> `src/lib/services/print/` (nouveau tier `services/` pour les modules stateful framework-agnostiques ; précédent : aucun. À documenter dans `CLAUDE.md` au moment du transfert.)
- Hook React -> `src/lib/hooks/local/usePrintService/` (suit la convention `usePWAUpdate`)

**Pattern d'utilisation côté consumer** :

```js
import { usePrintService } from "@cap-rel/smartcommon";

const templates = {
    invoice: {
        escpos: (data, builder) => buildInvoiceEscpos(data, builder),
        html: (data) => buildInvoiceHtml(data),
    },
};
const { enqueue } = usePrintService({ templates });
await enqueue("invoice", invoiceData, printerConfig);
```

Pour un usage sans React (script, worker), `PrintService` reste exporté directement.

**i18n** : `PrintService.enqueue` doit pouvoir produire des messages d'erreur localisables (type non enregistré, USB non supporté, protocole `network` non implémenté, échec après retries). Convention smartcommon : passer un objet `labels` au constructeur (`new PrintService({ labels })`) et au hook (`usePrintService({ labels })`), avec un `DEFAULT_LABELS` exporté pour le fallback. Les `Error` levés portent `error.code` (machine) + `error.message` (localisé).

**Configuration imprimante** (forme attendue par `enqueue`) :
```js
{ protocol: "usb"|"network"|"browser", paper_width: 58|80, connection?: "ip:port" }
```

**Limitation connue** : le protocole `network` n'est pas implémenté côté browser (une PWA ne peut pas ouvrir de socket TCP). Un proxy local serait nécessaire. Le service throw avec un message explicite dans ce cas (code `network_not_supported`).

**Travail de transfert** :
1. Copier `ticketBuilder.js`, `webUSBPrinter.js`, `browserPrint.js`, `printService.js` vers `src/lib/services/print/` et créer `index.js` qui exporte les 4 + `DEFAULT_LABELS`
2. Créer `src/lib/hooks/local/usePrintService/index.jsx` (hook wrapper), `props.js` (defaultProps + propTypes), `index.test.jsx` (cf section "Tests" ci-dessous)
3. Ajouter `labels` au constructeur `PrintService` et remplacer les messages d'erreur en dur par `this.labels.xxx`
4. Ajuster les imports relatifs entre fichiers (déjà relatifs, pas de problème)
5. Exporter classes + hook depuis `src/lib/export.js` ET depuis `src/lib/index.js` (dual export, cf `CLAUDE.md`)
6. Côté smartpos : remplacer `import { PrintService } from "src/features/print"` par `import { usePrintService } from "@cap-rel/smartcommon"`, adapter `usePrintService` smartpos pour appeler le hook smartcommon avec `posPrintTemplates` en `templates`, puis supprimer `mobile/src/features/print/`
7. Vérifier que les templates POS (`mobile/src/services/print/TicketTemplates.js`, `posHtmlTemplates.js`, `posPrintTemplates.js`) continuent de fonctionner : ils n'importent pas le moteur, seul `usePrintService` le fait

**Tests à écrire** (`src/lib/services/print/printService.test.js`) :
- `registerJobType` puis `enqueue` du type enregistré -> résolution OK
- `enqueue` d'un type non enregistré -> rejet avec `error.code === "unknown_job_type"`
- File d'attente : 2 jobs simultanés -> exécution séquentielle (mock du renderer pour vérifier l'ordre)
- Retry : renderer throw 2 fois puis OK -> succès au 3e essai ; throw N fois -> rejet final
- `cleanup` -> appelle bien `WebUSBPrinter.disconnect` (mocker le driver)
- Protocole `network` -> rejet avec `error.code === "network_not_supported"`
- `labels` custom -> `error.message` reflète le label fourni

Vitest avec `isolate: true` reste obligatoire (cf `CLAUDE.md`). Mock `WebUSBPrinter` via `vi.mock` au top du fichier.

### 2. useBarcodeScanner (priorité moyenne)

**Pourquoi** : détecte une séquence rapide de keydown depuis un scanner USB (clavier émulé). Pattern réutilisable dans tout module avec lecteur (inventaire, intervention sur site, réception colis).

**Source** : `/home/cc/dev/smartpos/mobile/src/features/barcodeScanner/index.js` (86 lignes)

**API** :
```js
useBarcodeScanner({ onScan: (barcode) => void, enabled?: boolean })
```

**Comportement** :
- Détection basée sur l'intervalle entre touches (< 50ms = scanner, > 50ms = humain)
- Buffer réinitialisé sur Enter ou après 150ms d'inactivité
- Ignore les events provenant d'INPUT/TEXTAREA/SELECT
- Longueur minimale 4 caractères

**Travail de transfert** :
1. Copier vers `src/lib/hooks/local/useBarcodeScanner/index.js`
2. Ajouter `index.test.jsx` (convention smartcommon)
3. Exporter depuis `src/lib/hooks/local/export.js` ET `src/lib/hooks/local/index.js` (dual export)
4. Côté smartpos : remplacer `import { useBarcodeScanner } from "src/features/barcodeScanner"` par `from "@cap-rel/smartcommon"` puis supprimer le fichier local

**Tests à écrire** :
- Saisie rapide (`< 50ms` entre touches) sur 6 caractères + Enter -> `onScan` appelé avec la chaîne
- Saisie lente (`> 50ms`) -> `onScan` non appelé
- Buffer reset après 150ms d'inactivité
- Events depuis `<input>` ignorés (utiliser `document.createElement("input")` comme `event.target`)
- Longueur `< 4` -> ignoré
- `enabled: false` -> hook inactif, listener non attaché

Utiliser `@testing-library/react` + `userEvent.keyboard()` avec `delay` pour simuler les vitesses.

### 3. NumericPad (priorité moyenne)

**Pourquoi** : pavé numérique tactile (tailwind, support integer/decimal, backspace, confirmation). Réutilisable pour saisie de quantité, montant, code PIN, poids.

**Source** : `/home/cc/dev/smartpos/mobile/src/features/numericPad/` (116 + 17 lignes + variants)

**Emplacement cible** : `src/lib/components/form/NumericPad/` (c'est une saisie contrôlée par `value`/`onChange`, donc `form/`, pas `little/`).

**Dépendances** :
- `useVariantMerger` de smartcommon (déjà dispo)
- `<Icon>` de smartcommon (`lib/components/little/Icon`) pour backspace et confirm. NE PAS introduire de dépendance `react-icons` côté lib -- remapper `FaDeleteLeft` -> `<Icon name="backspace">` et `FaCheck` -> `<Icon name="check">` (vérifier les noms exacts dans le registre Icon avant transfert).
- Tailwind (classes inline) -- toute concaténation avec `className` consumer DOIT passer par `twMerge` (cf `CLAUDE.md`).

**Props** :
```js
{
  value: string,       // valeur courante (contrôlé)
  onChange: (v) => void,
  onConfirm?: (v) => void,  // si fourni, bouton de confirmation affiché
  mode?: "integer"|"decimal",  // défaut "integer"
  label?: string,
  labels?: { confirm, clear, ...},  // i18n des aria-label / titres
  className?: string,
}
```

**i18n** : `labels` prop avec `DEFAULT_LABELS` exporté depuis `props.js`. Au minimum : `confirm` ("OK"), `clear` ("Effacer"), `backspace` ("Retour arrière"). Pas de `useTranslation()` interne.

**Travail de transfert** :
1. Copier vers `src/lib/components/form/NumericPad/` (`index.jsx`, `props.js`, `variants/`)
2. Remplacer les imports `react-icons/fa6` par `import { Icon } from "lib/components/little/Icon"` (ou via le barrel `lib/components`)
3. Ajouter `labels` + `DEFAULT_LABELS` dans `props.js` ; injecter sur tous les `aria-label`
4. S'assurer que toute concat de classes utilise `twMerge` depuis `lib/utils` (en particulier la merge avec `className` consumer)
5. Vérifier que les styles tailwind sont compatibles avec le thème smartcommon (couleurs `gray-*`, `blue-*`)
6. Ajouter `index.stories.js` (sans JSX, cf `CLAUDE.md`) + `index.test.jsx`
7. Exporter depuis `src/lib/components/form/export.js` ET `src/lib/components/form/index.js` (dual export)
8. Côté smartpos : remplacer `import { NumericPad } from "src/features/numericPad"` par `from "@cap-rel/smartcommon"` puis supprimer le dossier local

**Tests à écrire** :
- Render avec `value=""` -> grille 0-9 + `.` (mode decimal) ou pas (mode integer)
- Clic sur "5" -> `onChange("5")` ; suite "5", "."(decimal), "2" -> `onChange("5.2")`
- Mode integer : clic sur "." -> `onChange` non appelé (ou bouton désactivé)
- Backspace sur "12" -> `onChange("1")` ; backspace sur "" -> no-op
- `onConfirm` fourni -> bouton confirm rendu, clic -> `onConfirm(value)` appelé
- `onConfirm` non fourni -> bouton confirm absent
- `className` consumer -> mergé avec `twMerge` (assert pas de duplication)
- `labels` custom -> reflété sur les `aria-label`

## Non-candidats explicites

Certaines briques smartpos peuvent sembler transverses mais ne le sont pas. Ne pas les remonter sans analyse complémentaire.

### useSyncService

Déjà fin (~170 lignes) : c'est un bridge entre `useSyncClient` (smartcommon, déjà en place) et le store Redux smartpos + helpers métier (createOrder, addOrderLine). Le coeur sync est déjà dans smartcommon. Pas d'extraction à faire.

Source : `/home/cc/dev/smartpos/mobile/src/hooks/useSyncService.js`

### Customer Display (pairing 2 écrans POS)

Spécifique au cas d'usage "caisse + écran client en vis-à-vis". Le protocole de pairing par QR + polling est très lié à la séquence panier/transaction/remerciement POS. Pas mutualisable.

Source : `/home/cc/dev/smartpos/mobile/src/hooks/useCustomerDisplayManager.js` + `components/features/CustomerDisplay/`

Note : ne pas confondre avec `claimQrPair` / `pollQrPair` déjà dans smartcommon (côté `useApi`) qui concernent l'authentification, pas le pairing inter-écrans.

### Kitchen / Customer order notifications

Spécifiques restauration POS (file d'attente cuisine, notifications de commande client). Pattern "queue de tâches à traiter" potentiellement généralisable, mais le couplage avec les statuts métier POS (sent_to_kitchen, ready, served) est fort. Pas mutualisable en l'état.

Sources :
- `/home/cc/dev/smartpos/mobile/src/hooks/useKitchenNotifications.js`
- `/home/cc/dev/smartpos/mobile/src/hooks/useCustomerOrderNotifications.js`

## Déjà aligné sur smartcommon

### Cache d'images authentifiées

Avant le chantier, smartpos avait un `services/ImageCache.js` (206 lignes) et un `hooks/usePosImage.js` qui dupliquaient maladroitement `useAuthenticatedImage` de smartcommon (avec un bug d'incohérence `cachedAt` ISO string vs timestamp number).

Après convergence (phase 1 du chantier) :
- `services/ImageCache.js` supprimé
- `hooks/usePosImage.js` réécrit comme thin wrapper autour de `useAuthenticatedImage` (smartcommon)
- Dexie : remplacement des stores `productImages` + `categoryImages` par un unique `imageCache: "key"`, bump version 3 -> 4

Source du wrapper smartpos : `/home/cc/dev/smartpos/mobile/src/hooks/usePosImage.js`

Une amélioration possible côté smartcommon serait d'enrichir `useAuthenticatedImage` pour accepter un client `useApi()` (ky) en plus du token brut. Cela éliminerait le besoin du wrapper smartpos. Pertinence à évaluer si plusieurs PWA ont le même cas d'usage.

## Comment vérifier sur place

Avant tout transfert, lire :
- `/home/cc/dev/smartpos/mobile/src/features/*/index.js` : voir l'API publique de chaque brique
- `/home/cc/dev/smartpos/mobile/src/hooks/usePrintService.js` : exemple de consumer de la brique print (registration + enqueue)
- `/home/cc/dev/smartpos/mobile/src/services/print/posPrintTemplates.js` : registry concret de renderers POS

Pour valider que rien n'est cassé côté smartpos après transfert :
```bash
cd /home/cc/dev/smartpos/mobile
npm run build   # doit produire dist/ sans erreur (622 modules transformés au moment du chantier)
npm run lint    # une erreur pré-existante sur vite.config.js (__dirname), pas grave
```

## Pièges identifiés durant le chantier

1. **`useAuthenticatedImage` attend `db` (instance Dexie) + `store` (nom)** : on lui passe `useDb({...})` directement, pas `db.instance`. Le hook fait `db[store]`.

2. **`API_URL` peut finir ou non par `/`** : le wrapper `usePosImage` normalise avec `endsWith("/")`. À reproduire si on consomme directement `useAuthenticatedImage` côté PWA.

3. **Token JWT** : récupéré via `useSelector(state => state.auth.token)` côté smartpos (slice Redux), pour le rendre réactif aux refresh JWT. Éviter `getLocal("auth_token")` direct dans un hook (pas réactif).

4. **PrintService.enqueue est strict** : si on appelle un type non enregistré, le job throw après MAX_RETRIES tentatives. Toujours faire `registerJobType` avant le premier `enqueue`. Côté `usePrintService`, c'est fait au mount via une boucle sur `posPrintTemplates`.

5. **Le store mort `images`** dans Dexie (`mobile/src/db/index.js`) : déclaré mais jamais utilisé. Pas supprimé durant le chantier pour ne pas élargir le scope. À nettoyer séparément si confirmé inutile.

## Conventions smartcommon à respecter au transfert

Toute brique remontée doit être conforme aux conventions du `CLAUDE.md` smartcommon. Récapitulatif applicable à ce chantier :

1. **Dual export obligatoire** : pour chaque composant/hook ajouté, modifier les DEUX barrels de la catégorie (`index.js` ET `export.js`). Oubli typique : `export.js` non mis à jour -> brique absente du package npm publié. Concrètement ici :
   - Print classes -> `src/lib/services/print/{index.js,export.js}` (créer les deux) + `src/lib/export.js`
   - `usePrintService`, `useBarcodeScanner` -> `src/lib/hooks/local/{index.js,export.js}`
   - `NumericPad` -> `src/lib/components/form/{index.js,export.js}`

2. **i18n via `labels` prop** : aucune brique n'utilise `useTranslation()` en interne. Exposer un `labels` prop + `DEFAULT_LABELS` constant exporté depuis `props.js`. Concerne ici `NumericPad`, `usePrintService`, `PrintService` (constructeur).

3. **`twMerge` partout** : toute concaténation `defaultClasses + props.className` doit passer par `twMerge` depuis `lib/utils`. Sinon les conflits Tailwind (ex : `gap-4` vs `gap-6`) ne sont pas résolus.

4. **Icônes via `<Icon>`** : ne pas importer `react-icons` côté lib. Utiliser `lib/components/little/Icon` (vérifier les noms disponibles dans son registre avant de coder).

5. **PropTypes + defaultProps obligatoires** : tout composant (et idéalement les hooks via une validation `props.js`) déclare ses `propTypes` et `defaultProps` exportés depuis `props.js`.

6. **Tests `index.test.jsx` colocalisés** : chaque brique a son test colocalisé. Vitest est en `isolate: true` (cf `CLAUDE.md`), ne pas changer. Si le test consomme des primitives `form/` qui s'auto-importent via le barrel, prévoir le workaround `vi.mock("lib/components", ...)` (cf `LoginComponent/index.test.jsx`).

7. **Stories sans JSX** : `index.stories.js` doit rester pur JS (le plugin Storybook le parse comme tel). Décorateurs JSX -> `decorators.jsx` séparé.

8. **Commentaires en anglais, texte français accentué** : tout commentaire de code en anglais ; toute string ou doc en français DOIT garder ses accents (é è ê à â ô î ï ç). S'applique aux `DEFAULT_LABELS` français si on en livre.

9. **Pas de modification sans approbation** : conformément au CLAUDE.md global, expliquer l'approche et attendre `OK` avant chaque transfert effectif.

## Synthèse pour agent

Si un agent dans smartcommon doit faire ce transfert :

1. Lire ce document EN ENTIER, surtout la section "Conventions smartcommon à respecter au transfert"
2. Lire `/home/cc/dev/smartpos/mobile/src/features/print/` et `usePrintService.js` pour comprendre le pattern registry de renderers
3. Pour CHAQUE brique : proposer le plan détaillé (fichiers créés, exports modifiés, tests écrits) puis attendre `OK` avant d'écrire
4. Copier le moteur print dans `src/lib/services/print/` + hook wrapper `src/lib/hooks/local/usePrintService/` (priorité haute)
5. Vérifier que les imports `from "src/features/print"` côté smartpos peuvent être remplacés par `from "@cap-rel/smartcommon"` une fois la nouvelle version publiée
6. Faire le même exercice pour `useBarcodeScanner` (`src/lib/hooks/local/`) et `NumericPad` (`src/lib/components/form/`)
7. Lancer `npm run test:run` + `npm run build` + `npm run lint` dans smartcommon après chaque transfert
8. Lancer `npm run build` dans smartpos après chaque transfert pour valider la consommation

Ne pas toucher à Customer Display, Kitchen notifications, Customer order notifications, useSyncService : leur scope smartpos est volontairement local.

## Implémentation effective (mai 2026)

Le transfert a été réalisé avec un ajustement par rapport au plan initial : l'emplacement cible du moteur Print est `src/lib/print/` (et non `src/lib/services/print/` + `src/lib/hooks/local/usePrintService/`). Le précédent `src/lib/sync/` regroupe déjà classes + hook + composants au même niveau ; le moteur Print suit la même convention pour rester cohérent. Cette décision est documentée dans `CLAUDE.md` (section "Architecture", note sous le diagramme).

### Arborescence finale dans smartcommon

```
src/lib/
  print/                                      # NOUVEAU (suit lib/sync/)
    ticketBuilder.js
    webUSBPrinter.js
    browserPrint.js
    printService.js
    usePrintService.jsx
    labels.js                                 # DEFAULT_LABELS (export PRINT_DEFAULT_LABELS)
    index.js
    printService.test.js
    usePrintService.test.jsx
  hooks/local/useBarcodeScanner/
    index.js
    index.test.jsx
  components/form/NumericPad/
    index.jsx
    props.js                                  # DEFAULT_LABELS + propTypes + defaultProps
    variants/{index.js, base.js}
    stories/{Default.jsx, index.js}
    .stories.js
    index.test.jsx
```

### Barrels mis à jour (dual export)

- `src/lib/index.js` : ajout de `export * from "./print"`
- `src/lib/export.js` : ajout de `export * from "./print"`
- `src/lib/hooks/local/index.js` ET `src/lib/hooks/local/export.js` : ajout de `export * from "./useBarcodeScanner"`
- `src/lib/components/form/index.js` ET `src/lib/components/form/export.js` : ajout de `export * from "./NumericPad"`

Vérification post-build : `grep` sur `dist/smartcommon.es.js` confirme la présence de `PrintService`, `TicketBuilder`, `WebUSBPrinter`, `usePrintService`, `useBarcodeScanner`, `NumericPad`.

### Écarts par rapport à la spec

1. **Emplacement Print** : `lib/print/` au lieu de `lib/services/print/` + `lib/hooks/local/usePrintService/`. Justification : alignement avec `lib/sync/` (précédent existant). Plus de copier-coller à faire lors d'un futur ajout de tier "service module".
2. **Icônes NumericPad** : `react-icons/fa6` est déjà une dep directe de smartcommon (utilisée par `lib/components/main/`), donc `FaDeleteLeft` et `FaCheck` sont conservés comme défaut. Ajout de props `backspaceIcon` et `confirmIcon` pour permettre l'override sans dépendance imposée au consumer.
3. **NumericPad - controlled-only** : pas d'intégration avec `useField` (pas un champ de formulaire validable). Reste un widget contrôlé par `value` / `onChange` comme dans smartpos. Cohérent avec son usage (saisie de quantité dans un panier, montant numérique, code PIN).
4. **i18n** : `labels` accepte indifféremment des strings ou des functions `(...) => string` selon que le message contient ou non des paramètres dynamiques. `DEFAULT_LABELS` exporté depuis chaque module (`PRINT_DEFAULT_LABELS` pour Print, `DEFAULT_LABELS` pour NumericPad via `props.js`).

### Couverture de tests

- `printService.test.js` : 14 tests (registration, queue sequencing, retry, network/browser/usb protocols, cleanup, labels override, pendingCount)
- `usePrintService.test.jsx` : 4 tests (registration on mount, unmount cleanup, reactive pendingCount, labels propagation)
- `useBarcodeScanner/index.test.jsx` : 7 tests (fast/slow input, buffer reset, INPUT ignored, min length, enabled flag, non-printable keys)
- `NumericPad/index.test.jsx` : 13 tests (input, decimal mode, backspace, confirm button, labels override, custom icons)

Suite complète post-transfert : **694 tests pass, 2 skipped, 46 fichiers, build OK, lint clean**.

### Reste à faire côté smartpos

Quand une nouvelle version `@cap-rel/smartcommon` (>= la v à publier après ce chantier) sera installée dans smartpos :

1. Remplacer dans `mobile/src/hooks/usePrintService.js` :
   - `import { PrintService } from "src/features/print"` -> `import { usePrintService } from "@cap-rel/smartcommon"`
   - Refactoriser le hook pour appeler `usePrintService({ templates: posPrintTemplates })` à la place de l'instanciation manuelle de `PrintService` + boucle `registerJobType` + `useEffect(cleanup)`. Les actions métier (`printSaleTicket`, `printKitchenOrder`, etc.) restent dans smartpos.
2. Remplacer `import { useBarcodeScanner } from "src/features/barcodeScanner"` par `from "@cap-rel/smartcommon"`.
3. Remplacer `import { NumericPad } from "src/features/numericPad"` par `from "@cap-rel/smartcommon"`. Le composant accepte exactement les mêmes props ; les nouveaux props (`labels`, `backspaceIcon`, `confirmIcon`) sont tous optionnels.
4. Supprimer les dossiers `mobile/src/features/print/`, `mobile/src/features/barcodeScanner/`, `mobile/src/features/numericPad/`.
5. Lancer `npm run build` dans smartpos pour valider (la cible reste 622 modules transformés, plus quelques modules importés depuis smartcommon).
