# Bouwopdracht: Martijns Knalfeest

Je werkt in deze GitHub-repository. Maak van het aanwezige interactieve prototype een echte mobiele trainingsapp voor een eerste live test op **vrijdag 4 december 2026**, in tijdzone **Europe/Amsterdam**. De export is een ontwerp, geen voltooide groepsapp. Lees eerst `README.md`, `STAPPENPLAN.md` en `src/prototype.html`. Bewaar de visuele richting en de hieronder vastgelegde keuzes. Bestaande tests controleren alleen het prototype; ze bewijzen geen werkende productie-app.

## Product en gebruik

Martijn is fysiek trainer bij Schouten Techniek en is de laatste week vóór kerst afwezig. De app moet dan de sessie zelfstandig begeleiden. De hoofdbeleving loopt via deelnemers hun telefoon; één telefoon is gekoppeld aan een aanwezige boombox en speelt het gezamenlijke geluid af. Martijn is niet live beschikbaar als host. Alle instructies, uitspraken, spelregels en overgangen moeten vooraf klaarstaan.

Ondersteun zowel gezamenlijke sessies op een lestijd als zelfstandig starten. De eerste bouwprioriteit voor de live test is samen trainen. Lever de solomodus pas als echt werkende route op; verberg hem zolang hij niet af is.

De training duurt van start tot finish precies 60 minuten, inclusief warming-up, puzzels, keuzes, winkeltijd, oefenblokken, finale en cooling-down. Vooraf naam invullen, boombox koppelen en de geluidstest doen gebeuren vóór het starten van die klok. De training gebruikt bekende oefeningen die deelnemers bij naam kennen: geen demonstratievideo's, uitlegpanelen of gereserveerde demonstratieruimte.

## Ontwerpbesluiten die je moet behouden

- Een lange spelkaart vormt het hoofdscherm. De kaart mag verticaal of horizontaal lopen; het huidige ontwerp loopt van boven naar beneden.
- Een eigen retro platformgame-uitstraling, met herkenbare poppetjes, zijpaden, finaleplekken en korte animaties. Gebruik eigen beelden; kopieer geen Nintendo-personages of bestanden.
- Heel weinig permanente tekst. Kleine startknop. Geen meldingen als 'blok klaar, de hele groep gaat samen verder'. Regels en puntentelling staan achter een informatieknop.
- De groep blijft samen op één positie op de kaart. De rondewinnaar loopt voorop; de rest volgt op totaalpunten. Zonder rondewinnaar bepaalt de totaalscore de loopvolgorde.
- Bovenaan blijft een compacte ranglijst met poppetjes, namen en totaalpunten beschikbaar. Bij grotere groepen mogen de eigen positie en de leiders compact worden getoond, met een knop naar de volledige ranglijst.
- Een deelnemer kan diens naam, shirtkleur en herkenbaar voorwerp kiezen, zoals boek, moersleutel, hamer of telefoon. Een naam is een schermnaam, geen bewijs van identiteit.
- Oefenblokken zijn relatief kort. Alleen oefennamen, benodigde herhalingen of werk/rustverhouding en een grote timer in een schermvullend venster. Het venster sluit automatisch na het blok en de kaart komt terug.
- De winkel is een echte stop op de kaart, geen permanente hoofdknop. Een toekomstige winkel is hooguit vooraf te bekijken; kopen kan pas bij het juiste winkelmoment.

## Route, finales en training

De groep mag vooraf de inhoud van verschillende finales bekijken. Toon welke paden daarheen lopen. Door routekeuzes moet de groep bewust op een favoriete finale kunnen aansturen; een latere winnaar kan het pad weer beïnvloeden. Een vroege keuze is geen onzichtbare definitieve lock. Maak een definitieve laatste afslag wel duidelijk.

De route beweegt van kracht en hypertrofie naar metabolic conditioning en een intensieve afsluiting, gevolgd door cooling-down. Alle aangeboden keuzes moeten intern passen bij het trainingsontwerp. Geef elk trainingsblok minimaal tags voor fase, bewegingspatroon, spiergroepen, materiaal, belasting, duur, herstel en toegestane alternatieven. De routeplanner mag geen opties tonen die het tijdschema of de trainingsbalans breken. Voorkom bijvoorbeeld dat herhaald dezelfde keuze al het trekken of alle beenbelasting uit een sessie verwijdert. Alle nog bereikbare finales moeten haalbaar blijven binnen de resterende tijd en toegestane trainingsinhoud. Als een finale niet meer bereikbaar is, toon dat eerlijk op de kaart.

Laat Martijn de echte oefeningen, belasting, alternatieven en finales vaststellen. De voorbeelden in de export zijn geen vastgesteld trainingsprogramma. Individueel een passend alternatief kiezen verandert de gezamenlijke route niet en beïnvloedt de competitie niet.

Werk vóór de implementatie een controleerbaar tijdschema uit. Een mogelijk uitgangspunt is: warming-up 8 minuten, een startstemming van 30 seconden, 12 oefenblokken van 2 minuten, 11 puzzelvensters van 60 seconden, 11 keuzevensters van 30 seconden, een finale van 6 minuten en cooling-down van 5 minuten. Dit telt op tot 60 minuten. Dit is een voorstel om met Martijn te beoordelen, geen verplichte inhoud. Leg alle winkel-, zijmissie- en overgangsmomenten binnen deze tijdvakken; tel ze niet achteraf bij het uur op.

## Puzzel- en keuzeverloop

1. Bij de start stemt iedereen op één van twee passende blokken. Meeste stemmen wint. Bij gelijkstand of geen stemmen kiest het systeem uit de geldige opties.
2. Daarna volgt steeds een korte instructie en een puzzel met maximaal 60 seconden oplostijd.
3. Mogelijke vormen: rebus, kleine schuifpuzzel, compacte sudoku, logica, muziekintro of korte pubquizvraag. Bouw voor de eerste test liever twee goede puzzelvormen dan veel halfwerkende vormen. Zorg voor een aantoonbare oplossing en beperk gokken met een korte herkansingspauze of een passend maximum aantal pogingen.
4. De eerste juiste inzending wint de ronde. Serverontvangst beslist, niet de klok van de telefoon. Leg één transparante regel vast voor vrijwel gelijktijdige juiste antwoorden.
5. Bij de winnaar verschijnen meteen twee geldige volgende blokken. De winnaar heeft maximaal 30 seconden om te kiezen. Andere deelnemers zien wie kiest en kunnen hun lopende puzzel tot de gemeenschappelijke eindtijd afmaken, zodat ook zij punten kunnen verdienen.
6. De keuzeperiode en de resterende puzzeltijd mogen parallel lopen. Start het gezamenlijke blok pas zodra het geldige puzzelvenster en de keuze zijn afgerond. Reserveer vaste tijdvakken om het uur te bewaken; gebruik resterende tijd voor een korte voorbereiding of gepland herstel. Toon geen lege schermen. Verlengen door interacties is niet toegestaan.
7. Geen juiste oplossing na de minuut? Het systeem kiest direct uit de geldige blokken. Geen keuze door de winnaar binnen 30 seconden? Het systeem kiest ook. De rondewinnaar blijft dan wel de voorloper.
8. De hele groep loopt naar het gekozen blok. Daarna verschijnt de schermvullende oefenopdracht en vervolgens automatisch weer de kaart.

Gebruik de verkorte prototypeklokken nooit als productietijden. Zet demonstratiemodus expliciet apart.

## Punten, geld en veto's

Houd drie aparte zaken bij: totaalpunten, rondewinsten en besteedbare munten. Fysieke prestaties mogen op geen enkele manier meetellen in de ranglijst.

Voorstel als configureerbare beginregels:

- Iedere tijdige correcte hoofdpuzzel: 1 punt en 10 munten.
- De eerste juiste oplossing: ook 1 rondewinst en 5 bonusmunten, plus de blokkeuze.
- Een correcte oplossing zonder rondewinst geeft maximaal één veto op zak.
- Een juiste sidequest geeft maximaal 1 extra punt per deelnemer per hoofdronde. Houd sidequestpunten herkenbaar in de uitslag.
- Eindwinnaar: meeste totaalpunten; bij gelijkstand meeste rondewinsten; daarna gedeelde winst.
- Munten uitgeven verlaagt nooit de totaalpunten. Geen echte betalingen of aankoop van munten.

Een veto kan een komende vraag vervangen vóór de antwoordfase, of een eigen oefening omwisselen voor een vooraf toegestaan alternatief. Beperk een gezamenlijke vraagwissel tot één per ronde en voorkom tegenstrijdige veto's. Gebruik dezelfde centrale tijdslimiet; reset de trainingsklok niet. Voor de eerste test mag je één van deze twee veto-acties als expliciete beperking kiezen, in overleg met Martijn.

Winkelvoorbeelden: nummer uit Martijns selectie kiezen, persoonlijke oefenwissel, outfit of voorwerp, een digitale shout-out. Eén aankoop per winkelvenster. Muziekkeuzes komen in een gedeelde wachtrij; aankopen mogen elkaars geluid niet onderbreken. Sluit een koopactie echt aan op de beloofde functie, of verberg het artikel. Een onwerkende knop of alleen 'gekocht' tonen is niet af.

## Sidequests op de kaart

Maak aanklikbare personen en objecten, met korte interacties:

- Martijns poppetje zegt 'Je bent toch niet van suiker?' of 'Zweet? Waarvan dan?'.
- Bekende collega's hebben een vooraf vastgelegde uitspraak, eventueel als 'Wie zegt dit?' voor bonuspunten.
- Korte bedrijfsvragen over bijvoorbeeld jaaromzet en nieuwe collega's.

Verzin geen collega's, citaten of bedrijfsgetallen. Laat Martijn deze aanleveren; niet-ingevulde missies staan uit in de live app. Gebruik bedrijfsgetallen alleen in de afgesproken afgeschermde testomgeving. De voorbeelddeelnemers in het prototype zijn fictief.

Sidequests mogen geen hoofdronde pauzeren, uitstellen of blokkeren. Laat ze alleen in aangewezen spel- of herstelvensters openen, sluit ze tijdig en beperk herhaald verdienen. Interacties tijdens een lopende oefenopdracht zijn niet nodig. Bied geen route-omweg die deelnemers letterlijk extra trainingstijd kost.

## Deelname, geluid en beheer

- Deelname begint bij de QR-scan en het invoeren van een voornaam of bijnaam, zonder e-mail of wachtwoord in de deelnemersapp.
- Voorinschrijving en afstemmen van aanwezigheid gebeuren in het bestaande mailproces. Geen automatische mails versturen of nieuwe mailintegratie bouwen zonder expliciete opdracht. Houd geplande deelname, QR-check-in en afronding afzonderlijk bij.
- Gebruik per sessie een onvoorspelbare toegangscode of deelnamelink. Alleen een naam is onvoldoende om toegang tot andermans sessie of gegevens te beveiligen.
- Eén telefoon verzorgt het gezamenlijke geluid. De andere telefoons blijven stil. Laat iemand die telefoon aanwijzen, via de telefooninstellingen met de boombox verbinden en een geluidstest doen. De app begeleidt daarna zelfstandig; deze persoon hoeft geen trainer of quizmaster te zijn.
- Test geluid, browseronderbrekingen en scherm actief houden op de echte telefoons. Beloof geen betrouwbare achtergrondwerking zonder die te testen. Als de geluidstelefoon wegvalt: gezamenlijke veilige herstelstatus, heldere herstart of overdracht, geen dubbele muziek.
- Muziek wordt later ingevuld. Ondersteun in de architectuur aparte bronnen voor muziek en gesproken aanwijzingen. Verzin of download geen muziekcatalogus. Maak de regie eerst met testgeluid en sluit daarna de afgesproken muziekbron aan.
- Maak Martijns beheer afgeschermd. Hierin staan trainingsblokken, finales, puzzels met antwoorden, echte uitspraken, winkelartikelen, sessies en openings- en sluitingsdata. Beheer hoeft voor de test geen uitgebreide visuele editor te zijn; een goed gevalideerde configuratie kan voldoende zijn.
- Openingsdatum, inschrijfsluiting, einde deelname en gegevensverwijdering zijn aparte instellingen. Vul onbekende kerstweekdata niet zelf in. De testdatum is niet automatisch de feestweek.

## Techniek en betrouwbaarheid

Kies een kleine onderhoudbare opzet die de testdatum haalt. Een statische GitHub Pages-site alleen kan geen servergestuurde gedeelde sessies leveren. Motiveer de keuze voor server en gegevensopslag kort voordat je bouwt. Gebruik geen specifieke hostingdienst als ongevraagde harde afhankelijkheid.

Gebruik één centrale sessietoestand en serverklok. Sla deadlines als tijdstippen op. Laat de telefoon aftellen uit die tijdstippen; tel geen seconden op de achtergrond om de waarheid vast te houden. Scores, antwoorden, veto's, aankopen, stemmen en blokkeuzes worden op de server gevalideerd. De browser krijgt de antwoordsleutel niet vooraf. Handelingen moeten herhaalde inzendingen en dubbele verwerking kunnen verdragen. Autoriseer de blokkeuze alleen voor de geldige rondewinnaar en het openen van een sessie voor de juiste bediening.

Een herladen pagina of kort netwerkverlies sluit weer aan op de juiste fase en score. Sla deelname op als sessiegebonden anonieme identiteit; voorkom dat iedereen zich met dezelfde naam als een andere speler kan voordoen. Neem geen echte sleutels op in browsercode, Git of documentatie.

Overweeg gegevensobjecten voor evenement, sessie, deelnemer, avatar, rondes, inzendingen, stemmen, routeknopen, trainingstags, finale, voorraad, aankopen en sidequests. Maak voorbeelden en productiegegevens duidelijk verschillend.

## Werkvolgorde en oplevering

1. Leg vast wat bestaand prototype is en wat ontbreekt; lees het stappenplan.
2. Bouw eerst een complete gedeelde ronde op twee of meer telefoons: join, puzzel, winnaar, keuze, oefentimer en terug naar kaart.
3. Maak reconnects, timeouts en scorecontrole betrouwbaar.
4. Bouw de gevalideerde route en uurindeling, met zichtbare finalevoorkeuren.
5. Sluit één geluidstelefoon en Martijns vooraf vastgelegde aanwezigheid aan.
6. Voeg winkel, één echte sidequest en verdere puzzelvormen toe wanneer de kern werkt.
7. Test vóór 4 december een compleet uur op locatie en verwerk de bevindingen. Werk `STAPPENPLAN.md` bij met bewijs, resterende beperkingen en de testlink.

Schrijf betekenisvolle tests voor gelijktijdige correcte antwoorden, dubbele inzendingen, verkeerde winnaar die kiest, timeouts, herladen, uitval geluidstelefoon, score versus munten, herhaald sidequestclaimen, aankopen en gelijke trainingstijd voor iedere route. Controleer de complete 60-minutensessie ook op echte telefoons en de aanwezige boombox. Alleen geslaagde tests van het huidige prototype zijn geen vrijgave voor een live trainingsgroep.

Lever een werkende testlink met QR-code, beheerinstructie, korte startinstructie voor de telefoon bij de boombox, invulbare inhoudsconfiguratie en een overzicht van werkelijk geteste functies. Noem onafgewerkte onderdelen eerlijk. Publiceer geen bedrijfsgegevens of onvoltooide functies om de testdatum kunstmatig te halen.
