# IU Smart-Meter-Gateway Anwendung

Die Anwendung besteht aus zwei Docker Containern.
Ein Container für die Datenbank und ein Container für das Frontend und Backend (Middleware).

Die Anwendung kann über die Docker Compose Datei aufgebaut werden.
Hierfür muss Docker auf dem eigenen Computer installiert sein.

Der Aufbau der Anwendung erfolgt über folgenden Befehl:
```bash
  docker compose up
```

Die Anwendung ist dann unter `localhost` auf dem eigenen Computer zu erreichen.
Der Browser wird eine Warnung für das selbstsignierte Zertifikat geben - hier sollte etwas wie "Dennoch besuchen" oä. gewählt werden.

Zum Anmelden können folgende Daten verwendet werden:
- Endbenutzer1: kunde1 und password123
- Endbenutzer2: kunde2 und password456
- Messtellenbetreiber: betreiber1 und adminpassword
