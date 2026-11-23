# Projectinstructies — Martijns Knalfestijn

## Begin hier

Lees `STATUS.md`, `ARCHITECTUUR.md` en het relevante deel van `BOUWPROMPT.md` vóór implementatie. `STAPPENPLAN.md` bevat de voorbereiding op de test van vrijdag 4 december 2026, Europe/Amsterdam. Een chatopdracht kan de prioriteit bijstellen.

Dit project is een mobiele spelhost voor een zelfstandig begeleide training van precies één uur. Martijn is tijdens de kerstweek afwezig. De app mag niet afhankelijk zijn van live hulp van een trainer. Voor de eerste test staat samen trainen centraal; zelfstandig starten blijft onderdeel van het product.

## Wat er nu staat

- `src/prototype.html` is de bron van het interactieve ontwerp.
- `scripts/build.mjs` genereert `index.html`; wijzig de gegenereerde export niet rechtstreeks.
- `scripts/offline-runtime.js` zorgt voor lokale demo-opslag en pictogrammen.
- De demo simuleert medespelers en gebruikt timers van 10, 5 en 8 seconden. Dit is geen server of echte groepssessie.
- `tests/flow.test.cjs` controleert prototypegedrag met een gesimuleerde klok. Het zijn geen browser-, audio- of samenspeltests.
- De mappen voor de voorgestelde productiearchitectuur bestaan nog niet. Maak ze pas bij de bijbehorende taak.

## Productregels

- Mobiel eerst. Weinig tekst op het hoofdscherm: kaart, compacte ranglijst, kleine startknop. Regels achter een informatieknop.
- De groep blijft samen. De rondewinnaar loopt voorop; daarna de rest op totaalpunten. Geen fysieke prestatie in de score.
- De eerste blokkeuze gebeurt door groepsstemming. Vervolgens verdient de eerste juiste puzzeloplosser maximaal 30 seconden keuzerecht. Puzzels hebben maximaal 60 seconden. Timeouts lopen zelfstandig verder.
- De winkel is een stop op het pad. Finales zijn vooraf te bekijken, met zichtbare routes ernaartoe. Keuzes moeten werkelijk invloed hebben op de finale.
- Korte bekende oefeningen bij naam; geen demonstratiemodule. Het oefenscherm vult het scherm en sluit vanzelf.
- De opbouw gaat van kracht/hypertrofie naar metcon en hoge intensiteit, gevolgd door cooling-down. Alleen vooraf toegestane, tijdsgelijke keuzes aanbieden.
- Het complete uur omvat alle spel-, winkel-, herstel- en overgangstijd. Gebruik een centrale klok en vaste tijdvakken; tel interactieve tijd niet achteraf bij.
- Punten, rondewinsten, munten en veto's zijn verschillende gegevens. Aankopen kosten geen ranglijstpunten.
- Sidequests mogen de hoofdklok niet ophouden; beperk bonusclaims en gebruik alleen vastgestelde inhoud.
- Geen e-mail of wachtwoord voor deelnemers. Een schermnaam is geen authenticatie. Gebruik sessiegebonden anonieme toegang en afgeschermd beheer.
- Eén telefoon speelt groepsgeluid af. Martijns digitale aanwezigheid staat vooraf klaar.

## Bouwen en controleren

De huidige scripts hebben Node.js 22 of nieuwer nodig en vereisen geen pakketinstallatie:

```sh
npm run build
npm test
npm run dev
```

Na aanpassingen aan de bron: export opnieuw bouwen en de relevante tests uitvoeren. Werk instructies, lockfile en commando's bij zodra echte dependencies of de nieuwe applicaties worden toegevoegd. Voeg geen lege productiecomponenten toe om voortgang te suggereren.

Test bij de gedeelde app vooral de betekenisvolle grenzen: twee goede antwoorden tegelijk, deadline verlopen, dubbele inzending, onbevoegde keuze, muntentransactie, sidequest dubbel claimen, herladen en reconnect, audio-overdracht, tijdsgelijke routes en precies 60 minuten. Voer daarnaast een echte repetitie met telefoons en boombox uit.

## Samenwerken met Codex en Claude

- GitHub is de gedeelde bron. Begin met de actuele hoofdbranch en werk per afgebakende taak op een eigen branch, bijvoorbeeld `codex/shared-session` of `claude/puzzle-components`.
- Laat geen twee agents tegelijk dezelfde sessielogica of hetzelfde bestand herschrijven. Spreek scope af en gebruik een pull request om samen te voegen.
- Bewaar werk van anderen. Geen force-pushes of resets over andermans wijzigingen.
- Werk `STATUS.md` bij met wat werkelijk af is, wat is getest en wat de volgende taak is. Een plan is geen implementatie.
- Houd gedeelde projectregels in dit bestand. `CLAUDE.md` importeert het; maak geen tweede afwijkende lijst.
- Een projectinstructiebestand geeft geen GitHub-toegang. OAuth- of appmachtigingen worden apart door de gebruiker geregeld.

## Gegevens en inhoud

Deze repository is openbaar. Commit uitsluitend voorbeelden en configuratieschema's. Geen deelnemerslijsten, echte omzetcijfers, privécitaten, audio-opnames, muziekbibliotheek, cookies, toegangstokens of `.env`-bestanden. Gebruik geen fictieve bedrijfsfeiten als productie-inhoud. Maak de ontbrekende inhoud invulbaar en zet onafgemaakte spelonderdelen uit in de live test.

Communiceer met Martijn in helder, beknopt Nederlands. Vermeld werkende functies, controles en relevante beperkingen. Ga door met geautoriseerd werk; vraag alleen naar beslissingen die daadwerkelijk ontbreken.
