# Projectstatus — 23 november 2026

## Werkend

### Gedeelde ronde (mijlpaal 1)

- `npm start` draait een server. Op `/` maak je een sessie (eventueel met demotijden 20/10/15 s). De maker krijgt de startknop en een deellink `/s/CODE` met een onvoorspelbare code van acht tekens.
- Meedoen met schermnaam en shirtkleur. De server geeft een anonieme identiteit in een HttpOnly-cookie. Een dubbele naam wordt geweigerd. Meedoen na de start kan niet.
- Starten kan alleen met het beheertoken van de maker.
- De server legt de deadlines als vaste tijdstippen vast: puzzel 60 s, keuzetijdvak 30 s, oefenblok 2 min. Interacties verlengen niets.
- Eén puzzel (twee getallen die samen 10 maken) met maximaal 3 pogingen. De antwoordsleutel blijft op de server.
- De eerste juiste inzending wint, op volgorde van ontvangst door de server. Goed geeft 1 punt en 10 munten. De winnaar krijgt daarnaast een rondewinst en 5 munten.
- De winnaar ziet meteen twee blokken en heeft 30 seconden om te kiezen. Anderen zien "Nina kiest" en kunnen hun puzzelminuut afmaken.
- Kiest de winnaar niet, of wint niemand? Dan kiest het systeem de eerste optie. De winnaar blijft voorop lopen.
- Alle telefoons krijgen via een eventstream (SSE) dezelfde fase, winnaar en route. De klok telt af vanaf de servertijd. Het oefenscherm vult het scherm en sluit vanzelf. Daarna verschijnt de eindstand.
- Na herladen sluit een telefoon weer aan op dezelfde deelnemer, fase en score. Bij verbindingsverlies verschijnt "Verbinding herstellen…".
- De prototypebron en de export `index.html` zijn ongewijzigd.

### Herstel en Cloudflare (mijlpaal 2)

- Hosting: Cloudflare Workers + Durable Objects (keuze van Martijn). Elke sessie is één Durable Object. Dat verwerkt de opdrachten na elkaar, slaat de toestand na elke wijziging op en zet een wekker op de eerstvolgende deadline. Een ronde loopt zo ook door als geen enkele telefoon iets stuurt.
- Na een serverherstart blijven deelnemers (cookies), score, actie-ids en deadlines bewaard. Verstreken fases worden ingehaald zonder het einde op te schuiven.
- Bij netwerkverlies stuurt de telefoon hetzelfde verzoek tot drie keer opnieuw, met dezelfde actie-id. De server verwerkt het één keer.
- De spelregels en de sessiekamer (`apps/server/room.mjs`) zijn dezelfde voor de lokale Node-server en voor Cloudflare.

### Prototype

- Zelfstandig, offline te openen mobiel prototype in `index.html`, met kaart, finales, winkel, sidequest en poppetjes. Het blijft de referentie voor beleving en vormgeving.

## Getest

- `npm test`: 20 tests. Naast 7 prototypecontroles en 2 wekkertests zijn er 11 integratietests tegen de echte server, met drie deelnemers en een nagemaakte klok. Ze dekken:
  - een volledige ronde: één goed, één fout, één herlaadt
  - dubbele inzending met dezelfde actie-id, en opnieuw oplossen
  - twee gelijktijdige goede antwoorden: precies één winnaar
  - het maximum aantal pogingen
  - een timeout zonder winnaar
  - een winnaar die niet kiest, zonder dat deadlines verschuiven
  - een onbevoegde blokkeuze (geen winnaar, andere speler, zonder cookie, onbekend blok)
  - starten zonder token en het overnemen van een naam
  - de eventstream
- Herstarttests (Node, met dezelfde opslag): korte uitval tijdens de keuzetijd, lange uitval tot in het oefenblok, en uitval waarbij de winnaar niet kiest.
- Wekkertests: de wekker staat steeds op de eerstvolgende deadline en stopt na afloop.
- Lokale Cloudflare-runtime (`wrangler dev`, workerd):
  - dezelfde browserronde met drie iPhones geslaagd; de fases liepen door via de wekker
  - de Worker 25 seconden gestopt midden in een demoronde en weer gestart: dezelfde deelnemer, score behouden, systeemkeuze gemaakt, ronde daarna vanzelf afgerond
- Browsercontrole met Playwright: drie losse iPhone-browsers spelen een complete demoronde, inclusief een fout antwoord, herladen tijdens de puzzel, winnaarskeuze, oefenscherm en eindstand. Iedereen zag dezelfde uitkomst, zonder scriptfouten. Dit script staat niet in de repository.

## Nog niet gebouwd of getest

- **Nog niet op Cloudflare gepubliceerd** en niet op echte telefoons getest. Martijn koppelt de repository in Cloudflare (zie README).
- De lokale Node-server bewaart sessies alleen in het geheugen. Bewaard herstel na een herstart geldt voor Cloudflare; de Node-tests bootsen dat na met gedeelde opslag.
- Meer dan één ronde, startstemming, routegraaf, finales, uurindeling van 60 minuten, winkel, veto's, sidequests, geluidstelefoon, beheeromgeving en avatarvoorwerpen.
- React is nog niet ingevoerd. Fastify en SQLite op schijf vervallen door de keuze voor Cloudflare.
- Een late deelnemer, of iemand die zijn cookie kwijt is, kan na de start niet meer meedoen.
- Puzzelinhoud en oefeningen zijn fictieve voorbeelden.

## Bouwcontrole

```sh
npm run build
npm test
npm start          # lokaal, Node
npm run worker     # lokaal, Cloudflare-runtime (na npm install)
```

## Eerstvolgende taak

1. Martijn publiceert op Cloudflare. Daarna één echte ronde op drie telefoons via de testlink: één goed, één fout, één herlaadt of zet even de vliegtuigstand aan.
2. **Mijlpaal 3: trainingsroute.** Inhoudsvalidatie, startstemming, meerdere rondes, zichtbare finales en een 60-minutenschema waarin alle paden even lang duren.

## Openstaande inhoudskeuzes voor Martijn

- Testtijd, testgroep en beschikbare materialen op 4 december.
- De echte oefeningen, belasting, alternatieven en twee finales.
- Definitieve muntprijzen en welke veto-actie als eerste wordt gebouwd.
- Muziekbron, nummers en vooraf vastgelegde hostteksten of opnames.
- Collega-uitspraken en gecontroleerde antwoorden voor bedrijfs-sidequests.
- Kerstweekdata, inschrijfsluiting, einde deelname en gegevensverwijdering.

Deze inhoudskeuzes blokkeren de bouw van de centrale sessielogica niet.
