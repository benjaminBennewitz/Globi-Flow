/* src/app/pages/analyse-page/analyse-page-logik.ts */

/**
 * @file Reine Fach-, Filter- und Formatierungslogik der Analyseansicht.
 * @module AnalysePageLogik
 */

import { AuswertungGruppe, AuswertungKennzahl, AuswertungLaborwert, AuswertungTrend, AuswertungViewModel } from '../../core/models/auswertung.model';
import { LaborwertPrioritaet, LaborwertStatus } from '../../core/models/laborwert.model';

/** Unterstützte Statuswerte der Analysefilter. */
export type AuswertungStatusFilter = LaborwertStatus | 'alle';

export const MAX_AKTIVE_OVERLAY_WERTE = 64;       // Maximale Anzahl gleichzeitig sichtbarer Overlay-Linien.
export const TRENDWECHSEL_SCHWELLE_PROZENT = 10;  // Mindeständerung für einen relevanten Trendwechsel.

/** Deutsche Anzeigenamen der Laborwertstatus. */
const STATUS_LABELS: Record<LaborwertStatus, string> = { normal: 'Normal', hoch: 'Erhöht', niedrig: 'Niedrig', review: 'Review' };
/** Deutsche Anzeigenamen der Trendrichtungen. */
const TREND_LABELS: Record<AuswertungTrend, string> = { steigend: 'steigend', fallend: 'fallend', stabil: 'stabil' };

/**
 * Prüft, ob die Auswertung einen verwendbaren Vergleichsbefund enthält.
 *
 * @param ansicht - Vollständiges ViewModel der aktiven Auswertung.
 * @returns `true`, wenn ein Vergleichsbefund verwendet werden kann.
 */
export function hatVergleich(ansicht: AuswertungViewModel): boolean {
  return Boolean(ansicht.hatVergleich && ansicht.vergleichsBefund);
}

/**
 * Prüft, ob für einen einzelnen Laborwert ein echter Vergleich verfügbar ist.
 *
 * @param wert - Zu verarbeitender Laborwert oder Zahlenwert.
 * @param ansicht - Vollständiges ViewModel der aktiven Auswertung.
 * @returns `true`, wenn der Laborwert am Befundvergleich teilnimmt.
 */
export function hatWertVergleich(wert: AuswertungLaborwert, ansicht: AuswertungViewModel): boolean {
  return hatVergleich(ansicht) && wert.hatVergleich !== false;
}

/**
 * Liefert die Bezeichnung des Vergleichsbefunds für die Benutzeroberfläche.
 *
 * @param ansicht - Vollständiges ViewModel der aktiven Auswertung.
 * @returns Bezeichnung des Vergleichsbefunds oder Fallback-Text.
 */
export function vergleichsBefundLabel(ansicht: AuswertungViewModel): string {
  return hatVergleich(ansicht) ? ansicht.vergleichsBefund : 'Kein Vorbefund';
}

/**
 * Formatiert die prozentuale Veränderung eines Laborwerts.
 *
 * @param wert - Zu verarbeitender Laborwert oder Zahlenwert.
 * @param ansicht - Vollständiges ViewModel der aktiven Auswertung.
 * @returns Formatierte Prozentänderung oder Hinweis auf fehlenden Verlauf.
 */
export function trendDeltaText(wert: AuswertungLaborwert, ansicht: AuswertungViewModel): string {
  return hatWertVergleich(wert, ansicht) ? `${delta(wert.veraenderungProzent)}%` : 'kein Verlauf';
}

/**
 * Formatiert den vorherigen Messwert oder einen Hinweis auf den fehlenden Vorbefund.
 *
 * @param wert - Zu verarbeitender Laborwert oder Zahlenwert.
 * @param ansicht - Vollständiges ViewModel der aktiven Auswertung.
 * @returns Formatierter vorheriger Messwert oder Fallback-Text.
 */
export function vorherigerWertText(wert: AuswertungLaborwert, ansicht: AuswertungViewModel): string {
  return hatWertVergleich(wert, ansicht) ? messwert(wert.vorherigerWert, wert.einheit) : 'Kein Vorbefund';
}

/**
 * Erzeugt eine kompakte Darstellung aus absoluter und prozentualer Veränderung.
 *
 * @param wert - Zu verarbeitender Laborwert oder Zahlenwert.
 * @param ansicht - Vollständiges ViewModel der aktiven Auswertung.
 * @returns Kompakte Änderungsangabe für die Benutzeroberfläche.
 */
export function aenderungKurzText(wert: AuswertungLaborwert, ansicht: AuswertungViewModel): string {
  return hatWertVergleich(wert, ansicht) ? `${delta(wert.veraenderungAbsolut, wert.einheit)} · ${delta(wert.veraenderungProzent)}%` : 'kein Verlauf';
}

/**
 * Erzeugt die fachliche Kurzbeschreibung des aktiven Befundvergleichs.
 *
 * @param ansicht - Vollständiges ViewModel der aktiven Auswertung.
 * @returns Erklärungstext zum Vergleichskontext.
 */
export function vergleichBeschreibung(ansicht: AuswertungViewModel): string {
  return hatVergleich(ansicht) ? `Aktueller Befund gegen ${ansicht.vergleichsBefund} mit absoluter und prozentualer Veränderung.` : 'Noch kein echter Vorbefund für diesen Patienten vorhanden.';
}

/**
 * Berechnet die zusammenfassenden Kennzahlen der Analyseansicht.
 *
 * @param ansicht - Vollständiges ViewModel der aktiven Auswertung.
 * @returns Liste der berechneten Kennzahlenkarten.
 */
export function kennzahlen(ansicht: AuswertungViewModel): AuswertungKennzahl[] {
  const auffaellig = auffaelligeWerte(ansicht).length;
  const stark = ansicht.werte.filter((wert) => wert.prioritaet === 'hoch').length;
  const review = reviewAnzahl(ansicht);
  const trend = hatVergleich(ansicht) ? relevanteTendenzen(ansicht).length : 0;
  const trendHinweis = hatVergleich(ansicht) ? `≥ ${TRENDWECHSEL_SCHWELLE_PROZENT}% zum Vergleich` : 'kein Vorbefund';
  const trendBeschreibung = hatVergleich(ansicht) ? `Aktueller Befund verglichen mit ${ansicht.vergleichsBefund}. Gezählt werden Werte ab ±${TRENDWECHSEL_SCHWELLE_PROZENT}% Veränderung.` : 'Für den aktiven Patienten gibt es im ausgewählten Kontext keinen vorherigen Befund. Trendwechsel werden deshalb nicht gezählt.';

  return [
    { label: 'Laborwerte', wert: ansicht.werte.length, hinweis: 'aktueller Befund', beschreibung: 'Alle normalisierten Werte des ausgewählten Befunds, die fachlich ausgewertet werden können.', icon: 'science', status: 'info' },
    { label: 'Auffällig', wert: auffaellig, hinweis: 'außer Referenz', beschreibung: 'Werte mit Status erhöht oder niedrig. Grundlage ist der erkannte Referenzbereich des aktuellen Befunds.', icon: 'priority_high', status: 'warning' },
    { label: 'Stark auffällig', wert: stark, hinweis: 'hoch priorisiert', beschreibung: 'Werte mit hoher Priorität. Diese Priorität kommt aus den Backend-Regeln und berücksichtigt Abweichung, Status und Prüfbedarf.', icon: 'emergency_home', status: 'danger' },
    { label: 'Review offen', wert: review, hinweis: 'ärztlich prüfen', beschreibung: 'Werte mit offenem Review-Status. Sie sollten vor Freigabe und Patientenbericht geprüft werden.', icon: 'fact_check', status: 'review' },
    { label: 'Trendwechsel', wert: trend, hinweis: trendHinweis, beschreibung: trendBeschreibung, icon: 'trending_up', status: 'success' }
  ];
}

/**
 * Filtert alle erhöhten und niedrigen Laborwerte der Auswertung.
 *
 * @param ansicht - Vollständiges ViewModel der aktiven Auswertung.
 * @returns Liste auffälliger Laborwerte.
 */
export function auffaelligeWerte(ansicht: AuswertungViewModel): AuswertungLaborwert[] {
  return ansicht.werte.filter((wert) => wert.status === 'hoch' || wert.status === 'niedrig');
}

/**
 * Sortiert Laborwerte nach fachlicher Relevanz und Prüfbedarf.
 *
 * @param ansicht - Vollständiges ViewModel der aktiven Auswertung.
 * @returns Nach Relevanz sortierte Kopie der Laborwerte.
 */
export function topWerte(ansicht: AuswertungViewModel): AuswertungLaborwert[] {
  return [...ansicht.werte].sort((a, b) => sortierwert(b) - sortierwert(a));
}

/**
 * Ermittelt Laborwerte mit einer relevanten Veränderung zum Vergleichsbefund.
 *
 * @param ansicht - Vollständiges ViewModel der aktiven Auswertung.
 * @returns Nach Änderungsstärke sortierte Trendwerte.
 */
export function relevanteTendenzen(ansicht: AuswertungViewModel): AuswertungLaborwert[] {
  if (!hatVergleich(ansicht)) {
    return [];
  }

  return topWerte(ansicht).filter((wert) => hatWertVergleich(wert, ansicht) && Math.abs(wert.veraenderungProzent) >= TRENDWECHSEL_SCHWELLE_PROZENT).sort((a, b) => Math.abs(b.veraenderungProzent) - Math.abs(a.veraenderungProzent));
}

/**
 * Beschreibt die verwendete Methodik der Trendbewertung.
 *
 * @param ansicht - Vollständiges ViewModel der aktiven Auswertung.
 * @returns Methodiktext für die Trendanzeige.
 */
export function trendMethodik(ansicht: AuswertungViewModel): string {
  return hatVergleich(ansicht) ? `Verglichen wird der aktuelle Befund mit ${ansicht.vergleichsBefund}. Relevant ist eine Veränderung ab ±${TRENDWECHSEL_SCHWELLE_PROZENT}%.` : 'Für diese Testperson liegt im ausgewählten Kontext kein vorheriger Befund vor. Sobald ein zweiter Befund vorhanden ist, werden echte Veränderungen angezeigt.';
}

/**
 * Beschreibt die verwendete Methodik der Referenzbereichsbewertung.
 *
 * @returns Methodiktext für die Referenzbewertung.
 */
export function referenzMethodik(): string {
  return 'Jeder Wert wird gegen seinen eigenen Referenzbereich normalisiert. Der Status normal, erhöht oder niedrig kommt aus der Backend-Auswertung und dem erkannten Referenzbereich.';
}

/**
 * Erzeugt den Erklärungstext für das Detaildiagramm eines Laborwerts.
 *
 * @param wert - Zu verarbeitender Laborwert oder Zahlenwert.
 * @param ansicht - Vollständiges ViewModel der aktiven Auswertung.
 * @returns Kontextabhängige Diagrammbeschreibung.
 */
export function detailChartBeschreibung(wert: AuswertungLaborwert, ansicht: AuswertungViewModel): string {
  return hatWertVergleich(wert, ansicht) ? 'Zeitentwicklung dieses Laborwerts über die vorhandenen Befunde. Das grüne Band zeigt den Referenzbereich dieses Werts.' : 'Für diesen Laborwert liegt aktuell nur ein Befundpunkt vor. Sobald weitere Befunde vorhanden sind, entsteht hier eine echte Zeitentwicklung.';
}

/**
 * Erzeugt die CSS-Modifikatorklasse eines Laborwertstatus.
 *
 * @param status - Zu prüfender Laborwertstatus.
 * @returns CSS-Klasse im Format `is-<status>`.
 */
export function statusKlasse(status: LaborwertStatus): string {
  return `is-${status}`;
}

/**
 * Erzeugt die CSS-Modifikatorklasse eines Trendstatus.
 *
 * @param trend - Zu verarbeitende Trendrichtung.
 * @returns CSS-Klasse im Format `is-<trend>`.
 */
export function trendKlasse(trend: AuswertungTrend): string {
  return `is-${trend}`;
}

/**
 * Formatiert einen Messwert mit Einheit.
 *
 * @param wert - Zu verarbeitender Laborwert oder Zahlenwert.
 * @param einheit - Optionale oder verpflichtende Einheit des Messwerts.
 * @returns Formatierter Messwert mit Einheit.
 */
export function messwert(wert: number, einheit: string): string {
  return `${zahl(wert)} ${einheit}`;
}

/**
 * Formatiert eine absolute oder prozentuale Veränderung mit Vorzeichen.
 *
 * @param wert - Zu verarbeitender Laborwert oder Zahlenwert.
 * @param einheit - Optionale oder verpflichtende Einheit des Messwerts.
 * @returns Formatierte Veränderung mit optionaler Einheit.
 */
export function delta(wert: number, einheit = ''): string {
  return `${wert > 0 ? '+' : ''}${zahl(wert)}${einheit ? ` ${einheit}` : ''}`;
}

/**
 * Berechnet den Qualitätswert der aufbereiteten Auswertung.
 *
 * @param ansicht - Vollständiges ViewModel der aktiven Auswertung.
 * @returns Ganzzahliger Score zwischen 0 und 100.
 */
export function aufbereitungsScore(ansicht: AuswertungViewModel): number {
  const durchschnitt = ansicht.werte.reduce((summe, wert) => summe + wert.confidence, 0) / Math.max(ansicht.werte.length, 1);
  return Math.max(0, Math.min(100, Math.round(durchschnitt - reviewAnzahl(ansicht) * 4)));
}

/**
 * Erzeugt den CSS-Verlauf für die kreisförmige Score-Anzeige.
 *
 * @param ansicht - Vollständiges ViewModel der aktiven Auswertung.
 * @returns Gültiger CSS-Wert für `conic-gradient`.
 */
export function scoreGradient(ansicht: AuswertungViewModel): string {
  return `conic-gradient(var(--gf-color-primary) ${aufbereitungsScore(ansicht) * 3.6}deg, var(--gf-color-bg) 0deg)`;
}

/**
 * Erzeugt den CSS-Verlauf für die Statusverteilung aller Laborwerte.
 *
 * @param ansicht - Vollständiges ViewModel der aktiven Auswertung.
 * @returns Gültiger CSS-Wert für `conic-gradient`.
 */
export function verteilungsGradient(ansicht: AuswertungViewModel): string {
  const gesamt = Math.max(ansicht.werte.length, 1);
  const normalEnde = statusAnzahl(ansicht, 'normal') / gesamt * 100;
  const auffaelligEnde = normalEnde + (statusAnzahl(ansicht, 'hoch') + statusAnzahl(ansicht, 'niedrig')) / gesamt * 100;
  const reviewEnde = auffaelligEnde + statusAnzahl(ansicht, 'review') / gesamt * 100;
  return `conic-gradient(var(--gf-color-success) 0 ${normalEnde}%, var(--gf-color-danger) ${normalEnde}% ${auffaelligEnde}%, var(--gf-color-warning) ${auffaelligEnde}% ${reviewEnde}%, var(--gf-color-outline) ${reviewEnde}% 100%)`;
}

/**
 * Zählt Laborwerte mit einem bestimmten fachlichen Status.
 *
 * @param ansicht - Vollständiges ViewModel der aktiven Auswertung.
 * @param status - Zu prüfender Laborwertstatus.
 * @returns Anzahl passender Laborwerte.
 */
export function statusAnzahl(ansicht: AuswertungViewModel, status: LaborwertStatus): number {
  return ansicht.werte.filter((wert) => wert.status === status).length;
}

/**
 * Zählt Laborwerte mit offenem ärztlichem Review.
 *
 * @param ansicht - Vollständiges ViewModel der aktiven Auswertung.
 * @returns Anzahl offener Review-Werte.
 */
export function reviewAnzahl(ansicht: AuswertungViewModel): number {
  return ansicht.werte.filter((wert) => wert.reviewStatus === 'review').length;
}

/**
 * Zählt alle relevanten Trendveränderungen.
 *
 * @param ansicht - Vollständiges ViewModel der aktiven Auswertung.
 * @returns Anzahl relevanter Trends.
 */
export function trendAnzahl(ansicht: AuswertungViewModel): number {
  return relevanteTendenzen(ansicht).length;
}

/**
 * Liefert das Material-Symbol für eine Trendrichtung.
 *
 * @param trend - Zu verarbeitende Trendrichtung.
 * @returns Name des passenden Material-Symbols.
 */
export function trendIcon(trend: AuswertungTrend): string {
  return trend === 'steigend' ? 'arrow_upward' : trend === 'fallend' ? 'arrow_downward' : 'trending_flat';
}

/**
 * Bestimmt die nächste Zielroute im Analyseworkflow.
 *
 * @param ansicht - Vollständiges ViewModel der aktiven Auswertung.
 * @returns Route zum Review oder zur Berichtserstellung.
 */
export function analyseZielRoute(ansicht: AuswertungViewModel): string {
  return reviewAnzahl(ansicht) > 0 ? '/review' : '/berichte';
}

/**
 * Bestimmt die Beschriftung des nächsten fachlichen Arbeitsschritts.
 *
 * @param ansicht - Vollständiges ViewModel der aktiven Auswertung.
 * @returns Beschriftung der nächsten Workflow-Aktion.
 */
export function naechsterAnalyseSchritt(ansicht: AuswertungViewModel): string {
  if (reviewAnzahl(ansicht) > 0) {
    return 'Review abschließen';
  }

  return statusAnzahl(ansicht, 'hoch') + statusAnzahl(ansicht, 'niedrig') > 0 ? 'Patientenbericht vorbereiten' : 'Bericht freigeben';
}

/**
 * Erzeugt einen kontextabhängigen Hinweis zum aktuellen Analysefokus.
 *
 * @param ansicht - Vollständiges ViewModel der aktiven Auswertung.
 * @returns Erklärungstext für den aktuellen Analysezustand.
 */
export function analyseFokusText(ansicht: AuswertungViewModel): string {
  const review = reviewAnzahl(ansicht);
  const auffaellig = statusAnzahl(ansicht, 'hoch') + statusAnzahl(ansicht, 'niedrig');

  if (review > 0) {
    return `${review} Wert(e) sind noch nicht sicher genug für Bericht und Verlauf. Diese Werte bleiben sichtbar, sollten aber zuerst geprüft werden.`;
  }

  return auffaellig > 0 ? `${auffaellig} auffällige Wert(e) sind geprüft und können mit Verlauf, Referenzfeld und Patiententext in den Bericht übernommen werden.` : 'Alle sichtbaren Werte sind geprüft und unauffällig. Der Bericht kann als verständliche Zusammenfassung vorbereitet werden.';
}

/**
 * Übersetzt einen Laborwertstatus in eine deutsche Anzeige.
 *
 * @param status - Zu prüfender Laborwertstatus.
 * @returns Deutsche Statusbezeichnung.
 */
export function statusLabel(status: LaborwertStatus): string {
  return STATUS_LABELS[status];
}

/**
 * Übersetzt eine Trendrichtung in eine deutsche Anzeige.
 *
 * @param trend - Zu verarbeitende Trendrichtung.
 * @returns Deutsche Trendbezeichnung.
 */
export function trendLabel(trend: AuswertungTrend): string {
  return TREND_LABELS[trend];
}

/**
 * Berechnet die Gesamtzahl aller Werte einer Laborwertgruppe.
 *
 * @param gruppe - Auswertungsgruppe mit Statussummen.
 * @returns Gesamtzahl, mindestens eins zur sicheren Prozentberechnung.
 */
export function gruppenGesamt(gruppe: AuswertungGruppe): number {
  return Math.max(gruppe.normal + gruppe.niedrig + gruppe.hoch + gruppe.review, 1);
}

/**
 * Berechnet den prozentualen Anteil eines Gruppenstatus.
 *
 * @param wert - Zu verarbeitender Laborwert oder Zahlenwert.
 * @param gruppe - Auswertungsgruppe mit Statussummen.
 * @returns Prozentwert als CSS-String.
 */
export function gruppenBreite(wert: number, gruppe: AuswertungGruppe): string {
  return `${Math.round((wert / gruppenGesamt(gruppe)) * 100)}%`;
}

/**
 * Berechnet den fachlichen Sortierwert eines Laborwerts.
 *
 * @param wert - Zu verarbeitender Laborwert oder Zahlenwert.
 * @returns Numerischer Wert für absteigende Priorisierung.
 */
export function sortierwert(wert: AuswertungLaborwert): number {
  return prioritaetGewicht(wert.prioritaet) + Math.abs(wert.abweichungProzent) + (wert.reviewStatus === 'review' ? 30 : 0) + Math.abs(wert.veraenderungProzent);
}

/**
 * Übersetzt die fachliche Priorität in ein numerisches Sortiergewicht.
 *
 * @param prioritaet - Fachliche Priorität des Laborwerts.
 * @returns Numerisches Prioritätsgewicht.
 */
function prioritaetGewicht(prioritaet: LaborwertPrioritaet): number {
  return prioritaet === 'hoch' ? 200 : prioritaet === 'mittel' ? 100 : 0;
}

/**
 * Formatiert eine Zahl mit deutschem Dezimaltrennzeichen.
 *
 * @param wert - Zu verarbeitender Laborwert oder Zahlenwert.
 * @returns Deutsch formatierte Zahl.
 */
function zahl(wert: number): string {
  return Number.isInteger(wert) ? `${wert}` : wert.toFixed(1).replace('.', ',');
}
