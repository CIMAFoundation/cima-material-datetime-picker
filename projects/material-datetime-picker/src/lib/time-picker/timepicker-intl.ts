import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CIMA_TIME_LABELS, CimaTimeLabels } from './time-value';

/** Global labels; notify `changes` after replacing labels at runtime, as in MatDatepickerIntl. */
@Injectable({ providedIn: 'root' })
export class CimaTimepickerIntl implements CimaTimeLabels {
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
  cancel = 'Cancel';
}
