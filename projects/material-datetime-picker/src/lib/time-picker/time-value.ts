/** An hour of the day, independent of a date or timezone. Hours always use 0–23. */
export interface CimaTime {
  hours: number;
  minutes: number;
  seconds: number;
}

export type CimaHourDial = 'single-ring' | 'dual-ring';
export type CimaTimeView = 'input' | 'clock';
export type CimaTimeUnit = keyof CimaTime;
export type CimaTimeFilter = (time: CimaTime) => boolean;

export interface CimaTimeLabels {
  selectTime: string;
  enterTime: string;
  hours: string;
  minutes: string;
  seconds: string;
  am: string;
  pm: string;
  period: string;
  invalidTime: string;
  unavailableTime: string;
  switchToInput: string;
  switchToClock: string;
}

export const CIMA_TIME_LABELS: CimaTimeLabels = {
  selectTime: 'Select time', enterTime: 'Enter time',
  hours: 'Hour', minutes: 'Minute', seconds: 'Second',
  am: 'AM', pm: 'PM', period: 'Period', invalidTime: 'Enter a valid time', switchToInput: 'Use keyboard', switchToClock: 'Use clock',
  unavailableTime: 'This time is unavailable',
};

/** Checks the complete value without changing or rounding the caller's data. */
export function isValidTime(value: unknown): value is CimaTime {
  if (!value || typeof value !== 'object') return false;
  const time = value as CimaTime;
  return Number.isInteger(time.hours) && time.hours >= 0 && time.hours <= 23
    && Number.isInteger(time.minutes) && time.minutes >= 0 && time.minutes <= 59
    && Number.isInteger(time.seconds) && time.seconds >= 0 && time.seconds <= 59;
}
