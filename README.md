# Real-Time Web

## Concept
Ik wil een multiplayer 'Mastermind' applicatie maken waarin je het algemeen bekende spel Mastermind met twee spelers kan spelen vanaf verschillende devices.

Voor wie het spel Mastermind niet kent, hier de spelregels: <br />
http://www.spelregels-online.nl/spelregels/mastermind.pdf

#### Data
De data wordt door de spelers zelf gecreëerd door het spel te spelen. Zij vullen de kleuren in, waarna deze rechtstreeks naar de database worden geupload. Hierdoor kan de andere speler de wijzigingen zien en kan het spel later worden hervat.

### Werking
Mijn idee van hoe het zou kunnen werken: <br />

Met behulp van Meteor wil ik een user account system maken. Ingelogde spelers krijgen een lijst van alle geregistreerde spelers te zien. Wanneer zij op een speler klikken, wordt een game gestart. Beide spelers zien deze in hun game lijst staan. Wanneer zij op de game klikken, zien zij het spel op hun scherm en kunnen zij het spel spelen. Bij Mastermind zet je om de beurt een zet. Wanneer de ene speler bezig is, moet de interface van de andere speler dus geblokkeerd zijn. 

#### Features
- User account systeem
- Game rooms

#### Extra features
- Zoek online users
- Meerdere games
- Scoreboard/Highscore
- Drag/drop
- Award system
- Chatten met de tegenstander
- Meerdere users in één game
- Zet het aantal kleuren (difficulty)