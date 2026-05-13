# AddressInput

`<AddressInput>` est un champ de saisie d'adresse avec **autocomplete**
via l'API publique Nominatim (OpenStreetMap). L'utilisateur tape, des
suggestions apparaissent (debounce), il choisit dans la liste, et la
valeur est stockée sous forme d'objet structuré.

Cas d'usage : adresse de tiers, lieu d'intervention, adresse de
livraison, etc. — partout où on veut éviter la saisie libre
inconsistante.

## Import

```jsx
import { AddressInput } from "@cap-rel/smartcommon";
```

## Exemple

```jsx
import { useState } from "react";
import { AddressInput } from "@cap-rel/smartcommon";

const Demo = () => {
    const [address, setAddress] = useState(null);
    return (
        <AddressInput
            label="Adresse"
            value={address}
            onChange={setAddress}
        />
    );
};
```

Dans un `<Form>` :

```jsx
<AddressInput name="address" label="Adresse" required />
// form.values.address -> objet structuré (cf section suivante)
```

## Forme de la valeur

La valeur sélectionnée est typiquement un objet Nominatim restructuré
(rue, code postal, ville, pays, lat, lng). Le format exact dépend de
la version courante du service Nominatim et n'est pas figé dans la
lib. Vérifier l'objet effectivement reçu via `console.log` pour adapter
ton modèle de données — souvent quelque chose comme :

```js
{
    display_name: "1 Rue X, 75000 Paris, France",
    address: {
        road: "Rue X",
        postcode: "75000",
        city: "Paris",
        country: "France",
        ...
    },
    lat: "48.8566",
    lon: "2.3522",
}
```

> **Important** : la lib n'impose pas de schéma stable côté valeur.
> Pour un projet qui doit persister l'adresse, le caller doit
> normaliser dans `onChange` avant de stocker (extraire les champs qui
> l'intéressent).

## Comportement

- **Debounce** sur la frappe (le composant fait l'appel à Nominatim
  après un délai d'inactivité).
- **AbortController** : à chaque nouvelle frappe, la requête en cours
  est annulée (pas de race condition entre suggestions obsolètes et
  nouvelles).
- **Liste de suggestions** affichée sous l'input. Click sur une
  suggestion → `onChange(item)` + ferme la liste.
- **Pas de validation native** (`errors: () => ({})`).

## Limites de Nominatim

- **Rate limit** : Nominatim public a une politique stricte
  (1 requête/seconde par IP, et User-Agent identifiable obligatoire).
  Le composant fait des requêtes directes depuis le browser sans
  proxy : sur une PWA qui sera utilisée par beaucoup d'utilisateurs
  simultanément, considérer un proxy interne (smartAuth ou autre) qui
  cache + agrège les requêtes.
- **Pas de garantie de stabilité du schéma** Nominatim : si OSM
  change le format de réponse, ton code de normalisation casse.
- **Pas de gestion offline** : sans réseau, pas de suggestion.

## Slots de styling

`containerProps`, `labelContainerProps`, `labelProps`, `helpProps`,
`inputContainerProps`, `inputProps`, `inputSpinnerProps`,
`inputIconProps`, `listProps`, `listItemProps`. `twMerge` appliqué en
interne.

## Props

| Prop | Type | Défaut | Notes |
|------|------|--------|-------|
| `name` | string | - | pour `<Form>` |
| `value` | object | - | controlled |
| `defaultValue` | object | - | uncontrolled |
| `onChange` | func | - | `(addressObject) => void` |
| `label` | string | - | label |
| `labelRow` | bool | `false` | label sur la même ligne |
| `help` | string | - | aide |
| `onValueChange` | func | - | alias de `onChange` (compat) |

Plus les props standards de `<Input>` (`required`, `disabled`,
`readOnly`, etc.).

## Limites connues

- **Schéma de valeur non garanti** (cf section "Forme de la valeur").
- **Pas de proxy intégré** vers Nominatim.
- **Pas de mode "offline cache"** : pas de stockage local des
  adresses fréquentes.
- **Pas de validation `errors` native** (la prop `required` n'est pas
  branchée sur une règle de validation interne).

## Voir aussi

- `<Gps>` : pour capturer une coordonnée GPS via le device.
- `<Map>` : composant cible "carte" — actuellement non fonctionnel
  (cf signal dans son MDX).
- `formats/Address` : formateur d'affichage d'adresse en lecture seule.
