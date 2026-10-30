# Public time input and popup

`CimaTimePickerPopup`, `CimaTimePickerInput`, and `CimaTimePickerToggle` expose the time-input composition as public library controls. `CimaTimePicker` remains reusable inline selection content. The popup uses public CDK Overlay and focus-trap APIs.

## Reactive Forms integration

```typescript
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CimaTime, CimaTimePickerInput, CimaTimePickerPopup, CimaTimePickerToggle }
  from '@cima-foundation/material-datetime-picker';

@Component({
  selector: 'app-time-input',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    CimaTimePickerInput, CimaTimePickerPopup, CimaTimePickerToggle],
  providers: [provideNativeDateAdapter()],
  template: `
    <mat-form-field>
      <mat-label>Time</mat-label>
      <input matInput [cimaTimePicker]="picker" [formControl]="time"
        [minTime]="minimum" [maxTime]="maximum">
      <cima-time-picker-toggle matIconSuffix [for]="picker" />
      <cima-time-picker-popup #picker hourCycle="24" [minuteStep]="5" />
      <mat-hint>Example: 14:30</mat-hint>
      @if (time.hasError('cimaTimePickerParse')) {
        <mat-error>Enter a complete time, for example 14:30</mat-error>
      }
      @if (time.hasError('timeMin') || time.hasError('timeMax')) {
        <mat-error>Choose a time between 09:00 and 18:00</mat-error>
      }
    </mat-form-field>
  `,
})
export class TimeInputExample {
  readonly time = new FormControl<CimaTime | null>(null, Validators.required);
  readonly minimum = { hours: 9, minutes: 0, seconds: 0 };
  readonly maximum = { hours: 18, minutes: 0, seconds: 0 };
}
```

Provide the native date adapter for the input's locale/day-period formatting. The inline `CimaTimePicker` itself still requires no adapter. Configure an M2 or M3 theme, including the CDK overlay container; see [Theming](theming.md).

For template-driven forms, import `FormsModule` and replace `[formControl]="time"` with `[(ngModel)]="time"` for a `CimaTime | null` property; supply a name inside a form. Without Forms, use `[value]` and `(timeInput)` or `(timeChange)` on the input. Use only one value binding mechanism.

## Input API

Selector: `input[cimaTimePicker]`. Export: `cimaTimePickerInput`.

| Input | Default | Meaning |
| --- | --- | --- |
| `cimaTimePicker` | Required | Associated `CimaTimePickerPopup` |
| `value` | null | `CimaTime` using 24-hour hours/minutes/seconds |
| `disabled` | false | Combined with the Forms disabled state |
| `readonly` | false | Disables typing and enables click/Enter/ArrowDown opening |
| `minTime`, `maxTime` | null | Inclusive daily bounds; min > max permits overnight windows |
| `timeFilter` | null | Additional recurring predicate |

`timeInput` and `timeChange` emit `CimaTimeInputEvent`: `{ source, targetElement, value }`. Typing emits input events; native change emits change events; popup confirmation emits both. Programmatic writes emit neither. See [Manual input](parsing.md) for precision, errors, and custom formatting. `errors` exposes current parsing/constraint errors without Forms; `validate(control)` implements Angular Forms validation. The daily errors are the same as for [inline time content](api.md).

The input supports Alt+ArrowDown. Editable fields preserve normal click/caret and Enter behavior; use the toggle to open by pointer. Read-only fields also open on click, Enter, or ArrowDown. The toggle's accessible label uses `labels.selectTime` or `CimaTimepickerIntl.selectTime`.

## Popup API

Selector: `cima-time-picker-popup`. Export: `cimaTimePickerPopup`. One input can be associated with a popup at a time; create/destroy them together.

| Input | Default | Meaning |
| --- | --- | --- |
| `timeView` | `'clock'` | Initial clock or numeric view |
| `hourCycle`, `hourDial` | `'24'`, `'single-ring'` | Same display options as inline time content |
| `showSeconds`, `allowViewSwitch` | false, true | Visible precision and view switch |
| `hourStep`, `minuteStep`, `secondStep` | 1 | Interaction increments, not validation constraints |
| `labels` | `{}` | Partial local `CimaTimeLabels` overrides |
| `showActions` | false | Requires explicit OK when true |
| `disabled` | false | Blocks opening and cancels a pending session |
| `restoreFocus` | true | Restores focus to the input or toggle on close |
| `panelClass` | `[]` | Class name or array applied to the dialog surface |

Methods: `open(trigger?: HTMLElement)`, `close()` (discard pending edits; already applied immediate edits remain), and `confirm()` (apply only if the draft is valid). `isOpen()` reports state. Outputs: `opened`, `closed`, `cancelled` (void), and `confirmed` (`CimaTime`). `draftTime()` exposes the pending time; `canConfirm` reports whether it satisfies the input's daily rules and disabled state. Each emitted value is copied.

The toggle selector is `cima-time-picker-toggle`; its required `[for]` points to the popup. Optional `disabled` defaults to false and combines with popup/input disabling.

## Confirmation and cancellation

Opening copies the confirmed value into an independent draft. An empty/invalid value starts at midnight without writing to the form. With the default `showActions=false`, completing minutes (or seconds when visible) confirms and closes. Dial dragging completes only on release. Enter on the final dial/numeric unit also completes selection. Valid numeric and dial edits immediately update the input and form without closing the popup. Closing retains applied edits. Enter on earlier units moves to the next unit.

With `[showActions]="true"`, selection stays provisional until OK. Cancel, Escape, backdrop clicks, `close()`, reset, external replacement, changed constraints, disabling, and destruction discard the draft. The form becomes touched when a popup session ends. Focus is trapped while open and restored to the trigger after closing unless explicitly disabled.

Daily constraints are shared by input validation and popup confirmation. Invalid intermediate edits remain possible so users can reach an allowed time. OK is disabled for an invalid candidate; both programmatic and automatic confirmation enforce the same rules. `confirmed` belongs to popup application, not direct text edits. Full datetime bounds do not apply to time-only values.

For combined date and time, use the original Material panel through the [public datetime controls](datetime.md).

[Documentation index](README.md) · [API reference](api.md) · [Project status](status.md)
