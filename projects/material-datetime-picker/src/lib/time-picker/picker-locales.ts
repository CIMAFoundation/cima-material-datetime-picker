import type { MatDatepickerIntl } from '@angular/material/datepicker';
import { CIMA_TIME_LABELS, CimaTimeLabels } from './time-value';

export interface CimaPickerLabels extends CimaTimeLabels {
  cancel: string;
  confirm: string;
  rangeLabel: string;
  rangeStart: string;
  rangeEnd: string;
  invalidRange: string;
}

export type CimaCalendarLabels = Pick<MatDatepickerIntl,
  'calendarLabel' | 'openCalendarLabel' | 'closeCalendarLabel' | 'prevMonthLabel' | 'nextMonthLabel'
  | 'prevYearLabel' | 'nextYearLabel' | 'prevMultiYearLabel' | 'nextMultiYearLabel'
  | 'switchToMonthViewLabel' | 'switchToMultiYearViewLabel' | 'comparisonDateLabel'
  | 'startDateLabel' | 'endDateLabel' | 'formatYearRangeLabel'>;

export interface CimaPickerTranslation {
  labels: CimaPickerLabels;
  calendar: CimaCalendarLabels;
}

/** Included UI translations; date and time formatting remain the date adapter's responsibility. */
export const CIMA_PICKER_TRANSLATIONS: Readonly<Record<string, CimaPickerTranslation>> = {
  en: {
    labels: { ...CIMA_TIME_LABELS, cancel: 'Cancel', confirm: 'OK', rangeLabel: 'Date and time range',
      rangeStart: 'Start', rangeEnd: 'End', invalidRange: 'Choose a complete range with the end at or after the start, within the allowed limits.' },
    calendar: {
      startDateLabel: 'Start date', endDateLabel: 'End date',
      formatYearRangeLabel: (start, end) => `${start} to ${end}`,
      calendarLabel: 'Calendar', openCalendarLabel: 'Open calendar', closeCalendarLabel: 'Close calendar',
      prevMonthLabel: 'Previous month', nextMonthLabel: 'Next month', prevYearLabel: 'Previous year', nextYearLabel: 'Next year',
      prevMultiYearLabel: 'Previous years', nextMultiYearLabel: 'Next years', switchToMonthViewLabel: 'Choose month',
      switchToMultiYearViewLabel: 'Choose month and year', comparisonDateLabel: 'Comparison date',
    },
  },
  it: {
    labels: { selectTime: 'Seleziona ora', enterTime: 'Inserisci ora', hours: 'Ore', minutes: 'Minuti', seconds: 'Secondi',
      am: 'AM', pm: 'PM', period: 'Periodo del giorno', invalidTime: 'Inserisci un orario valido', unavailableTime: 'Questo orario non è disponibile',
      switchToInput: 'Usa tastiera', switchToClock: 'Usa quadrante', cancel: 'Annulla', confirm: 'OK',
      rangeLabel: 'Intervallo data e ora', rangeStart: 'Inizio', rangeEnd: 'Fine',
      invalidRange: 'Scegli un intervallo completo, con la fine non precedente all’inizio e nei limiti consentiti.' },
    calendar: {
      startDateLabel: 'Data iniziale', endDateLabel: 'Data finale',
      formatYearRangeLabel: (start, end) => `${start} a ${end}`,
      calendarLabel: 'Calendario', openCalendarLabel: 'Apri calendario', closeCalendarLabel: 'Chiudi calendario',
      prevMonthLabel: 'Mese precedente', nextMonthLabel: 'Mese successivo', prevYearLabel: 'Anno precedente', nextYearLabel: 'Anno successivo',
      prevMultiYearLabel: 'Anni precedenti', nextMultiYearLabel: 'Anni successivi', switchToMonthViewLabel: 'Scegli mese',
      switchToMultiYearViewLabel: 'Scegli mese e anno', comparisonDateLabel: 'Data di confronto',
    },
  },
  fr: {
    labels: { selectTime: 'Choisir une heure', enterTime: 'Saisir une heure', hours: 'Heures', minutes: 'Minutes', seconds: 'Secondes',
      am: 'AM', pm: 'PM', period: 'Période', invalidTime: 'Saisissez une heure valide', unavailableTime: 'Cette heure n’est pas disponible',
      switchToInput: 'Utiliser le clavier', switchToClock: 'Utiliser le cadran', cancel: 'Annuler', confirm: 'OK',
      rangeLabel: 'Intervalle de dates et heures', rangeStart: 'Début', rangeEnd: 'Fin',
      invalidRange: 'Choisissez un intervalle complet, dont la fin ne précède pas le début, dans les limites autorisées.' },
    calendar: {
      startDateLabel: 'Date de début', endDateLabel: 'Date de fin',
      formatYearRangeLabel: (start, end) => `${start} à ${end}`,
      calendarLabel: 'Calendrier', openCalendarLabel: 'Ouvrir le calendrier', closeCalendarLabel: 'Fermer le calendrier',
      prevMonthLabel: 'Mois précédent', nextMonthLabel: 'Mois suivant', prevYearLabel: 'Année précédente', nextYearLabel: 'Année suivante',
      prevMultiYearLabel: 'Années précédentes', nextMultiYearLabel: 'Années suivantes', switchToMonthViewLabel: 'Choisir le mois',
      switchToMultiYearViewLabel: 'Choisir le mois et l’année', comparisonDateLabel: 'Date de comparaison',
    },
  },
  de: {
    labels: { selectTime: 'Uhrzeit auswählen', enterTime: 'Uhrzeit eingeben', hours: 'Stunden', minutes: 'Minuten', seconds: 'Sekunden',
      am: 'AM', pm: 'PM', period: 'Tageszeit', invalidTime: 'Geben Sie eine gültige Uhrzeit ein', unavailableTime: 'Diese Uhrzeit ist nicht verfügbar',
      switchToInput: 'Tastatur verwenden', switchToClock: 'Zifferblatt verwenden', cancel: 'Abbrechen', confirm: 'OK',
      rangeLabel: 'Datums- und Zeitbereich', rangeStart: 'Beginn', rangeEnd: 'Ende',
      invalidRange: 'Wählen Sie einen vollständigen Zeitraum innerhalb der zulässigen Grenzen, dessen Ende nicht vor dem Beginn liegt.' },
    calendar: {
      startDateLabel: 'Startdatum', endDateLabel: 'Enddatum',
      formatYearRangeLabel: (start, end) => `${start} bis ${end}`,
      calendarLabel: 'Kalender', openCalendarLabel: 'Kalender öffnen', closeCalendarLabel: 'Kalender schließen',
      prevMonthLabel: 'Vorheriger Monat', nextMonthLabel: 'Nächster Monat', prevYearLabel: 'Vorheriges Jahr', nextYearLabel: 'Nächstes Jahr',
      prevMultiYearLabel: 'Vorherige Jahre', nextMultiYearLabel: 'Nächste Jahre', switchToMonthViewLabel: 'Monat auswählen',
      switchToMultiYearViewLabel: 'Monat und Jahr auswählen', comparisonDateLabel: 'Vergleichsdatum',
    },
  },
  es: {
    labels: { selectTime: 'Seleccionar hora', enterTime: 'Introducir hora', hours: 'Horas', minutes: 'Minutos', seconds: 'Segundos',
      am: 'a. m.', pm: 'p. m.', period: 'Período del día', invalidTime: 'Introduce una hora válida', unavailableTime: 'Esta hora no está disponible',
      switchToInput: 'Usar teclado', switchToClock: 'Usar reloj', cancel: 'Cancelar', confirm: 'Aceptar',
      rangeLabel: 'Intervalo de fechas y horas', rangeStart: 'Inicio', rangeEnd: 'Fin',
      invalidRange: 'Selecciona un intervalo completo dentro de los límites permitidos, con el final igual o posterior al inicio.' },
    calendar: {
      startDateLabel: 'Fecha de inicio', endDateLabel: 'Fecha de fin',
      formatYearRangeLabel: (start, end) => `${start} a ${end}`,
      calendarLabel: 'Calendario', openCalendarLabel: 'Abrir calendario', closeCalendarLabel: 'Cerrar calendario',
      prevMonthLabel: 'Mes anterior', nextMonthLabel: 'Mes siguiente', prevYearLabel: 'Año anterior', nextYearLabel: 'Año siguiente',
      prevMultiYearLabel: 'Años anteriores', nextMultiYearLabel: 'Años siguientes', switchToMonthViewLabel: 'Elegir mes',
      switchToMultiYearViewLabel: 'Elegir mes y año', comparisonDateLabel: 'Fecha de comparación',
    },
  },
};

/** Resolves an exact locale, then its language, then English, returning independent dictionaries. */
export function getCimaPickerTranslation(locale: string): CimaPickerTranslation {
  const normalized = locale.trim().replace(/_/g, '-').toLowerCase();
  const language = normalized.split('-')[0];
  const translations = CIMA_PICKER_TRANSLATIONS;
  const key = Object.hasOwn(translations, normalized) ? normalized : Object.hasOwn(translations, language) ? language : 'en';
  const translation = translations[key]!;
  return { labels: { ...translation.labels }, calendar: { ...translation.calendar } };
}
