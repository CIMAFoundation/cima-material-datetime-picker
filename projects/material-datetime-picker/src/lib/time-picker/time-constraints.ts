import { ValidationErrors } from '@angular/forms';
import { CimaTime, CimaTimeFilter, isValidTime } from './time-value';

export interface CimaTimeConstraints {
  minTime?: CimaTime | null;
  maxTime?: CimaTime | null;
  timeFilter?: CimaTimeFilter | null;
}

/** Compares recurring times at second precision, independently of dates and timezones. */
function seconds(time: CimaTime): number {
  return time.hours * 3600 + time.minutes * 60 + time.seconds;
}

/** Validates inclusive daily/overnight bounds without rounding or replacing the original value. */
export function validateTime(value: unknown, limits: CimaTimeConstraints): ValidationErrors | null {
  const { minTime, maxTime, timeFilter } = limits;
  if ((minTime != null && !isValidTime(minTime)) || (maxTime != null && !isValidTime(maxTime))
    || (timeFilter != null && typeof timeFilter !== 'function')) {
    return { invalidTimeConstraints: true };
  }
  if (value == null) return null;
  if (!isValidTime(value)) return { invalidTime: true };
  const actual = seconds(value);
  const min = minTime ? seconds(minTime) : null;
  const max = maxTime ? seconds(maxTime) : null;
  const errors: ValidationErrors = {};
  if (min != null && max != null && min > max) {
    if (actual < min && actual > max) errors['timeRange'] = true;
  } else {
    if (min != null && actual < min) errors['timeMin'] = true;
    if (max != null && actual > max) errors['timeMax'] = true;
  }
  if (timeFilter && !timeFilter({ ...value })) errors['timeFilter'] = true;
  return Object.keys(errors).length ? errors : null;
}
