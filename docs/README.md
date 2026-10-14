# Kids4All2Learn — versie 0.1

## Mappenstructuur
- `index.html`: homepage
- `assets/css/style.css`: alle gedeelde opmaak
- `assets/js/i18n.js`: talen en automatische taalkeuze
- `assets/images/`: toekomstige afbeeldingen, figuren en mascottes
- `assets/icons/`: website- en app-iconen
- `locales/`: losse JSON-vertaalbestanden
- `games/draw/`: tekenatelier (eigen HTML en JavaScript)
- `games/colors/`: kleurenspel (eigen HTML en JavaScript)
- `parents/`: informatie voor ouders
- `manifest.webmanifest`: basis voor een installeerbare webapp

## Publiceren met GitHub Pages
1. Maak een repository `kids4all2learn` aan.
2. Upload de **inhoud** van de map `Kids4All2Learn` naar de hoofdmap van de repository (dus `index.html` op het hoogste niveau).
3. Ga naar Settings > Pages en kies `Deploy from a branch`, branch `main`, folder `/ (root)`.
4. De site verschijnt na publicatie op `https://GEBRUIKERSNAAM.github.io/Kids4All2Learn/`.

## Vertalingen
Nederlands en Engels zijn uitgewerkt. De andere 13 talen staan als losse voorbereidende JSON-bestanden klaar; nog niet vertaald. Bij ontbrekende vertalingen verschijnt de Nederlandse tekst. Voeg vertalingen per sleutel toe aan het overeenkomstige JSON-bestand. Arabisch schakelt de schrijfrichting automatisch om.

## Belangrijk
- Dit is een eerste werkende versie, geen definitieve kindveilige productie-app.
- De ouderpagina is nog **niet afgeschermd**. Een ouderpoort moet later worden ontworpen en getest.
- De app-manifest is aanwezig, maar volledige offline-installatie en distributie via appstores zijn nog niet ingericht.
- Er zijn nog geen professionele illustraties, animaties of extra spelletjes toegevoegd.
- Het kleurenspel heeft volledige kleurnamen voor NL, EN, ES, FR en DE; overige talen gebruiken voor kleurnamen voorlopig Engels.
- Browsertaal wordt gebruikt, niet de exacte locatie van de bezoeker. De gekozen taal wordt lokaal bewaard.
- Testen kan het betrouwbaarst via een lokale webserver of GitHub Pages, niet door `index.html` rechtstreeks als bestand te openen.
