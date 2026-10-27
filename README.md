# Skolesekken 3.0.1 – Morgenklar 🎒

Komplett Netlify-app for **3. klasse (rød gruppe)** og **7. klasse** ved Fagerholt skole.

Dette er **produksjonsprosjektet**, ikke den tidligere statiske designprototypen. Frontend er bygget om til 3.0-designet, mens eksisterende Netlify Functions for ukeplan og vær er videreført. Ingen uke 44-eksempeldata vises som gjeldende ukeplan.

## Hva er nytt i 3.0?

- **Begge barna** som startside: to kort med dagens program, hva som skal pakkes og eventuelt kjøreansvar.
- **3. klasse:** barnets pakkeliste først på mobil, eget dagsprogram og fortsatt filtrering til rød gruppe.
- **7. klasse:** skoleaktiviteter og fritidsaktiviteter integrert i samme dagskort. Hip-hop **mandag og torsdag**; tennis **onsdag**.
- **Kjøreplan for 2026:** Nora uke 37, 42, 46; Julie 38, 43, 47; Smilla 39, 44, 48; Maya 41, 45, 49. Tennis: Maya partallsuker og Julie oddetallsuker. Ingen gjetting for manglende kjøreuker.
- **Vær** for valgt skoledag, fra MET/Yr for koordinatene i Pent-lenken. Ingen fiktive prognoser.
- **Lekser i fagfaner** (norsk og engelsk er skilt), **Ukas superkraft**, minioppdrag og beskjeder i sammenleggbart felt.
- **Oppdatering:** nettsiden laster seg på nytt hver 60. minutt, ved datoovergang og når fanen vekkes etter lang dvale. Tidligere dager i uken er deaktivert.
- **Avkrysninger:** eksisterende `skolesekken.pack.v6...`-nøkler gjenbrukes, slik at pakkestatus fra 2.5 bevares på samme enhet.

## Publiser på GitHub og Netlify

1. **Pakk ut ZIP-filen** først. Ikke legg selve ZIP-filen i GitHub som en fil.
2. Åpne https://github.com/morronetlab/skolesekken og legg inn filene i **roten av repositoryet**, med denne mappestrukturen:

   ```text
   .gitignore
   netlify.toml
   package.json
   README.md
   public/
     network.mjs
     index.html
     style.css
     app.js
     calendar.mjs
     after-school.mjs
     theme.mjs
   netlify/functions/
     plan.mjs
     weather.mjs
   lib/
     plan-core.mjs
     weather-core.mjs
     after-school.mjs
   tests/
     ...
   ```

3. GitHub-grensesnittet egner seg ikke alltid til å erstatte eksisterende undermapper. Tryggest er å pakke ut ZIP-en i en lokal kopi av repositoryet og gjøre `git add -A`, `git commit` og `git push`. Alternativt bruk Codex med tilgang til repositoryet.
4. Kontroller at Netlify-prosjektet bruker repositoryet som kilde, og at det ikke finnes egne UI-innstillinger som overstyrer `netlify.toml`.
5. Når Netlify viser **Published**, åpne https://lucent-marigold-876014.netlify.app/ og sjekk både familievisning, 3. klasse og 7. klasse.

Netlify-konfigurasjonen i prosjektet:

- **Build command:** `npm test`
- **Publish directory:** `public`
- **Functions directory:** `netlify/functions`
- **API-endepunkter:** `/api/plan?grade=3`, `/api/plan?grade=7`, `/api/weather`
- **Node:** 20+

**Viktig:** Dra-og-slipp av kun `public/` i Netlify Drop publiserer bare HTML/CSS/JS. Da fungerer **ikke** automatisk PDF- eller værinnhenting, fordi Netlify Functions mangler. Prosjektet må bygges fra repositoryet.

## Test lokalt

```bash
npm install
npm test
npx netlify dev
```

Den siste kommandoen krever Netlify CLI (installeres ved `npx` ved behov). Bruk den for å teste hele appen. Åpning av `public/index.html` alene gir ikke tilgang til `/api/plan` eller `/api/weather`.

## Slik fungerer innhentingen

- `netlify/functions/plan.mjs` henter hver trinnside og velger PDF med riktig ISO-ukenummer.
- `lib/plan-core.mjs` tolker tekst og tabeller i PDF-en og håndhever rød gruppe. Tolkningen kan bli ufullstendig ved endret PDF-layout.
- `netlify/functions/weather.mjs` bruker Meteorologisk institutt (ikke skraping av Pent.no), med data begrenset til skoleperioden ca. kl. 08–15.
- Frontenden spør begge plan-API-ene parallelt og viser en advarsel ved delvis lesing, ikke-publisert plan eller feil. Kun en tidligere bekreftet plan fra **samme uke** kan brukes ved midlertidig feil, tydelig merket som lagret kopi.
- Brukerspesifikk pakkestatus og minioppdrag lagres kun i nettleseren (`localStorage`).

## Kilder og begrensninger

- 3. trinn: https://www.minskole.no/fagerholt/seksjon/22636
- 7. trinn: https://www.minskole.no/fagerholt/seksjon/22640
- Vær: [Meteorologisk institutt / Yr](https://developer.yr.no/doc/locationforecast/HowTO/), samme koordinater som https://pent.no/58.14671,7.9956

Skole-PDF-er kan være vanskelige å tolke. Les alltid originalen ved tvil. Ekte PDF-innhenting og Netlify-deploy må sluttkontrolleres i produksjon etter publisering. Ingen Spond- eller Flyt Foresatt-integrasjon er med i denne versjonen.
