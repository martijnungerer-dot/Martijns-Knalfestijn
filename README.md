# Martijns Knalfestijn

Broncode: [martijnungerer-dot/Martijns-Knalfestijn](https://github.com/martijnungerer-dot/Martijns-Knalfestijn).

Dit is de gezamenlijke basis om verder te bouwen met Codex en Claude. Begin bij [ARCHITECTUUR.md](ARCHITECTUUR.md), [STATUS.md](STATUS.md) en [AGENTS.md](AGENTS.md). Voor Claude op het web staat de koppeling uitgelegd in [CLAUDE-START.md](CLAUDE-START.md).

De architectuur beschrijft de volgende ontwikkelfase. De huidige code is nog het onderstaande zelfstandige prototype; de server en het samenspel zijn nog niet gebouwd.

Een export van het interactieve ontwerp voor een tijdelijke trainingsweek, met een gezamenlijke route, minuutpuzzels, trainingskeuzes, zichtbare finales, herkenbare poppetjes, een winkelstop en sidequests.

## Meteen bekijken

Open `index.html` in een recente browser. Dit bestand werkt zelfstandig, ook zonder internet. De andere deelnemers en hun scores zijn voorbeelden. De puzzel duurt in dit prototype 10 seconden, de keuze 5 seconden en het oefenblok 8 seconden. Dit zijn demonstratietijden.

Klik op:

- **Start** of het vraagteken om een ronde te spelen. Kies 4 en 6 en druk op Controleer.
- Een finale om vooraf de inhoud en de route ernaartoe te bekijken.
- Martijn voor een kleine sidequest. De andere sidequests bevatten nog invulplekken.
- Het potlood bovenaan voor naam, shirtkleur en voorwerp.
- De informatieknop voor de spelregels.
- De winkel op de kaart. Kopen kan in het voorbeeld wanneer de groep de winkel bereikt.

De keuzes en het poppetje worden alleen op dit apparaat bewaard als de browser lokale opslag toestaat. Voor een schone demonstratie kun je een privévenster gebruiken. Gebruik geen echte trainingsgroep in deze versie.

## Wat deze export wel en nog niet doet

**Wel:** aanklikbare kaart, routekeuzes, finalevoorbeelden, automatische overgangen, oefenscherm dat automatisch sluit, puntentelling, munten, een eenvoudige winkel, sidequest, avatar en naam aanpassen.

**Nog niet:** gelijktijdig samenspel op meerdere telefoons, gedeelde serverklok, echte groepsstemming, QR-inschrijving/check-in, echte deelnemersaccounts/sessies, boomboxgeluid, muziekafspelen, betrouwbare hervatting na telefoononderbreking, volledig trainingsprogramma van één uur, daadwerkelijke levering van gekochte nummers of oefenwissels, live bedrijfsgegevens, einddatum of gegevensverwijdering.

Een aankoop in dit prototype toont alleen het spelgedrag en kost munten. De betaalde actie is nog niet aangesloten op muziek of een echte training. De getoonde finales en trainingsblokken zijn voorbeelden, geen door Martijn vastgesteld programma.

## Voor GitHub

Deze map vormt de basis van de bestaande GitHub-repository. Er staan geen sleutels of persoonlijke bedrijfsgegevens in. De repository is openbaar; echte deelnemerslijsten, bedrijfsgetallen, muziekbestanden en geheime configuratie horen buiten de broncode.

- `index.html`: zelfstandig te openen export.
- `src/prototype.html`: leesbare bron van het ontwerp.
- `ARCHITECTUUR.md`: technische opzet, sessieverloop, opslag en bouwvolgorde.
- `AGENTS.md`: gedeelde werkinstructies voor coding agents.
- `CLAUDE.md`: importeert dezelfde afspraken voor Claude Code.
- `CLAUDE-START.md`: Claude op het web aansluiten op deze repository.
- `STATUS.md`: wat daadwerkelijk werkt en wat als volgende moet worden gebouwd.
- `BOUWPROMPT.md`: volledige productopdracht om een werkende groepsapp te maken.
- `STAPPENPLAN.md`: voorbereiding op de live test van vrijdag 4 december 2026.
- `scripts/`: export en een optionele lokale webserver, zonder extra pakketten.
- `tests/`: automatische controles van het prototypegedrag.

GitHub Pages kan dit prototype laten zien. Alleen GitHub Pages levert geen gedeelde sessies, centrale klok of betrouwbare servercontrole op scores; daarvoor is ook een serverdienst nodig. Volg voor de echte app de bouwprompt.

## Bewerken en controleren

Met Node.js 22 of nieuwer, zonder installatie van aanvullende pakketten:

```sh
npm run build
npm test
npm run dev
```

De gedeelde ronde draait lokaal met `npm start` (Node, poort 3000) of `npm run worker` (Cloudflare-runtime, poort 8787; vraagt eenmalig `npm install`).

## Publiceren op Cloudflare

De gedeelde app draait als Cloudflare Worker: de pagina's als statische bestanden, elke sessie in een eigen Durable Object met opslag en een wekker voor de deadlines. Instellingen staan in `wrangler.jsonc`.

1. Cloudflare-dashboard → **Workers & Pages** → **Create** → **Import a repository** → kies `Martijns-Knalfestijn`.
2. Build command leeg laten; deploy command: `npx wrangler deploy`.
3. Na de deploy staat de app op `https://martijns-knalfestijn.<jouw-subdomein>.workers.dev`. Elke push naar `main` publiceert opnieuw.

Iedereen met de link kan een sessie aanmaken; starten kan alleen de maker. Een beheersleutel (`ADMIN_KEY`) wordt door de server ondersteund, maar de beginpagina vraagt er nog niet om: zet hem nog niet.

Bewerk eerst `src/prototype.html` en maak daarna de export opnieuw. `index.html` wordt bij het bouwen overschreven. De lokale server toont alleen de export op `http://127.0.0.1:4173`.

De illustratie gebruikt zelfgemaakte eenvoudige poppetjes en systeememoji. Er worden geen Nintendo-personages of externe beeldbestanden meegeleverd. Muziekbestanden zijn niet inbegrepen.

## Eerstvolgende stap

Lees `STAPPENPLAN.md` en geef een bouwagent `BOUWPROMPT.md` met de repository als context. Het kritieke werk is eerst gedeelde sessies en timers, daarna de volledige uurindeling en geluid. Extra aankleding volgt pas daarna.
