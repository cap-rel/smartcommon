# Gps

`<Gps>` est un champ qui **capture la position GPS du device** via
`navigator.geolocation`. Un bouton "Localiser" déclenche la
géolocalisation native, la valeur retournée est un couple
`[latitude, longitude]` stocké dans le state du formulaire.

Cas d'usage : pointer la position du technicien à l'arrivée sur un
chantier, géolocaliser une photo, marquer un incident, etc.

## Import

```jsx
import { Gps } from "@cap-rel/smartcommon";
```

## Exemple

```jsx
import { useState } from "react";
import { Gps } from "@cap-rel/smartcommon";

const Demo = () => {
    const [coords, setCoords] = useState(null);
    return (
        <Gps
            label="Position"
            value={coords}
            onChange={setCoords}
        />
    );
};
```

Dans un `<Form>` :

```jsx
<Gps name="location" label="Position" required />
// form.values.location -> [latitude, longitude] (ou tableau de couples si multiple)
```

## Forme de la valeur

- **Single** (défaut) : `[latitude, longitude]` (deux nombres en degrés
  décimaux), ou `null`.
- **Multiple** (`multiple={true}`) : `[[lat, lng], [lat, lng], ...]`.
  L'utilisateur peut ajouter plusieurs points.

## Comportement

- **Bouton "Localiser"** : déclenche `navigator.geolocation.getCurrentPosition`
  via l'utilitaire `lib/utils/locate`. Pendant la requête, le bouton
  affiche un spinner.
- **Permissions** : si la permission est refusée, un toast d'erreur
  est affiché ("Echec de géolocatisation"). Pas d'écran custom.
- **HTTPS requis** : `navigator.geolocation` n'est disponible que sur
  origine sécurisée (HTTPS ou localhost). En dev plain HTTP, ça ne
  fonctionnera pas.
- **`onLocate(coords)`** : callback optionnel appelé en plus du
  `onChange`, utile pour des side effects (logging, trigger d'un
  appel API associé).
- **Mode `multiple`** : un bouton "+" ajoute un point, chaque point a
  son bouton "supprimer".

## Validation

Règle `required` intégrée :

```js
errors = (currentValue) => ({
    required: {
        condition: required && isEmpty(currentValue),
        message: "Vous devez géolocaliser."
    }
});
```

Message en dur (pas extrait en `labels`).

## Limites connues

- **Pas de bouton "Choisir sur une carte"** : le code mentionne
  `// IDEA Add location via map` mais ce n'est pas implémenté. Le seul
  moyen de capturer une position est la géolocalisation native.
- **Mode `multiple`** partiellement implémenté (commentaire
  `// TODO Find a solution for multigps` dans le code). Vérifier le
  comportement avant usage production.
- **Bouton "Localiser"** noté `// TODO Finish the location button` —
  des polish UX restent à faire (états visuels, accessibilité).
- **Pas de `accuracy` / `timestamp`** dans la valeur stockée :
  seulement `[lat, lng]`. Si tu veux ces métadonnées, utiliser
  `onLocate` qui reçoit l'objet complet `coords`.
- **Pas de timeout configurable** sur la géolocalisation : si le device
  met longtemps à répondre, le user attend.
- **HTTPS obligatoire** pour `getCurrentPosition` (limitation
  browser).

## Slots de styling

22 slots dont `containerProps`, `inputContainerProps`,
`latitudeProps`, `longitudeProps`, `locationButtonProps`,
`mapButtonProps` (préfiguration UI map qui n'est pas câblée),
`multipleGpsContainerProps`, `gpsPointsContainerProps`, etc. Liste
complète dans
[src/lib/components/form/Gps/props.js](../src/lib/components/form/Gps/props.js).

## Voir aussi

- `<AddressInput>` : autocomplete adresse (Nominatim) — donne aussi
  lat/lng dans la valeur.
- `formats/Coordinates` : formateur d'affichage de coordonnées GPS en
  lecture seule.
- `<PhotosUploader>` mode capture : peut attacher `gpsPoints` à chaque
  photo automatiquement.
