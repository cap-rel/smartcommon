# Formatters

Smartcommon livre 16 composants de **mise en forme** (`formats/*`) qui
prennent un `value` brut (string, number, Date, objet) et le rendent
en HTML formaté + souvent un lien actionnable (cliquer sur un Email
ouvre le mailer, sur une Address ouvre l'app de cartographie, etc.).

Tous suivent la même convention :

```jsx
<Email value="alice@example.com" />
<Number value={1234567.89} style="currency" currency="EUR" />
<Datetime value={new Date()} options={{ dateStyle: "long", timeStyle: "short" }} />
```

Pas de form-awareness (`useField`) : ce sont des **affichages en lecture
seule**, à mounter dans des cards / cellules de DataTable / fiches
détail.

## Import

```jsx
import {
    Address, Color, Coordinates, Datetime, Duration,
    Email, Files, Icon, Number, PhoneNumber,
    Signature, String, Tags, Text, Url,
} from "@cap-rel/smartcommon";
```

> Note : `Number` et `String` overrident les globaux JavaScript. Si
> tu utilises beaucoup `Number(x)` / `String(x)` dans le même fichier,
> préférer renommer à l'import :
> ```js
> import { Number as NumberDisplay, String as StringDisplay } from "@cap-rel/smartcommon";
> ```

## Catalogue rapide

### Actionnables (link + icône)

Ces formatters produisent un `<a>` cliquable avec une icône à gauche.
Sur mobile, le link déclenche l'app native correspondante.

| Composant | Schéma URL | Icône | Usage |
|-----------|-----------|-------|-------|
| `<Email>` | `mailto:` | enveloppe | envoyer un mail |
| `<PhoneNumber>` | `tel:` | téléphone | appeler |
| `<Url>` | brut | (selon) | ouvrir un lien |
| `<Address>` | `geo:0,0?q=<address>` | pin | ouvrir une adresse dans Maps |
| `<Coordinates>` | `geo:<lat>,<lng>` | pin | ouvrir des coordonnées GPS |

### Mise en forme typée

| Composant | Input | Sortie typique |
|-----------|-------|---------------|
| `<Number>` | number ou string numérique | `Intl.NumberFormat` (decimal / currency / percent / unit) |
| `<Datetime>` | number (timestamp ms), string ISO, Date | `Intl.DateTimeFormat` |
| `<Duration>` | secondes ou objet `{years, months, ..., milliseconds}` | `Intl.DurationFormat` (style `long` / `short` / `narrow` / `digital`) |
| `<Files>` | File ou `{ name, size, type, url }` (ou tableau) | liste avec icônes + lien download |
| `<Icon>` | element React ou elementType | rend l'icône + label optionnel + couleur/taille |
| `<Signature>` | string base64 (PNG) ou objet `{ signature, signer, coordinates, signedAt }` | rendu image + nom signataire |
| `<Color>` | string hex / rgb / etc. | pastille colorée |
| `<String>` | string | wrapper texte |
| `<Text>` | string longue | wrapper texte long (truncate / break) |
| `<Tags>` | string CSV ou tableau | rangée de pastilles |

## Exemples

### Number

```jsx
<Number value={1234567.89} style="currency" currency="EUR" />
// "1 234 567,89 €"

<Number value={0.156} style="percent" maximumFractionDigits={1} />
// "15,6 %"

<Number value={1024} style="unit" options={{ unit: "kilobyte" }} />
// "1 024 ko"
```

### Datetime

```jsx
<Datetime value={1700000000000} options={{ dateStyle: "long", timeStyle: "short" }} />
// "16 novembre 2023 à 22:13"

<Datetime value="2026-05-12T10:30:00Z" locale="en-US" />
// "5/12/2026"
```

### Duration

```jsx
<Duration value={3661} />
// "1 hour, 1 minute, 1 second"

<Duration value={3661} style="digital" />
// "01:01:01"

<Duration value={{ days: 2, hours: 3 }} style="narrow" />
// "2j 3h"
```

### Email / PhoneNumber / Url

```jsx
<Email value="alice@example.com" />
// <a href="mailto:alice@example.com">📧 alice@example.com</a>

<PhoneNumber value="+33612345678" />
// <a href="tel:+33612345678">📞 +33612345678</a>

<Url value="https://cap-rel.fr" />
// <a href="https://cap-rel.fr" target="_blank">🔗 cap-rel.fr</a>
```

### Address / Coordinates

```jsx
<Address value="10 rue de la Paix, 75002 Paris" />
// <a href="geo:0,0?q=10+rue+de+la+Paix,+75002+Paris">📍 ...</a>

<Coordinates value={[2.3522, 48.8566]} />
// <a href="geo:2.3522,48.8566">📍 2.3522, 48.8566</a>
// Note: ordre des éléments [longitude, latitude] (cf section "Pièges connus")
```

### Files

```jsx
<Files value={[
    { name: "Contrat.pdf", size: 245678, type: "application/pdf", url: "/contract.pdf" },
    { name: "Photo.jpg",   size: 1024000, type: "image/jpeg",     url: "/photo.jpg" },
]} />
// liste avec icône MIME + nom + taille humanisée + lien download
```

### Tags

```jsx
<Tags value="urgent, prioritaire, vip" />
// 3 pastilles
<Tags value={["urgent", "prioritaire"]} />
// idem (accepte array OU CSV)
```

## Convention de "valeur vide"

Tous les formatters retournent `null` (ou un fallback minimal) quand
`value` est `null`, `undefined`, ou chaîne vide. Pas de crash si on
passe une valeur absente. Pratique pour les listes dynamiques :

```jsx
<Number value={row.amount} style="currency" currency="EUR" />
// si row.amount est null -> rien d'affiché, pas d'exception
```

## Slots de styling

Chaque formatter expose au minimum :

- `linkProps` (pour les actionnables) ou `containerProps` (pour les
  affichage purs)
- `iconProps` (icône à gauche)
- `valueProps` (texte de la valeur formatée)

Liste exacte selon le composant. `twMerge` appliqué en interne.

## i18n / locale

Les formatters basés sur `Intl.*` (`<Number>`, `<Datetime>`,
`<Duration>`) acceptent une prop `locale` (string ou array de strings,
comme l'argument premier d'`Intl.NumberFormat`). Défaut : `"default"`
(= locale navigateur).

Les formatters actionnables (Email, Phone, Url, Address, Coordinates)
n'ont pas de locale spécifique — c'est juste un wrapper sémantique
+ un schéma URL.

## Pièges connus

- **`<Coordinates>` attend `[longitude, latitude]`** (ordre GeoJSON),
  pas `[latitude, longitude]` (ordre humain). Vérifier le code source
  ou loguer la valeur si tu as un doute.
- **`<Number>` et `<String>`** masquent les globaux JS dans le scope
  du fichier — renommer à l'import si conflit.
- **`<Duration>` style `"digital"`** : la sortie dépend du support
  `Intl.DurationFormat` du browser (Chrome 129+, Safari 18+, Firefox
  ≥ 134). Sur browsers anciens, fallback browser dépendant.
- **`<Datetime>` value `string`** : doit être un ISO 8601
  (`"2026-05-12T10:30:00Z"`) ou parseable par `new Date(value)`.
  Format custom non-standard -> NaN -> sortie vide.
- **Pas de `formatRelative`** (« il y a 3 jours », « dans 2 heures ») :
  pour les dates relatives, mixer `Intl.RelativeTimeFormat` côté
  caller. La lib pourrait l'ajouter dans une future version.

## Limites globales

- Pas de **wrapper "edit mode"** : ce sont des affichages purs. Pour
  un champ saisissable correspondant, utiliser les composants `form/*`
  (`<Input>`, `<Calendar>`, `<Timer>`, etc.).
- Pas de **theming centralisé** : chaque formatter porte ses classes
  Tailwind en dur (consistantes mais pas auto-thématisées).
- Pas de **passage automatique entre formatter ↔ champ** dans un
  même rendu (mode lecture ↔ édition). Pattern à implémenter côté
  caller via `isReadOnly ? <Datetime value={x} /> : <Calendar value={x} onChange={...} />`.

## Voir aussi

- `<DataTable>` : `column.render` accepte du JSX, parfait pour
  injecter un formatter dans une cellule.
- Composants `form/*` : versions saisissables des mêmes données.
