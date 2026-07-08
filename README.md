# Globi Flow Frontend

Angular 21 frontend basis for the local Globi Flow lab-results assistant.

## Start

```powershell
npm install
npm start
```

## Pflichtdateien

- Angular workspace configuration
- SCSS design system structure
- Local font integration paths
- Material Symbols integration
- Strict robots exclusion
- PowerShell tree generator
- Project tools documentation


## Produktkern

Die App soll zwei Aufgaben klar trennen:

1. **Daten belastbar machen**: Befunde importieren, Werte erkennen, Einheiten und Referenzbereiche normalisieren, Confidence bewerten und unsichere Werte in eine ärztliche Prüfschleuse geben.
2. **Geprüfte Daten verständlich machen**: geprüfte Werte priorisieren, Verläufe und Referenzbereiche vergleichbar anzeigen und daraus einen patientenverständlichen Bericht erzeugen.

Der Hauptworkflow lautet: **Patienten → Importe → Prüfen → Analyse → Patientenbericht**. Die Wissensbasis ist kein Arbeitsschritt im Tagesworkflow, sondern ein Verwaltungsbereich für kontrollierte Erklärtexte, Quellen und Disclaimer.

## UX-Leitlinie

- `/importe` beantwortet: Welche Rohdaten wurden erkannt und wie sicher ist der Import?
- `/review` beantwortet: Welche erkannten Werte müssen korrigiert oder bestätigt werden?
- `/auswertung` beantwortet: Welche geprüften Daten sind auffällig, vergleichbar und im Verlauf relevant?
- `/berichte` beantwortet: Was darf dem Patienten verständlich und druckfertig gezeigt werden?


## Version

Die Basis nutzt Angular 21.2.x wie das Portfolio-Projekt.
