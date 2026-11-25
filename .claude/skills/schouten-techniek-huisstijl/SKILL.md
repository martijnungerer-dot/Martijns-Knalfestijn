---
name: schouten-techniek-huisstijl
description: Huisstijl van Schouten Techniek voor schermen van Martijns Knalfeest (kleuren, lettertype, knoppen, kaarten, focus). Gebruik bij elk nieuw of aangepast scherm, bij een artefact of schets van de app, en wanneer iemand vraagt om "in de huisstijl" te ontwerpen.
---

# Huisstijl Schouten Techniek

Bron: de huisstijltokens van het Leerplatform Schouten Techniek
(`leertool-schouten-techniek/src/modules/huisstijl.jsx`, `ST` en `UI`). Die
waarden gaan altijd voor. Geen andere skill kiest kleuren of lettertypen.

## Kleuren

Merkkleuren (`ST`). De hoofdinterface is **oranje, donker, wit en warm
neutraal**. Rood en blauw zeer terughoudend gebruiken: alleen als signaal of
klein accent, nooit als vlak.

| Token | Waarde | Gebruik |
| --- | --- | --- |
| `--st-oranje` | `#F6A923` | Accent, actieve staat, focusring, voortgang, munten |
| `--st-donker` | `#1D1D1D` | Tekst, primaire knop, kopbalk |
| `--st-blauw` | `#0098D4` | Spaarzaam: informatie, één klein accent |
| `--st-rood` | `#E32118` | Spaarzaam: fout of waarschuwing |
| `--st-zilver` | `#B1B2B4` | Uitgeschakeld, scheidingslijnen |

Interfacekleuren (`UI`), geen merkkleuren:

| Token | Waarde | Gebruik |
| --- | --- | --- |
| `--app-achtergrond` | `#FBF8F2` | Pagina-achtergrond (warm neutraal) |
| `--kaart` | `#FFFFFF` | Kaarten en panelen |
| `--kaart-zacht` | `#FFFCF7` | Zachte kaart, rustige vlakken |
| `--rand-zacht` | `#E9DED0` | Randen van kaarten, velden en secundaire knoppen |
| `--tekst-secundair` | `#667085` | Bijschriften |
| `--pad-neutraal` | `#D8CDBF` | Paden, lege staat |
| `--succes` | `#2E7D4F` | Goed antwoord, afgerond (met `#E8F4EC` vlak, `#9CCBAD` rand) |
| hover-zacht | `#FDEED3` | Hover op witte knoppen en pillen |

Statusvlakken uit de raat (voortgang): afgerond `#E3F1E8`, bezig wit met
oranje rand, later warm zand `#F7EBD7`, leeg `#F1EAE0`. Kleur is nooit het
enige onderscheid: geef ook een merkteken of woord.

## Lettertype

`Calibri, Carlito, Candara, "Segoe UI", system-ui, Arial, sans-serif`.
Carlito (Google Fonts, metrisch gelijk aan Calibri) laden in artefacten. Geen
decoratieve displayletter; hiërarchie met gewicht (400/700) en grootte.

## Vormtaal

- **Primaire knop:** pil (`border-radius: 999px`), donker vlak, witte tekst,
  vet. Hover `#333030`.
- **Secundaire knop / chromepil:** pil, wit, 1px `--rand-zacht`, donkere tekst.
  Hover `#FDEED3`. Actief: donker vlak, witte tekst.
- **Kaart:** `--kaart-zacht`, 1px `--rand-zacht`, radius 18px, zachte schaduw
  `0 1px 2px rgba(29,29,29,.04)`; bij hover wit en `0 4px 14px rgba(29,29,29,.09)`.
- **Honingraat** is de eigen vorm van Schouten Techniek: gebruik hem voor
  voortgang, badges en markeringen in plaats van cirkels waar dat past.
- **Focus:** overal `outline: 2px solid var(--st-oranje); outline-offset: 2px`,
  nooit de blauwe browserring.
- **Licht ontwerp.** `color-scheme: light`; formuliervelden expliciet wit met
  donkere tekst.
- **Beweging:** rustig, schermwissel 0,34 s omhoog en infaden. Respecteer
  `prefers-reduced-motion`.

## Voor Martijns Knalfeest

- De spelwereld (kaart, poppetjes, landschap) mag kleurrijk blijven; alles wat
  de deelnemer bedient (kopbalk, knoppen, panelen, puzzel, oefenscherm,
  badges, ranglijst) volgt deze huisstijl.
- Kopbalk en oefenscherm: donker vlak, witte tekst, oranje accent.
- Munten, voortgang en de uurklok: oranje.
- Goed antwoord en afgeronde sets: `--succes`. Fout: `--st-rood`, kort en klein.
- Geen Nintendo-personages, -vormen of -beelden; eigen beelden.
- Toegankelijkheid: tekst minimaal 4,5:1, randen en iconen 3:1. Oranje tekst op
  wit haalt geen 4,5:1; gebruik oranje als vlak met donkere tekst.
