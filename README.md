# ⛺ Wildspot

Logg steder du har vært, med bilder og beskrivelse, og bygg opp et lager av mulige teltplasser
på et 3D-kart.

## Kom i gang

```bash
npm install
npm run dev
```

- Klient (Vite + React): http://localhost:5173
- API (Express): http://localhost:3000 – Vite videresender `/api` hit.

Produksjon: `npm run build && npm start`. Express serverer da både API-et og `dist/`.

Krever Node 22.13 eller nyere (bruker innebygd `node:sqlite`).

## Kodekvalitet

[Biome](https://biomejs.dev) brukes til både linting og formatering (`biome.json`).

```bash
npm run lint     # sjekker alt
npm run format   # retter formatering, importrekkefølge og trygge lint-feil
```

Installer Biome-utvidelsen i editoren din, så formateres filene når du lagrer.

## Struktur

```
server/
  index.js            Express-oppsett
  db.js               SQLite-skjema
  sessions.js         Innlogging med sesjons-cookie
  uploads.js          Bildeopplasting (multer)
  errors.js           HttpError og felles feilhåndtering
  routes/             auth, places, photos

client/src/
  App.jsx             Viser innlogging eller kartet
  api.js              Alle kall til serveren
  pages/              LoginPage, MapPage
  components/         Sidebar, PlaceDialog, PlaceDetails, BasemapGallery, …
  hooks/              usePlaces, useLocalStorage, useToast
  map/                MapLibre: oppsett, stil, markører, popup og kartkatalog
  places/             Typer steder og formatering
client/public/thumbs/ Forhåndsbilder av bakgrunnskartene
data/                 Database og opplastede bilder (ikke i git)
```

## API

| Metode | Sti | |
|---|---|---|
| POST | `/api/auth/register` | `{ username, email, password }` |
| POST | `/api/auth/login` | `{ email, password }` |
| POST | `/api/auth/logout` | |
| GET | `/api/auth/me` | |
| GET | `/api/places` | Egne steder med bilder |
| POST | `/api/places` | Skjemadata: `kind`, `title`, `description`, `lat`, `lng`, `elevation`, `rating`, `visited_on`, `photos` |
| PUT | `/api/places/:id` | Samme felter som POST. Nye `photos` legges til. |
| DELETE | `/api/places/:id` | |
| GET/DELETE | `/api/photos/:id` | |

`kind` er `visited` (besøkt sted) eller `tent_spot` (mulig teltplass).

## Kart

- **Terreng:** [Mapterhorn](https://mapterhorn.com). I Norge bygger det på Kartverkets DTM 1 m.
- **Bakgrunnskart og overlegg:** 94 kart som ikke krever API-nøkkel, i `client/src/map/mapLayers.json`,
  hentet fra [TacTrace](https://tactrace.orbat-mapper.app). Sjekk vilkårene til hver leverandør
  før appen tas i bruk offentlig.
- **Nytt kart:** legg til en oppføring i `mapLayers.json` og et bilde i `client/public/thumbs/<id>.jpg`.

## Mobil

GPS i nettleseren krever HTTPS. Start `npm run dev`, og deretter i en egen terminal:

```bash
npm run tunnel
```

Skriptet skriver ut en midlertidig HTTPS-adresse og en QR-kode du kan skanne med mobilen.
Adressen er offentlig og endres hver gang tunnelen startes på nytt.
