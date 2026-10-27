# Datetime control

The library now provides a datetime input directive, picker, and toggle. They share a complete native `Date | null` value with Angular Forms and retain the original Material datepicker panel, calendar, action portal, focus handling, and popup positioning.

The input supports strict localized manual entry as well as popup selection. Date-only, recurring-time, and complete-datetime constraints are implemented. Ranges remain outside the current scope. See [Manual input](parsing.md) for formats and parsing errors.

## Reactive Forms example

```typescript
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  CimaDatetimePicker,
  CimaDatetimePickerInput,
  CimaDatetimePickerToggle,
} from '@cima-foundation/material-datetime-picker';

@Component({
  selector: 'app-appointment',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    CimaDatetimePicker, CimaDatetimePickerInput, CimaDatetimePickerToggle],
  providers: [provideNativeDateAdapter()],
  template: `
    <mat-form-field>
      <mat-label>Date and time</mat-label>
      <input matInput [cimaDatetimePicker]="picker" [formControl]="appointment">
      <cima-datetime-picker-toggle matIconSuffix [for]="picker" />
      <cima-datetime-picker #picker hourCycle="24" timeView="input"
        hourDial="single-ring" [showSeconds]="false" />
    </mat-form-field>
  `,
})
export class AppointmentExample {
  readonly appointment = new FormControl<Date | null>(new Date(2026, 9, 27, 14, 30, 45));
}
```

Configure an application Material theme as described in [Theming](theming.md). The library does not replace the app's date adapter. This release target is native `Date` with `provideNativeDateAdapter()`; alternative adapter implementations are not supported or verified yet.

## Value and confirmation

The input displays the complete date and time. A 12/24-hour setting affects display, not the underlying Date. A programmatic `setValue()` updates both the visible input and the calendar's initial selection without mutating the supplied Date.

Opening copies the confirmed time into a draft. Selecting a day and changing the time leave the form unchanged until OK. Cancel, Escape, backdrop dismissal, and `close()` discard the draft. After the session, the control is marked touched. Programmatic values and reset do not emit user `dateInput` or `dateChange` events.

If an application writes a new value or resets the control while the panel is open, the pending session is cancelled so it cannot overwrite the new model value. Disabling the form also closes a pending session. The toggle and `open()` are blocked when the form input or picker is disabled.

Seconds are preserved while their field is hidden. Confirmation uses the native date adapter's `setTime()`, which resets milliseconds to zero and follows native local-time/daylight-saving behavior. No timezone conversion or DST ambiguity policy is implemented.

## Input directive

Selector: `input[cimaDatetimePicker]`. Export: `cimaDatetimePickerInput`.

| Input | Type | Purpose |
| --- | --- | --- |
| `cimaDatetimePicker` | `CimaDatetimePicker` | Required associated picker |
| `value` | `Date \| null` | Programmatic value when not using Forms |
| `disabled` | `boolean` | Explicit disabled state, combined with the form's state |
| `readonly` | `boolean` | Defaults to false; disables manual entry while keeping popup selection available |
| `min`, `max` | `Date \| null` | Inclusive lower/upper calendar-date bounds; time portions are ignored |
| `minTime`, `maxTime` | `CimaTime \| null` | Inclusive recurring daily limits; min > max permits an overnight window |
| `timeFilter` | `CimaTimeFilter \| null` | Recurring time predicate |
| `minDateTime`, `maxDateTime` | `Date \| null` | Inclusive complete instant bounds |
| `cimaDatetimePickerFilter` | `DateFilterFn<Date> \| null` | Native Material date exclusion predicate |

Use one binding mechanism: Reactive Forms, `ngModel`, or `[value]` plus output handling. The directive is a ControlValueAccessor and validator. A non-null invalid Date or non-Date form value produces `{ invalidDatetime: true }`; the form retains the original data for diagnosis and the input stays blank. Null is valid unless a separate required validator rejects it.

`dateInput` emits on manual input; `dateChange` emits on the native change event. Both emit together on a confirmed popup selection. Their payload is `{ source, targetElement, value }`, where `value` is the complete Date or null. Invalid nonempty text produces null and `cimaDatetimePickerParse`, while remaining visible for correction. Valid text is normalized on blur. Direct typing updates the form without requiring popup OK; popup edits remain provisional until OK. See [Manual input](parsing.md).

The input supports Alt+ArrowDown to open the panel. The toggle supplies the normal pointer and keyboard trigger. Only one input can be associated with a picker during that picker's lifetime, matching the native Material registration constraint; create/destroy the picker with its input.

## Date constraints and validation

Apply date bounds and the filter to the input, as with the original Material datepicker:

```html
<input matInput [cimaDatetimePicker]="picker" [formControl]="appointment"
  [min]="minimumDate" [max]="maximumDate"
  [cimaDatetimePickerFilter]="availableDates">
```

```typescript
readonly minimumDate = new Date(2026, 9, 27);
readonly maximumDate = new Date(2026, 9, 30);

/** Excludes weekends; calendar filtering is independent of the selected time. */
readonly availableDates = (date: Date | null): boolean =>
  date == null || (date.getDay() !== 0 && date.getDay() !== 6);
```

`min` and `max` compare local calendar dates through Material's adapter. Both boundaries are inclusive. For example, a minimum of October 27 at 23:59 still permits October 27 at 09:00. These are not `minDateTime` or `maxDateTime` constraints.

The same rules disable calendar days and validate programmatic values. Invalid values are retained in the form and visible input rather than clamped to a different date. OK is disabled for an excluded pending value. Such a value is not applied and does not emit `confirmed`, `dateInput`, or `dateChange`.

| Form error | Meaning |
| --- | --- |
| `cimaDatetimePickerMin` | Date is before min; payload contains `min` and `actual` Dates |
| `cimaDatetimePickerMax` | Date is after max; payload contains `max` and `actual` Dates |
| `cimaDatetimePickerFilter` | Date is rejected by the predicate |
| `invalidDatetimeConstraints` | A bound is invalid or min is after max by calendar date |
| `invalidDatetime` | Non-null model value is not a valid native Date |
| `cimaDatetimePickerParse` | Nonempty text is incomplete or invalid; payload contains `text` |

Null does not fail date limits/filter validation; use `Validators.required` to require a value. An invalid constraints configuration is reported even on an empty optional control.

Replacing a bound or filter at runtime revalidates the form and cancels any open draft. It does not alter the selected value. Supply new Date objects or a new function reference when rules change; predicates should be pure and should not throw. In-place mutation of a Date or a predicate's captured state does not notify Angular that an input changed.

When using `[value]` without Forms, no FormControl error object exists; `errors` exposes current parsing/model/constraint errors; `validateValue(value)` checks a candidate against value constraints without including text parsing state. The demo's **Enable date constraints** switch provides an executable example, with October 27–30 allowed and October 28 excluded.

## Recurring time and full datetime constraints

All constraint inputs belong on `input[cimaDatetimePicker]`, not on the picker component:

```html
<input matInput [cimaDatetimePicker]="picker" [formControl]="appointment"
  [minTime]="minimumTime" [maxTime]="maximumTime" [timeFilter]="availableTimes"
  [minDateTime]="earliestAppointment" [maxDateTime]="latestAppointment">
```

```typescript
readonly minimumTime = { hours: 22, minutes: 0, seconds: 0 };
readonly maximumTime = { hours: 6, minutes: 0, seconds: 0 };
readonly earliestAppointment = new Date(2026, 9, 27, 22);
readonly latestAppointment = new Date(2026, 9, 28, 6);

/** Excludes one recurring maintenance slot; bounds still apply independently. */
readonly availableTimes = (time: CimaTime): boolean => time.minutes !== 15;
```

Import the `CimaTime` type from the library for this example. Recurring bounds use seconds, including hidden seconds. A 22:00–06:00 recurring window spans midnight, but does not move 03:00 to another date: 03:00 belongs to the date selected in the calendar. The complete datetime bounds in the example explicitly span two dates.

Full bounds compare `Date.getTime()` inclusively, including milliseconds. A lower bound after the upper bound is invalid configuration, never an implicit overnight interval. Date-only min/max, date filters, recurring time bounds/filter, and full datetime bounds all combine with AND. Their intersection can be empty; values are not rounded, searched for, or clamped into that intersection.

The native calendar excludes dates wholly before/after the full instant bounds, while boundary days remain selectable. OK reflects the pending day and time together and remains disabled until that complete candidate is valid. The confirmed form value does not change during draft edits. A translated unavailable-time message explains an excluded candidate. Time digits stay editable so the user can correct intermediate values.

The calendar-selection observer uses the public custom-header extension and `MatCalendar.selectedChange`. It renders the original `MatCalendarHeader` or the supplied `calendarHeaderComponent`; it does not read private datepicker content fields.

| Additional form error | Meaning |
| --- | --- |
| `cimaDatetimePickerMinTime`, `cimaDatetimePickerMaxTime` | A recurring daytime/open-ended bound rejects the time |
| `cimaDatetimePickerTimeRange` | Time falls outside an overnight window |
| `cimaDatetimePickerTimeFilter` | Recurring time predicate rejects the time |
| `cimaDatetimePickerMinDateTime`, `cimaDatetimePickerMaxDateTime` | Complete instant is outside a bound; payload has min/max and actual Dates |
| `invalidDatetimeConstraints` | Invalid/reversed date or datetime bounds, malformed daily time bounds, or invalid time-filter configuration |

Changing constraints cancels pending sessions and revalidates without rewriting the form. Use new Date/time objects and function references for changed rules. Null still passes value constraints unless required, but configuration errors are reported even on null values.

The demo includes **Daily time constraints** (none, business hours with a lunch exclusion, or overnight) and **Enable full datetime bounds**. The settings also affect the standalone time examples; full datetime bounds affect only the datetime input.

## Picker options

Selector: `cima-datetime-picker`. Export: `cimaDatetimePicker`.

| Input | Default | Purpose |
| --- | --- | --- |
| `hourCycle` | `'24'` | `'12'` or `'24'` |
| `hourDial` | `'single-ring'` | 24-hour single/dual ring |
| `timeView` | `'input'` | Initial numeric or clock view |
| `allowViewSwitch` | `true` | Allows switching numeric/clock views |
| `showSeconds` | `false` | Displays seconds while preserving hidden seconds |
| `hourStep`, `minuteStep`, `secondStep` | `1` | Time interaction increments, with the inline picker's fallback/range semantics; not validation constraints |
| `labels` | `{}` | Partial local time-content labels |
| `opened` | `false` | Writable open state; `[(opened)]` is supported through `openedChange` |
| `disabled` | `false` | Blocks opening; disabling an open picker cancels it |
| `startAt` | `null` | Native calendar starting date |
| `startView` | `'month'` | Native month, year, or multi-year view |
| `touchUi` | `false` | Uses Material's native touch dialog |
| `xPosition` | `'start'` | Preferred horizontal popup position |
| `yPosition` | `'below'` | Preferred vertical popup position |
| `restoreFocus` | `true` | Uses Material's focus restoration |
| `panelClass` | `[]` | Forwards classes to the native calendar |
| `dateClass` | No added classes | Native date-cell styling callback |
| `calendarHeaderComponent` | Material default | Optional native custom calendar header |
| `color` | Inherited/default | Native M2 palette; no M3 color override |

Time/full-datetime constraints are configured on its input directive. The options above use public Material APIs. `color` only affects M2; it does not override M3 tokens. `touchUi` uses the native Material dialog.

| Output | Payload | Meaning |
| --- | --- | --- |
| `opened`, `closed` | `void` | Native panel lifecycle |
| `openedChange` | `boolean` | Actual lifecycle state, including toggle opening and dismissal |
| `confirmed` | `Date \| null` | Complete applied value |
| `cancelled` | `void` | Session ended without applying |
| `yearSelected`, `monthSelected` | `Date` | Native navigation selection; does not commit the form |
| `viewChanged` | Material calendar view | Native calendar view changed |

`open()` opens unless disabled or unconnected. `close()` cancels. `isOpen()` reports current panel state; consumers should read it rather than set it directly. `select(date: Date)` changes the pending calendar day only while open, preserving draft time. It does not commit or close; OK applies the complete candidate after validation. Invalid Dates and calls while closed/disabled are ignored. Excluded dates remain invalid candidates and cannot be confirmed. Its semantics deliberately preserve this control's draft/OK boundary.

## Toggle

Selector: `cima-datetime-picker-toggle`. Required input: `[for]="picker"`. Optional `disabled` defaults to false. It delegates to the original Material toggle, inherits the connected input/picker disabled state, and uses `MatDatepickerIntl` for its accessible label.

## Template-driven forms and translation

Import `FormsModule` and use `[(ngModel)]="appointment"` instead of `[formControl]`, with a `Date | null` property. Inside a form, also supply `name` or make ngModel standalone.

The formatted input follows `DateAdapter` locale changes. Native calendar labels use `MatDatepickerIntl`; the time content and action labels use `CimaTimepickerIntl`. See [Internationalization](internationalization.md). Theme classes must also be available on the overlay container.

## Verification and remaining work

Tests cover initial values, preserved hidden seconds, date-only and time-only confirmations, cancellation/reopening, programmatic replacement, reset, disabled behavior, invalid Dates, and ngModel updates. Date constraints also have tests for inclusive boundaries, ignored time portions, filters, dynamic rule changes, invalid configuration, and rejected confirmation. Recurring bounds, overnight windows, instant boundaries, pending-day validation, and custom-header forwarding are tested. Manual parsing, writable opened state, pending select(), increments, and option forwarding have additional tests. Ranges, alternate adapters, a configurable timezone/DST policy, full accessibility, and mobile verification remain open.

## Controlled opening and increments

```html
<cima-datetime-picker #picker [(opened)]="pickerOpen"
  [hourStep]="2" [minuteStep]="15" [secondStep]="10"
  startView="month" [touchUi]="false" />
<button type="button" (click)="picker.open()">Open</button>
<button type="button" (click)="picker.select(nextDay)">Choose pending day</button>
```

Use a boolean property or signal for `pickerOpen` and a native Date for `nextDay`. A valid manually entered minute such as 17 is accepted even with `minuteStep=15`. Changing a step does not rewrite the selected value.

[Documentation index](README.md) · [API reference](api.md) · [Project status](status.md)
