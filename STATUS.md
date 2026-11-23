# Projectstatus — 23 november 2026

## Werkend

- Zelfstandig, offline te openen mobiel prototype in `index.html`.
- Lange kaart, aanklikbare finalevoorbeelden en zichtbare eindrichtingen.
- Puzzel, routekeuze, automatische timeouts en een oefenscherm dat vanzelf sluit.
- Poppetjes met schermnamen, kleur en voorwerpen, ranglijst, munten en winkelstop.
- Eén voorbeeldsidequest; onbekende bedrijfsinhoud is als invulplek gemarkeerd.
- Zeven automatische controles van het prototypegedrag.
- Volledige productprompt, architectuurplan, testplanning en gedeelde instructies voor Codex en Claude.

## Nog niet gebouwd

De server, gezamenlijke sessies, echte groepsstemming, gedeelde klok, geldige anonieme identiteit, beheer, QR-check-in, scores en aankopen op de server, boomboxregie, echte muziek, een trainingsprogramma van een uur en betrouwbare hervatting na onderbrekingen.

De prototypewinkelaankopen tonen alleen een bevestiging. Ze starten geen muziek en veranderen nog geen echte oefening. De finale-inhoud en deelnemers zijn voorbeelden. De verkorte tijden zijn uitsluitend voor de demo.

## Huidige bouwcontrole

```sh
npm run build
npm test
```

Zeven prototypecontroles slagen. Er is nog geen volledige browserrepetitie, netwerktest op meerdere telefoons of uurtraining uitgevoerd. GitHub/Claude-toegang en een productiedeployment zijn geen gevolg van deze testuitslag.

## Eerstvolgende taak

**Mijlpaal 1: één gedeelde ronde op drie telefoons.**

1. Werk de voorgestelde mapstructuur uit zonder de werkende demo kwijt te raken.
2. Voeg een sessie aanmaken en toetreden met schermnaam toe.
3. Bouw servertoestand, actuele snapshot, eventstream en centrale deadlines.
4. Koppel één puzzel, winnaar, twee blokkeuzes en een oefenvenster.
5. Test correcte/incorrecte antwoorden, timeouts en herladen met drie browsers.

Af wanneer iedereen dezelfde fase, winnaar en route ziet en de ronde zonder handmatig ingrijpen verderloopt. Dit is de prioriteit vóór extra puzzelvormen, outfits of zijmissies.

## Openstaande inhoudskeuzes voor Martijn

- Testtijd, testgroep en beschikbare materialen op 4 december.
- De echte oefeningen, belasting, alternatieven en twee finales.
- Definitieve muntprijzen en welke veto-actie als eerste wordt gebouwd.
- Muziekbron, nummers en vooraf vastgelegde hostteksten of opnames.
- Collega-uitspraken en gecontroleerde antwoorden voor bedrijfs-sidequests.
- Kerstweekdata, inschrijfsluiting, einde deelname en gegevensverwijdering.

Deze inhoudskeuzes blokkeren de bouw van de centrale sessielogica niet.
