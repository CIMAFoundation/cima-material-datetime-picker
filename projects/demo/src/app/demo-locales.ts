import { CIMA_TIME_LABELS, CimaTimeLabels } from '@cima-foundation/material-datetime-picker';

export const DEMO_TIME_LABELS: Record<'it' | 'en', CimaTimeLabels> = {
  en: CIMA_TIME_LABELS,
  it: {
    selectTime: 'Seleziona ora', enterTime: 'Inserisci ora', hours: 'Ore', minutes: 'Minuti',
    seconds: 'Secondi', am: 'AM', pm: 'PM', period: 'Periodo del giorno', invalidTime: 'Inserisci un orario valido', unavailableTime: 'Questo orario non è disponibile',
    switchToInput: 'Usa tastiera', switchToClock: 'Usa quadrante',
  },
};

export const DEMO_CALENDAR_LABELS = {
  it: {
    calendarLabel: 'Calendario', openCalendarLabel: 'Apri calendario', closeCalendarLabel: 'Chiudi calendario',
    prevMonthLabel: 'Mese precedente', nextMonthLabel: 'Mese successivo',
    prevYearLabel: 'Anno precedente', nextYearLabel: 'Anno successivo',
    prevMultiYearLabel: 'Anni precedenti', nextMultiYearLabel: 'Anni successivi',
    switchToMonthViewLabel: 'Scegli mese', switchToMultiYearViewLabel: 'Scegli mese e anno',
    comparisonDateLabel: 'Data di confronto',
  },
  en: {
    calendarLabel: 'Calendar', openCalendarLabel: 'Open calendar', closeCalendarLabel: 'Close calendar',
    prevMonthLabel: 'Previous month', nextMonthLabel: 'Next month',
    prevYearLabel: 'Previous year', nextYearLabel: 'Next year',
    prevMultiYearLabel: 'Previous years', nextMultiYearLabel: 'Next years',
    switchToMonthViewLabel: 'Choose month', switchToMultiYearViewLabel: 'Choose month and year',
    comparisonDateLabel: 'Comparison date',
  },
};
