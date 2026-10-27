import { booleanAttribute, Component, input } from '@angular/core';
import { MatDatepickerToggle } from '@angular/material/datepicker';
import { CimaDatetimePicker } from './datetime-picker';

/** Native Material toggle associated with the public datetime picker. */
@Component({
  selector: 'cima-datetime-picker-toggle',
  imports: [MatDatepickerToggle],
  template: `<mat-datepicker-toggle [for]="picker().nativeCalendar" [disabled]="disabled() || picker().disabled || picker().inputDisabled" />`,
  host: { style: 'display: inline-flex' },
})
export class CimaDatetimePickerToggle {
  readonly picker = input.required<CimaDatetimePicker>({ alias: 'for' });
  readonly disabled = input(false, { transform: booleanAttribute });
}
