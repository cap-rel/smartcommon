# AboutModal

`<AboutModal>` est la modale "À propos" standard des PWA cap-rel :
affiche le nom de l'application, la version, des champs additionnels
configurables, et un bouton "Vérifier les mises à jour" qui parle au
service worker.

Cas d'usage : page paramètres / menu utilisateur / pied de page d'app.

## Import

```jsx
import { AboutModal } from "@cap-rel/smartcommon";
```

## Exemple

```jsx
import { useState } from "react";
import { AboutModal } from "@cap-rel/smartcommon";
import packageJson from "../../package.json";

export const SettingsPage = () => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button onClick={() => setOpen(true)}>À propos</button>
            <AboutModal
                open={open}
                onClose={() => setOpen(false)}
                appName="smartIntervention"
                version={packageJson.version}
                fields={[
                    { label: "Serveur", value: "https://api.example.com" },
                    { label: "Utilisateur", value: user.email },
                    { label: "Appareil", value: deviceLabel },
                ]}
            />
        </>
    );
};
```

## Comportement

- **Bouton "Vérifier les mises à jour"** : appelle
  `usePWAUpdate().checkForUpdates()` en interne.
  - PWA non installée ou navigateur sans SW : bouton désactivé,
    `labels.updatesNotSupported` affiché.
  - Pas de mise à jour : `labels.upToDate`.
  - Mise à jour disponible : le bouton bascule sur "Installer la mise à
    jour" qui appelle `applyUpdate()` puis recharge la page.
  - Erreur : `labels.checkError`.
- **Champs additionnels (`fields`)** : tableau de `{ label, value }`. La
  `value` peut être un node React (`<>`, `<a>`, badge, etc.).
- **Pas de logique métier** : pas d'appel API, pas de redirection,
  tout passe via les props.

## i18n

Comme les autres composants page-replacing : `labels` (merge partiel
avec `DEFAULT_LABELS` exporté), pas de `useTranslation()` interne.

## Props

| Prop | Type | Défaut | Notes |
|------|------|--------|-------|
| `open` | bool | requis | contrôle l'affichage |
| `onClose` | func | - | appelée par la croix / overlay |
| `appName` | string | requis | nom affiché en haut |
| `version` | string | - | numéro de version |
| `fields` | `[{ label, value }]` | `[]` | champs additionnels (value peut être un node) |
| `labels` | object | `DEFAULT_LABELS` | merge partiel |

## Référence interne

- `usePWAUpdate` (hook smartcommon) : `checkForUpdates`, `applyUpdate`,
  flags `updateAvailable` / `updateActivated`.
- `<Modal>` : composant de base utilisé pour le shell de la modale.

## Voir aussi

- Section PWA Updates du `CLAUDE.md` du repo.
- [offline.md](offline.md) : autres hooks PWA disponibles.
