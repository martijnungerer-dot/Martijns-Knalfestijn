# Projectstatus — 23 november 2026

## Werkend

### Gedeelde ronde (mijlpaal 1, branch `claude/gallant-clarke-ju7y51`)

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

### Prototype

- Zelfstandig, offline te openen mobiel prototype in `index.html`, met kaart, finales, winkel, sidequest en poppetjes. Het blijft de referentie voor beleving en vormgeving.

## Getest

- `npm test`: 7 prototypecontroles en 9 integratietests tegen de echte server, met drie deelnemers en een nagemaakte klok. Ze dekken:
  - een volledige ronde: één goed, één fout, één herlaadt
  - dubbele inzending met dezelfde actie-id, en opnieuw oplossen
  - twee gelijktijdige goede antwoorden: precies één winnaar
  - het maximum aantal pogingen
  - een timeout zonder winnaar
  - een winnaar die niet kiest, zonder dat deadlines verschuiven
  - een onbevoegde blokkeuze (geen winnaar, andere speler, zonder cookie, onbekend blok)
  - starten zonder token en het overnemen van een naam
  - de eventstream
- Browsercontrole met Playwright: drie losse iPhone-browsers spelen een complete demoronde, inclusief een fout antwoord, herladen tijdens de puzzel, winnaarskeuze, oefenscherm en eindstand. Iedereen zag dezelfde uitkomst, zonder scriptfouten. Dit script staat niet in de repository.

## Nog niet gebouwd of getest

- **Niet op echte telefoons of via een netwerk getest.** Er is ook geen hosting of testlink.
- Herstel na een **serverherstart**: de toestand staat alleen in het geheugen (mijlpaal 2, met SQLite).
- Meer dan één ronde, startstemming, routegraaf, finales, uurindeling van 60 minuten, winkel, veto's, sidequests, geluidstelefoon, beheeromgeving en avatarvoorwerpen.
- React/Vite/Fastify zijn bewust nog niet ingevoerd. De ronde draait op Node 22 zonder pakketten.
- Een late deelnemer, of iemand die zijn cookie kwijt is, kan na de start niet meer meedoen.
- Puzzelinhoud en oefeningen zijn fictieve voorbeelden.

## Bouwcontrole

```sh
npm run build
npm test
npm start
```

## Eerstvolgende taak

**Mijlpaal 2: herstel.** Toestand en actie-ids opslaan, zodat een serverherstart, netwerkverlies en dubbele acties geen andere score of extra tijd geven. Daarna een eerste test op drie echte telefoons via een tijdelijke host.

## Openstaande inhoudskeuzes voor Martijn

- Testtijd, testgroep en beschikbare materialen op 4 december.
- De echte oefeningen, belasting, alternatieven en twee finales.
- Definitieve muntprijzen en welke veto-actie als eerste wordt gebouwd.
- Muziekbron, nummers en vooraf vastgelegde hostteksten of opnames.
- Collega-uitspraken en gecontroleerde antwoorden voor bedrijfs-sidequests.
- Kerstweekdata, inschrijfsluiting, einde deelname en gegevensverwijdering.
- Hosting voor de testlink (een dienst met één Node-proces en, vanaf mijlpaal 2, blijvende opslag).

Deze inhoudskeuzes blokkeren de bouw van de centrale sessielogica niet.
