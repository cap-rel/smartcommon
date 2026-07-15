# Audit smartcommon dans un module consommateur

Prompts prêts à copier-coller dans Claude Code (lancé à la racine du
module à auditer : dsd, capCRM, capTodo, offlinepropale, scanpdf,
onepagebasket, ...).

But : identifier les composants custom du module qui pourraient être
remplacés par leur équivalent `@cap-rel/smartcommon`, sans rien
modifier (rapport seulement).

---

## 1. Audit complet (recommandé en premier passage)

```
Lis dans l'ordre :
1. ~/dev/smartcommon/CLAUDE.md (composants livrés, conventions)
2. ~/dev/smartcommon/CHANGELOG.md (ajouts récents)
3. ~/dev/smartcommon/docs/internal/roadmap-dolibarr-components.md (ce qui est
   prévu mais pas encore livré, pour ne pas le proposer comme
   remplacement immédiat)

Puis audite le projet courant :
- Vérifie d'abord la version de @cap-rel/smartcommon utilisée
  (package.json) pour savoir ce qui est déjà disponible côté consommateur
  vs ce qui nécessitera un bump.
- Parcours mobile/src/components/ (et tout dossier components/ React du
  projet) à la recherche de composants custom dont la fonction recoupe
  un composant smartcommon livré ([x] dans la roadmap, ou listé dans
  CLAUDE.md / CHANGELOG.md).
- Pour chaque candidat de remplacement, produis une ligne :
    - chemin local (file:line)
    - composant smartcommon cible
    - effort estimé (trivial / moyen / lourd)
    - différences d'API à arbitrer (props manquantes côté smartcommon,
      logique métier locale à conserver, etc.)
    - bump de version smartcommon requis si applicable

Ne modifie aucun fichier. Sortie : un rapport markdown en moins de
500 mots, trié par "rapport gain/effort" décroissant.
```

## 2. Audit ciblé sur un composant précis

Quand on sait déjà qu'un composant smartcommon devrait remplacer une
implémentation maison (ex : un nouveau `LoginComponent` est dispo) :

```
Le composant `<LoginComponent>` de @cap-rel/smartcommon
(cf ~/dev/smartcommon/CLAUDE.md section "Authentication & Onboarding"
+ src/lib/components/others/LoginComponent/) doit remplacer le code
de login custom de ce projet.

Trouve dans le projet courant :
- la / les pages qui implémentent le login actuellement
- les hooks / utils associés (auth, QR pairing, device, ...)
- les routes et layouts qui en dépendent

Produis un plan de migration en moins de 300 mots :
1. Fichiers à supprimer
2. Fichiers à modifier (avec diff conceptuel : avant -> après)
3. Props smartcommon à brancher (labels, callbacks, getErrorLabel, ...)
4. Risques et points d'attention (i18n, styling local à préserver, ...)

Ne modifie aucun fichier.
```

## 3. Audit "quoi de neuf depuis ma version"

Quand le module est sur une version smartcommon ancienne et qu'on veut
savoir ce qui s'est ajouté depuis :

```
La version de @cap-rel/smartcommon utilisée par ce projet est
<lis la dans package.json>.

Lis ~/dev/smartcommon/CHANGELOG.md et liste, en moins de 200 mots, les
ajouts (Added) et changements (Changed/Breaking) postérieurs à cette
version qui pourraient bénéficier au projet courant. Pour chacun :
- une phrase d'usage typique
- si un composant local du projet pourrait être remplacé (sans
  parcourir le code en détail, juste à partir des noms de dossiers
  components/)
```

---

## Workflow recommandé

1. Lancer **prompt #1** dans le module consommateur -> rapport complet.
2. Choisir 1 candidat par session (le plus rentable) et lancer
   **prompt #2** ciblé sur ce composant -> plan de migration.
3. Demander à Claude d'exécuter le plan **après validation explicite**
   (workflow standard "OK avant de coder").
4. Mettre à jour le `CHANGELOG.md` du module consommateur en notant le
   remplacement (utile pour traçabilité).

## Notes

- Ces prompts supposent que `~/dev/smartcommon` est cloné localement et
  à jour (`git pull` si besoin avant audit).
- Si Claude Code n'a pas le droit de lire `~/dev/smartcommon` depuis le
  projet consommateur, ajouter ce répertoire dans
  `.claude/settings.json` -> `additionalDirectories`.
- Pour automatiser à grande échelle (10+ modules), envisager un skill
  Claude Code `/audit-smartcommon` qui encapsule le prompt #1.
