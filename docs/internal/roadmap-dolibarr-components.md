# Roadmap : composants Dolibarr haut niveau pour smartcommon

Liste des composants inspirés des écrans/tableaux Dolibarr (htdocs/*) qui
gagneraient à être implémentés proprement dans `@cap-rel/smartcommon`
pour être réutilisables par toutes les PWA Dolibarr.

Conventions :
- [ ] = à faire
- [x] = livré (avec lien vers le composant)
- (~) = partiellement couvert par un composant existant

Tous ces composants doivent suivre les patterns smartcommon :
- adapter pattern (pas de couplage direct à Dexie / API spécifique)
- props `labels` pour i18n (pas de `useTranslation` interne)
- styling slots `*Props` mergés via `twMerge`
- pas de hard-dépendance Dolibarr -> on passe les données via props

---

## 1. Sélecteurs d'objets Dolibarr

> **Vocabulaire** : on évite le mot `entity` dans les noms de composants
> et de props, parce que dans Dolibarr `entity` est le champ multicompany
> (id de l'instance courante). Ici on parle d'**objets** Dolibarr, au sens
> `CommonObject` (tiers, projet, produit, ...).

### 1.1 Brique racine

- [ ] **CommonObjectSelector** -- sélecteur générique alimenté par
      l'introspection `CommonObject->fields` Dolibarr (cf
      `htdocs/core/class/commonobject.class.php`). Configuré par un
      `descriptor` qui décrit l'objet ciblé :
      ```js
      {
        element,                  // "societe", "projet", "user", ...
        label,                    // libellé affiché ("Tiers")
        picto,                    // icône (mappable smartcommon)
        primaryKey: "rowid",
        labelField: "nom",        // ou fonction (obj) -> string
        searchableFields: [...],  // par défaut: champs avec searchall=1
        displayFields: [...],     // colonnes affichées dans la dropdown
        filters: { ... },         // filtres par défaut (entity, status...)
      }
      ```
      Adapter `{ search({ query, filters, limit }), getById(id),
      create?(payload) }`. Le descriptor peut être :
      - hardcodé côté wrapper,
      - dérivé d'un appel `/api/index.php/setup/<element>/fields`
        (introspection à la volée),
      - étendu par les extrafields (`searchableFields` les inclut si
        `searchall=1`).
      Sortie : `onChange(value, fullObject)`. Modes mono / multi.

### 1.2 Wrappers métier (fins, DRY)

Chaque wrapper se contente de pré-remplir le `descriptor` et d'exposer
en props typées les filtres métier spécifiques. Pas de logique
dupliquée : tout passe par `CommonObjectSelector`.

- [ ] **ThirdpartySelector** -- tiers (société). Props : `clientType`
      (client/prospect/fournisseur/all), `status`. Cf `/societe/list.php`
      + `core/ajax/company.php`.
- [ ] **ContactSelector** -- contact rattaché à un tiers. Props :
      `thirdpartyId`, `role`.
- [ ] **UserSelector** -- utilisateur Dolibarr. Props : `enabled`,
      `groupId`, `multicompanyId` (le champ Dolibarr `entity`, exposé
      sous un nom moins ambigu côté API smartcommon).
- [ ] **ProjectSelector** -- projet. Props : `status`
      (brouillon/ouvert/fermé), `thirdpartyId`, `userId` (responsable).
- [ ] **CategorySelector** -- catégorie multi-type (produit, tiers,
      contact, projet). Props : `categoryType`, `multiple`. Affichage
      arbre. Distinct de `ProductCategoryBrowser` (mode catalogue).
- [ ] **WarehouseSelector** -- entrepôt. Props : `withStockFor`
      (productId pour afficher le stock dispo).
- [ ] **PaymentTermsSelector** -- conditions de règlement
      (`c_payment_term`).
- [ ] **PaymentModeSelector** -- mode de règlement (`c_paiement`).
- [ ] **VatRateSelector** -- taux de TVA selon pays vendeur/acheteur
      (logique `getTauxTva`).
- [ ] **CurrencySelector** -- devise (`c_currencies`).
- [ ] **CountrySelector** -- pays (`c_country`) + drapeau optionnel.
- [ ] **StateSelector** -- région/département dépendant du pays.

## 2. Lignes de document (factures, propales, commandes)

Le coeur des modules de vente. Aujourd'hui chaque module réinvente
l'éditeur de lignes : c'est le plus gros gain potentiel.

- [ ] **ProductLineEditor** -- édition d'une ligne (description, qté,
      PU HT, remise %, TVA, total HT/TTC). Mode produit ou texte libre.
      Hooks : `onChange(line)`, `getProductPriceDisplay`.
- [ ] **DocumentLinesTable** -- tableau complet de lignes avec
      drag-reorder, ajout, suppression, sous-total par ligne. Compose
      `ProductLineEditor`. Variantes : facture / propale / commande /
      avoir. Mode lecture seule pour visualisation.
- [ ] **TotalsRecap** -- récapitulatif HT / TVA (par taux) / TTC + remise
      globale + acompte. Cf footer de `compta/facture/card.php`.
- [ ] **DiscountInput** -- saisie remise (% ou montant fixe) avec
      bascule. Réutilisé dans lignes + global.
- [ ] **PriceInput** -- saisie prix HT/TTC avec calcul automatique de
      l'autre selon taux TVA. Affiche les deux valeurs.

## 3. Statuts et badges Dolibarr

- [ ] **StatusBadge** -- badge coloré normalisé pour les statuts Dolibarr
      (brouillon, validé, payé, annulé, en cours, fermé, ...). Mapping
      `{ status, statusType, label }` -> couleur + icône. Couvre tous
      les `getLibStatut()` des classes Dolibarr.
- [ ] **StockBadge** -- badge stock dispo (vert/orange/rouge selon seuil
      `seuil_stock_alerte` / `desiredstock`).
- [ ] **PaymentStatusBadge** -- variante spécialisée pour statuts de
      paiement (impayé, partiel, payé, en retard).

## 4. Filtres et listes

Patterns omniprésents dans les pages `*/list.php` Dolibarr.

- [ ] **FilterBar** -- barre de filtres compactable (statut, plage de
      dates, recherche texte, tiers, utilisateur). Émet un objet
      filters, sauvegardable en localStorage.
- [ ] **DateRangePicker** -- sélection plage début/fin avec presets
      (aujourd'hui, semaine, mois, trimestre, année, mois précédent).
- [ ] **ListPagination** -- pagination compacte + sélecteur
      "lignes par page". DataTable existant en gère une partie (~).
- [ ] **ColumnSelector** -- choix des colonnes affichées + ordre
      (persisté). Cf `getDolUserString()` Dolibarr pour la persistance
      côté backend, ici on vise localStorage.
- [ ] **MassActionBar** -- barre flottante d'actions sur sélection
      multiple (supprimer, valider, exporter, ...). À évaluer pour
      mobile (UX souvent mieux servie par sélection longue).
- [ ] **ExportButton** -- export CSV/JSON/Excel d'une liste avec choix
      des colonnes. Module export Dolibarr en référence.

## 5. Documents et fichiers

- [ ] **DocumentList** -- liste des fichiers attachés à un objet
      (download, preview, suppression). Adapter `{ list, download,
      remove, upload }`. Cf `core/lib/files.lib.php` Dolibarr +
      `ECMFiles`.
- [ ] **PdfPreview** -- prévisualisation PDF (facture, propale, devis)
      en modal plein écran. Lazy-load PDF.js.
- [ ] **AttachmentUploader** -- variante de `FilesUploader` orientée
      objet Dolibarr (auto-tag avec `element` + `element_id`).
      `FilesUploader` existant à étendre plutôt que dupliquer.

## 6. Notes et événements

- [ ] **NoteEditor** -- édition note publique / privée avec onglets
      (pattern Dolibarr `note_public` / `note_private`). Réutilise
      `Editor` existant pour le contenu.
- [ ] **EventTimeline** -- timeline des événements agenda liés à un
      objet (`actioncomm`). Filtres par type, utilisateur, date.
      Cf `comm/action/list.php`.
- [ ] **ActionCommQuickCreate** -- création rapide d'événement agenda
      (type, date, durée, participants). Cf `comm/action/card.php`.

## 7. Adresse, géolocalisation, contacts

- [ ] **AddressForm** -- formulaire adresse complet (rue, complément,
      ZIP, ville, état, pays) avec autocomplétion BAN/Google Places
      optionnelle. Distinct du formatter `formats/Address`.
- [ ] **GeoLocationPicker** -- sélection lat/lng sur carte (Leaflet
      lazy-load) avec saisie manuelle fallback.
- [ ] **PhoneInput** -- saisie téléphone international (préfixe pays
      + format E.164). Click-to-call optionnel.
- [ ] **OpeningHoursEditor** -- édition horaires d'ouverture
      (jour/plages). Pattern point de vente / établissement.

## 8. Champs extras et formulaires Dolibarr

- [ ] **ExtrafieldsForm** -- rendu dynamique des champs extra Dolibarr
      (`extrafields` API). Types : varchar, int, double, date, boolean,
      select, sellist, checkbox, password, link, ... Adapter
      `{ getDefinitions(element), getValues(element, id), save }`.
- [ ] **ExtrafieldsDisplay** -- affichage lecture seule des extrafields.
- [ ] **PriceLevelSelector** -- sélection niveau de prix multi-prix
      (`MAIN_FEATURES_LEVEL` / `PRODUIT_MULTIPRICES`).

## 9. Saisies métier

- [ ] **TimeTrackingInput** -- saisie durée HH:MM ou décimal
      (`convertSecondToTime` Dolibarr). Pour pointage temps projet.
- [ ] **SignaturePad** -- signature manuscrite (canvas) avec export
      base64 / blob. Réutilisable bon de livraison, accusé réception.
- [ ] **NumericPad** -- clavier numérique virtuel (entier / décimal /
      pourcentage) avec min/max. Identifié dans offlinepropale.

## 10. Vues détaillées

- [ ] **TabbedObjectView** -- conteneur "carte d'objet" Dolibarr avec
      onglets (Card, Notes, Documents, Contacts, Linked elements,
      Events). Pattern `core/lib/*.lib.php` -> `XXXAdminPrepareHead`.
- [ ] **LinkedObjectsList** -- liste des objets liés (`element_element`).
      Affichage par type avec lien vers l'objet.
- [ ] **ObjectHeader** -- en-tête standard d'objet (ref, statut, dates
      clés, actions principales). Pattern haut de toutes les fiches
      Dolibarr.

## 11. Tableaux de bord

- [ ] **StatBoxGrid** -- grille de tuiles statistiques (compteur, delta,
      sparkline). Pattern dashboards modules Dolibarr.
- [ ] **AgendaWidget** -- widget mini-agenda (prochains rendez-vous /
      tâches). À évaluer face à l'existant Calendar.
- [ ] **RecentActivityList** -- liste compacte derniers documents créés
      / modifiés.

## 12. Offline-first (transverse)

Patterns identifiés dans `offlinepropale`, candidats si plusieurs
modules adoptent l'approche.

- [ ] **ConnectionStatusBar** -- barre d'état online/offline/sync
      pending. Adapter `{ isOnline, pendingCount, lastSyncAt, sync }`.
- [ ] **FirstSyncModal** -- modal de synchro initiale avec progression
      par entité. Adapter `{ entities: [{ name, count, progress }] }`.
- [ ] **SyncConflictResolver** -- résolution interactive des conflits
      (local vs serveur) lors de la synchro.

---

## Priorisation suggérée

**Vague 1 (impact maximal, faible couplage)**
1. StatusBadge (utilisé partout, faible effort)
2. **CommonObjectSelector** (brique racine, débloque tous les wrappers
   `*Selector` ci-dessous)
3. ThirdpartySelector + UserSelector (premiers wrappers à livrer pour
   valider le contrat du descriptor)
4. DateRangePicker (filtre récurrent dans toutes les listes)
5. NumericPad (déjà identifié dans offlinepropale)

**Vague 2 (gros morceaux)**
6. ProductLineEditor + DocumentLinesTable + TotalsRecap (le bloc
   "édition de document commercial")
7. ExtrafieldsForm / ExtrafieldsDisplay (débloque les champs custom
   Dolibarr partout)
8. DocumentList + AttachmentUploader (gestion fichiers liés)

**Vague 3 (spécialisés)**
9. SignaturePad (livraison, accusés)
10. TimeTrackingInput (modules projet)
11. EventTimeline + ActionCommQuickCreate (CRM)
12. TabbedObjectView (refonte des fiches d'objet)

---

## Notes de mise en oeuvre

- Avant chaque implémentation : vérifier qu'aucun composant smartcommon
  existant ne couvre déjà le besoin (cf section "Composants présents"
  dans `CLAUDE.md`).
- Toujours ajouter le composant dans **les deux barrel files**
  (`index.js` ET `export.js`) sous peine d'être absent du build npm.
- Stories Storybook obligatoires pour chaque composant (au minimum
  default + variantes principales + état d'erreur).
- Tests Vitest sur la logique non triviale (validation, cycles d'état).
- Documenter dans `docs/<composant>.md` au même format que
  `product-category-browser.md` et `photo-annotator.md`.
