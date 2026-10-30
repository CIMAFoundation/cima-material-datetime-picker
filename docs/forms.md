# Forms and values

This page covers the time-only component. See [Datetime control](datetime.md) for the public Date input, picker, and toggle.

Use exactly one of `formControl`/`formControlName`, `ngModel`, or `value` binding for each timepicker. Do not bind the same control through multiple mechanisms.

## Reactive Forms

```typescript
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CimaTime, CimaTimePicker } from '@cima-foundation/material-datetime-picker';

@Component({
  selector: 'app-reactive-time',
  imports: [ReactiveFormsModule, CimaTimePicker],
  template: `
    <cima-time-picker [formControl]="time" timeView="input" />
    @if (time.touched && time.hasError('required')) {
      <p>A time is required.</p>
    }
    <button type="button" (click)="time.reset()">Reset</button>
    <button type="button" (click)="time.disable()">Disable</button>
    <button type="button" (click)="time.enable()">Enable</button>
  `,
})
export class ReactiveTimeExample {
  readonly time = new FormControl<CimaTime | null>(null, Validators.required);
}
```

For `formControlName`, place the timepicker inside the same `formGroup` as any other ControlValueAccessor. The value is the complete time object, not a formatted string.

The control becomes touched when focus leaves the entire picker. Moving between hour/minute fields does not mark it touched by itself. Programmatic `setValue()` and `reset()` do not emit `timeChange`.

## Template-driven forms

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CimaTime, CimaTimePicker } from '@cima-foundation/material-datetime-picker';

@Component({
  selector: 'app-model-time',
  imports: [FormsModule, CimaTimePicker],
  template: `
    <form>
      <cima-time-picker name="time" [(ngModel)]="time" />
    </form>
  `,
})
export class ModelTimeExample {
  time: CimaTime | null = { hours: 7, minutes: 0, seconds: 0 };
}
```

Inside a form, provide a unique `name` or configure ngModel as standalone.

## Value binding without Forms

```typescript
readonly time = signal<CimaTime | null>(null);
```

```html
<cima-time-picker [(value)]="time" />
```

Import `signal` from `@angular/core`, and `CimaTime` and `CimaTimePicker` from the package. Angular Forms modules are not needed for this binding.

## Validation boundaries

`Validators.required` works with the null/non-null value. The built-in validator adds `{ invalidTime: true }` when a non-null model value contains out-of-range, fractional, or missing time fields. For example, `{ hours: 25, minutes: 0, seconds: 0 }` remains in the model but makes the control invalid. Resetting to null clears `invalidTime`; required validation still applies. The same guard rejects invalid direct value bindings in the display.

The time-only component also validates recurring `minTime`, `maxTime`, and `timeFilter`, including overnight windows; see [API reference](api.md). Date-only and full datetime constraints are available on the separate [datetime input](datetime.md). Datetime intervals are supported by the separate [range picker](datetime-range.md). External [time and datetime inputs](parsing.md) expose dedicated text parsing errors; the inline numeric fields retain their existing edit behavior. An invalid numeric edit is restored rather than exposed as a form parsing error. Numeric changes update the bound value immediately. A time popup without actions applies valid edits to the form immediately; with actions, edits remain provisional until OK. Enter on the last field completes selection, while blur to AM/PM or a popup action does not.

A null value shows a starting 00:00 display (12:00 AM in 12-hour mode) without setting the control's value. Hidden seconds are preserved; hiding the field does not round them to zero.

## Choosing an event

- Use the form control's `valueChanges` to observe form values.
- Use `timeChange` for actual user time edits.
- Use `selectionComplete` for a completed last-unit selection, including reselecting the same value.
- Use `valueChange` for model binding; it can also fire during a form's `writeValue`.

A changed value and a completed selection are different events. Popup containers can use `selectionComplete` for automatic confirmation without closing on intermediate drag updates.

See the [live example source](https://github.com/CIMAFoundation/cima-material-datetime-picker/blob/main/projects/demo/src/app/app.html) for reset, required, disabled, and JSON-value displays.

---

[Documentation index](README.md) · [API reference](api.md) · [Project status](status.md)

## Hour-only precision

`precision="hours"` is supported by inline time, time popup, datetime, and datetime range controls. Minutes remain visible/disabled; user edits yield exact hours. External values are not silently rounded and receive `timePrecision`, `cimaDatetimePickerPrecision`, or `cimaDatetimeRangePrecision` if unaligned. Default full precision preserves existing hidden-second behavior. See [Hour-only precision](api.md#hour-only-precision) for examples and completion behavior.
