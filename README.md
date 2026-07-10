<div align="center">
  <img src="src/assets/img/globiflow-logo.webp" alt="Globi Flow Logo" width="118" />

  <h1>Globi Flow</h1>

  <p><strong>Lokales Laborwerte-Assistenzsystem für Import, ärztliche Prüfung und verständliche Patientenberichte.</strong></p>

  <p>
    <a href="https://github.com/benjaminBennewitz/Globi-Flow.git">Frontend-Repository</a>
    ·
    <a href="https://github.com/benjaminBennewitz/Globi-Flow-BE.git">Zugehöriges Backend</a>
  </p>

  <br>

  <img alt="Angular 21.2" src="docs/readme/badge-angular.svg" width="170">
  <img alt="Local First" src="docs/readme/badge-local.svg" width="170">
  <img alt="Medical Review" src="docs/readme/badge-review.svg" width="170">
</div>

---

## Projektstatus

Globi Flow ist ein nicht-kommerzielles Demo-, Portfolio- und Lernprojekt. Ein Schwerpunkt liegt auf der Umsetzung eines konsistenten Neomorphism-Designsystems sowie auf der technischen Erprobung lokaler Dokumenten- und OCR-Workflows. Die Anwendung verarbeitet ausschließlich künstliche Testdaten. Sie ist weder ein Medizinprodukt noch für den produktiven Einsatz mit echten Patienten- oder Gesundheitsdaten freigegeben.

Das Frontend gehört zum separaten Django-Backend:

- Frontend: `https://github.com/benjaminBennewitz/Globi-Flow.git`
- Backend: `https://github.com/benjaminBennewitz/Globi-Flow-BE.git`

## Ziel der Anwendung

Globi Flow bildet einen vollständigen lokalen Workflow vom Laborbefund bis zum verständlichen Patientenbericht ab. Die Anwendung soll Laborwerte strukturiert importieren, normalisieren, vergleichbar machen und für eine ärztliche Kontrolle vorbereiten.

Die App verfolgt vier zentrale Ziele:

1. **Import vereinfachen:** Testdaten-PDFs hochladen, lokale Analysen starten und den Verarbeitungsstatus nachvollziehen.
2. **Fehler sichtbar machen:** Unsichere Erkennungen über Confidence Scores und Review-Einträge priorisieren.
3. **Ärztliche Prüfung unterstützen:** Erkannte Werte, Einheiten und Referenzbereiche kontrollieren, korrigieren und freigeben.
4. **Patienten verständlich informieren:** Freigegebene Ergebnisse in einer klaren HTML- und Print-Ansicht erklären.

Die Anwendung stellt keine Diagnosen. Medizinische Bewertung, Freigabe und Behandlungsempfehlungen bleiben ausschließlich qualifiziertem Fachpersonal vorbehalten.

## Funktionsübersicht

| Bereich | Enthaltene Funktionen |
|---|---|
| Start und Übersicht | Praxis-Kennzahlen, Aufgaben, Aktivitätsübersicht, Verläufe und Schnellzugriffe |
| Testpersonen | Testpersonenverwaltung, aktiver Arbeitskontext, Befundauswahl und Stammdaten |
| Import | PDF-Upload, Demo-Import, manuelle Eingabe, Dateiprüfung, Fortschritt und Importstatus |
| Lokale Analyse | PDF-Textanalyse, vorbereitete OCR-Pipeline, Normalisierung und Confidence Score |
| Review | Prüfung unsicherer Werte, Originaltext-Vergleich, Korrektur und Statusverwaltung |
| Auswertung | Wertegruppen, Referenzbereiche, Prioritäten, Trends und Vergleichsansichten |
| Wissensbasis | Kontrollierte Erklärtexte, Quellen, Versionen und Freigabestatus |
| Patientenbericht | Verständliche Berichtsvorschau, Arztfragen, Disclaimer und Print-Layout |
| Sicherheit | Eingabesäuberung, Upload-Prüfungen, getrennte API-Kommunikation und lokale Verarbeitung |
| Bedienbarkeit | Responsive Darstellung, Tastaturfokus, Statusfarben, Toasts und kleine Viewports |
| Internationalisierung | Berichtsspezifische Übersetzung über kontrollierte Backend-Templates |

## Architektur

```text
Angular-Frontend
      ↓ REST API
Django REST Framework
      ↓
PostgreSQL
      ↓
Celery + Redis
      ↓
Lokale PDF- und OCR-Verarbeitung
```

Das Frontend übernimmt Darstellung, Benutzerführung, Review-Interaktionen und Berichtsvorschau. Fachliche Verarbeitung, kontrollierte Berichtstexte, Übersetzungen und persistente Daten liegen im Backend. Die Übersetzung berichtsspezifischer Inhalte erfolgt über die eigene lokale API und nicht über externe Übersetzungs- oder KI-Dienste.


## Lern- und Case-Study-Schwerpunkte

Globi Flow dient als technische Case Study für einen vollständig lokal kontrollierten Analyse- und Reviewprozess. Im Mittelpunkt stehen dabei:

- die Entwicklung eines responsiven Neomorphism-Designsystems mit wiederverwendbaren Angular-Komponenten,
- die strukturierte Kommunikation zwischen Angular-Frontend und eigener lokaler Django-REST-API,
- die lokale Übersetzung kontrollierter Berichtsinhalte über das eigene Backend,
- die Extraktion von Textschichten und Seiteninhalten aus PDF-Dateien mit Poppler-basierten Werkzeugen,
- die lokale OCR-Verarbeitung bildbasierter Testbefunde mit Tesseract,
- die Normalisierung erkannter Laborwerte, Einheiten und Referenzbereiche,
- die transparente Darstellung von Confidence Scores und manuellen Reviewzuständen.

Die genannten Technologien und Abläufe werden ausschließlich zu Lern-, Demonstrations- und Portfoliozwecken eingesetzt. Ihre Erwähnung stellt weder eine Zertifizierung noch eine Zusicherung für Sicherheit, Erkennungsqualität, medizinische Richtigkeit oder Eignung für einen produktiven Einsatz dar.

## Workflow

```text
Testdaten-PDF / Demo
        ↓
Lokaler Importjob
        ↓
PDF-Textanalyse oder lokale OCR
        ↓
Normalisierung von Wert, Einheit und Referenzbereich
        ↓
Confidence Score + Review Queue
        ↓
Ärztliche Prüfung und Freigabe
        ↓
Dashboard, Verlauf und Patientenbericht
```

## Aktuelle Frontend-Routen

| Route | Zweck |
|---|---|
| `/uebersicht` | Praxisübersicht mit Kennzahlen, Verlauf und Aufgaben |
| `/patienten` | Testpersonen, aktiver Patient und Befundkontext |
| `/importe` | Upload, Demo-Import, Importstatus und Fortschritt |
| `/review` | Prüfschleuse für unsichere Laborwerte |
| `/auswertung` | Analyseansicht mit Gruppen, Trends und Auffälligkeiten |
| `/wissensbasis` | Pflege kontrollierter Erklärtexte und Quellen |
| `/berichte` | Patientengerechte HTML-/Print-Vorschau |

## Designsystem

Die Oberfläche nutzt ein helles, gebrochenes Soft-UI-System mit medizinischem Blau, warmem Akzent und klaren Statusfarben. Wiederverwendbare Design-Tokens steuern Farben, Abstände, Radien, Schatten und Animationen.

![Globi Flow Farbpalette](docs/readme/globi-flow-palette.svg)

## Preview

| Übersicht | Review | Patientenbericht |
|---|---|---|
| ![Globi Flow Übersicht](docs/readme/globi-flow-overview.webp) | ![Globi Flow Review](docs/readme/globi-flow-review.webp) | ![Globi Flow Patientenbericht](docs/readme/globi-flow-report.webp) |

## Technischer Stand

- Angular `21.2.x`
- TypeScript `5.9.x`
- SCSS/Sass `1.93.x`
- RxJS `7.8.x`
- Vitest `4.1.x`
- Django REST Framework als separates Backend
- PostgreSQL, Redis und Celery im Backend-Stack
- Poppler-basierte lokale PDF-Verarbeitung
- Tesseract für lokale OCR-Testworkflows

## Lokale Entwicklung

### Voraussetzungen

- Node.js in einer mit Angular 21 kompatiblen Version
- npm
- Lokal gestartetes Globi-Flow-Backend für echte API-Aufrufe

### Installation und Start

```powershell
npm install
npm start
```

Die lokale Entwicklung läuft standardmäßig auf `http://localhost:4300`. API-Aufrufe werden über `proxy.conf.json` an das lokale Backend weitergeleitet.

### Tests und Build

```powershell
npm test
npm run build:prod
```

Der Production-Build wird nach `dist/globi-flow` geschrieben.

## Projektstruktur

```text
src/app/core        Modelle, API-Endpunkte, Services und Security-Utilities
src/app/features    Wiederverwendbare fachliche Feature-Komponenten
src/app/pages       Routen-Komponenten und Seitenlogik
src/app/shared      Navigation, Suche, Toasts und UI-Bausteine
src/styles          Globale Tokens, Basis, Utilities und Animationen
src/assets          Logo, Favicon, Fonts und künstliche Testdaten
```

## Datenschutz und fachliche Grenzen

- Es dürfen ausschließlich künstliche, anonymisierte Testdaten verwendet werden.
- Echte Patienten-, Gesundheits- oder Identifikationsdaten sind nicht zulässig.
- Die App stellt keine Diagnosen und ersetzt keine ärztliche Beratung.
- Alle medizinischen Inhalte müssen kontrolliert, versioniert und freigegeben werden.
- Externe Cloud-OCR, externe Analyse-APIs und Laufzeit-KI sind nicht Bestandteil des vorgesehenen Workflows.
- Die Sicherheit wurde nicht für einen produktiven medizinischen Betrieb zertifiziert oder garantiert.

## Lizenz und Nutzung

Copyright © B² Benjamin Bennewitz. Alle Rechte vorbehalten.

Dieses Repository ist ausschließlich als persönliches Demo-, Portfolio- und Lernprojekt veröffentlicht. Ohne vorherige ausdrückliche schriftliche Genehmigung sind insbesondere folgende Nutzungen untersagt:

- kommerzielle oder produktive Nutzung,
- Vervielfältigung und Weiterverbreitung,
- Verkauf, Unterlizenzierung oder entgeltliche Bereitstellung,
- Veröffentlichung abgeleiteter Projekte,
- Bearbeitung, Veränderung oder Weiterentwicklung für eigene oder fremde Produkte,
- Nutzung mit echten Patienten- oder Gesundheitsdaten.

Der Quellcode wird ohne Zusicherungen oder Garantien bereitgestellt. Es besteht insbesondere keine Garantie für Fehlerfreiheit, Sicherheit, Verfügbarkeit, medizinische Richtigkeit oder Eignung für einen bestimmten Zweck. Verbindliche Details stehen in der Datei [LICENSE.md](LICENSE.md).

## Kennzeichnungen

- Angular-Projektname: `globi-flow`
- Angular-Selector-Prefix: `gf`
- CSS-/SCSS-Token-Prefix: `gf`
- Frontend-Repository: `https://github.com/benjaminBennewitz/Globi-Flow.git`
- Backend-Repository: `https://github.com/benjaminBennewitz/Globi-Flow-BE.git`

## Version

Aktueller Frontend-Stand: Angular `21.2.x`
