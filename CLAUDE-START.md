# Verder werken met Claude op het web

Repository: https://github.com/martijnungerer-dot/Martijns-Knalfestijn

## Code laten wijzigen

Gebruik [Claude Code op het web](https://claude.ai/code). Koppel daar je eigen GitHub-account en geef de Claude GitHub App toegang tot **Martijns-Knalfestijn**. Selecteer bij repositorytoegang alleen deze repository als je geen andere projecten wilt delen. De beschikbare stappen en toegang hangen af van je Claude-account; de officiële onboarding toont wat nog nodig is.

Kies vervolgens deze repository. `CLAUDE.md` importeert de gezamenlijke instructies uit `AGENTS.md`. Daarmee krijgen Codex en Claude dezelfde productafspraken, bouwcommando's en grenzen. Deze bestanden geven op zichzelf geen GitHub-toegang.

De GitHub-koppeling wordt in jouw Claude/GitHub-account geautoriseerd. Er wordt geen fictieve Claude-gebruiker als collaborator uitgenodigd en je hoeft geen persoonlijke toegangstoken in deze repository te plakken.

## Eerste opdracht om te plakken

```text
Werk in martijnungerer-dot/Martijns-Knalfestijn.
Lees AGENTS.md, STATUS.md, ARCHITECTUUR.md en BOUWPROMPT.md.

Bouw mijlpaal 1: één gedeelde ronde op drie telefoons.
Behoud het bestaande prototype als referentie. Begin met sessie aanmaken,
toetreden op schermnaam, centrale deadlines, één puzzel, servermatig bepaalde
winnaar, twee geldige blokkeuzes en een automatisch sluitend oefenscherm.

Werk op een eigen branch. Controleer of Codex al aan dezelfde bestanden werkt.
Voeg betekenisvolle tests toe voor dubbele antwoorden, timeouts, onbevoegde
blokkeuze en hervatten na herladen. Werk STATUS.md bij met wat echt werkt,
wat is getest en wat ontbreekt. Open een pull request met de resultaten.
```

Geef Codex niet tegelijk dezelfde taak. Voor een tweede parallelle taak kun je bijvoorbeeld een zelfstandige puzzelcomponent afspreken, met een vooraf vastgelegd contract dat de centrale spelmotor niet herschrijft.

## Alleen meelezen of sparren

In een gewone Claude-chat kun je via **+ → Add from GitHub** bestanden toevoegen. In een Claude Project voeg je GitHub toe aan de projectkennis. Selecteer minstens README, ARCHITECTUUR, STATUS en BOUWPROMPT, plus de relevante bronbestanden. Synchroniseer opnieuw wanneer de repository is bijgewerkt. Deze manier levert codecontext voor het gesprek; de schrijfworkflow hierboven loopt via Claude Code op het web.

## Bronnen

- [Claude Code in de cloud en GitHub koppelen](https://code.claude.com/docs/en/claude-code-on-the-web)
- [GitHub-bestanden toevoegen aan een gewone Claude-chat of Project](https://support.claude.com/en/articles/10167454-use-the-github-integration)
- [Gedeelde instructies via een CLAUDE.md-import](https://code.claude.com/docs/en/memory#share-one-file-with-other-coding-tools)
- [Codex-projectinstructies met AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
