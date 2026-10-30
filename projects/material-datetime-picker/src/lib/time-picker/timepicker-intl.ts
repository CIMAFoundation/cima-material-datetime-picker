import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CIMA_TIME_LABELS } from './time-value';
import { CimaPickerLabels, getCimaPickerTranslation } from './picker-locales';

/** Global labels; notify `changes` after replacing labels at runtime, as in MatDatepickerIntl. */
@Injectable({ providedIn: 'root' })
export class CimaTimepickerIntl implements CimaPickerLabels {
  readonly changes = new Subject<void>();
  selectTime = CIMA_TIME_LABELS.selectTime;
  enterTime = CIMA_TIME_LABELS.enterTime;
  hours = CIMA_TIME_LABELS.hours;
  minutes = CIMA_TIME_LABELS.minutes;
  seconds = CIMA_TIME_LABELS.seconds;
  am = CIMA_TIME_LABELS.am;
  pm = CIMA_TIME_LABELS.pm;
  period = CIMA_TIME_LABELS.period;
  invalidTime = CIMA_TIME_LABELS.invalidTime;
  unavailableTime = CIMA_TIME_LABELS.unavailableTime;
  switchToInput = CIMA_TIME_LABELS.switchToInput;
  switchToClock = CIMA_TIME_LABELS.switchToClock;
  confirm = 'OK';
  rangeLabel = 'Date and time range';
  rangeStart = 'Start';
  rangeEnd = 'End';
  invalidRange = 'Choose a complete range with the end at or after the start, within the allowed limits.';
  private overrides: Partial<CimaPickerLabels> = {};

  /** Applies included translations and persistent application overrides without changing value formats. */
  setLocale(locale: string, overrides: Partial<CimaPickerLabels> = {}): void {
    this.overrides = { ...this.overrides, ...overrides };
    Object.assign(this, getCimaPickerTranslation(locale).labels, this.overrides);
    this.changes.next();
  }

  cancel = 'Cancel';
}
