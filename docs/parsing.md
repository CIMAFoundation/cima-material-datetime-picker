# Manual input and formats

Both `input[cimaDatetimePicker]` and `input[cimaTimePicker]` are editable by default. Set `[readonly]="true"` for popup-only entry. Values remain `Date | null` and `CimaTime | null`; formatted strings belong to the input, not the form model.

## Default formats

Dates use the current Material `DateAdapter` locale's numeric Gregorian order and separators, with Latin digits and a four-digit year. For example:

| Locale | Datetime, 24-hour | Datetime, 12-hour |
| --- | --- | --- |
| en-US | `10/27/2026 14:30` | `10/27/2026 02:30 PM` |
| it-IT / en-GB | `27/10/2026 14:30` | `27/10/2026 02:30 PM` |
| de-DE | `27.10.2026 14:30` | Uses the adapter's localized day period |

Time-only inputs use `HH:mm` or `hh:mm <day period>`. `hourCycle` is explicit and independent of locale. Day periods come from the adapter, not `CimaTimepickerIntl`; changing button translations does not change parsing. A 12-hour value requires a period, case-insensitively. With `showSeconds=true`, seconds are required: `14:30:45` or `02:30:45 PM`. One-digit day, month, hour, minute, and second fields are accepted and padded on blur.

No alternate date orders are guessed: `01/02/2026` means January 2 in en-US and February 1 in it-IT. Date and time are separated by whitespace. Date-only strings, month names, two-digit years, ISO offsets, timezone suffixes, and unexpected seconds are rejected. The native adapter's permissive `Date.parse()` is not used.

Hidden seconds survive edits of an existing value, including temporarily incomplete text. New values and edits after clearing the field start with zero seconds. Manual datetime edits and popup confirmation reset milliseconds to zero; programmatic writes preserve the supplied precision. Steps are interaction increments, never parsing constraints.

The default implementation targets native Date and numeric Gregorian locales. Other calendars, numeral systems, adapters, and specialized formats require a custom service and verification. Native local-time semantics apply. Manual datetime parsing rejects nonexistent local times that normalize into another hour/day; repeated DST times use the platform's native choice. The popup still follows native `DateAdapter.setTime()` normalization. There is no timezone conversion or configurable DST resolution policy.

## Forms and errors

Typing emits a parsed value through Angular Forms and `dateInput` / `timeInput`. Incomplete or invalid nonempty text emits null and sets `cimaDatetimePickerParse` / `cimaTimePickerParse`, with `{ text }` containing the original text. It stays visible, including after blur, until corrected, replaced programmatically, reset, or replaced by a popup selection. Empty/whitespace-only input is null without a parse error; apply `Validators.required` separately.

A syntactically valid value that fails date/time constraints remains visible and in the model with the existing constraint errors. A malformed programmatic value uses `invalidDatetime` / `invalidTime`, not a text parsing error. Both directives expose `errors` for integrations without Forms.

The native `change` event emits `dateChange` / `timeChange`; blur normalizes valid text and marks touched. Programmatic writes emit neither user event. A confirmed popup selection emits both input and change events. Direct typing does not require popup OK. Reset, disabling, changed constraints, and external values cancel pending popup drafts.

```html
<mat-form-field>
  <mat-label>Appointment</mat-label>
  <input matInput [cimaDatetimePicker]="picker" [formControl]="appointment">
  <cima-datetime-picker-toggle matIconSuffix [for]="picker" />
  <cima-datetime-picker #picker hourCycle="24" />
  <mat-hint>Example for en-US: 10/27/2026 14:30</mat-hint>
  @if (appointment.hasError('cimaDatetimePickerParse')) {
    <mat-error>Enter a valid date and complete time, for example 10/27/2026 14:30</mat-error>
  }
</mat-form-field>
```

Import `MatFormFieldModule`, `MatInputModule`, `ReactiveFormsModule`, the three datetime controls, and provide `provideNativeDateAdapter()`. Use the same pattern with `cimaTimePickerParse` for a time input. Error text and format hints are owned by the consuming application and can be translated normally.

## Custom formats

`CimaInputFormats` is a public injectable service. Its methods are `formatDate`, `formatTime`, `formatDatetime`, `parseTime`, and `parseDatetime`. Parsing returns the canonical value or null. The input handles blank text and distinguishes it from parsing failure. `CimaInputFormatOptions` contains `adapter: DateAdapter<Date>`, `hourCycle`, and `showSeconds`, plus optional `precision` (`full` by default); passing the input's adapter supports component-scoped adapter providers and runtime locale changes without capturing an unrelated root adapter.

Override formatting and parsing together. For example, an application can require an explicit leading marker on a time-only input:

```typescript
import { Injectable } from '@angular/core';
import { CimaInputFormats, CimaInputFormatOptions, CimaTime }
  from '@cima-foundation/material-datetime-picker';

@Injectable()
export class MarkedTimeFormats extends CimaInputFormats {
  /** Adds the application's required display marker. */
  override formatTime(value: CimaTime, options: CimaInputFormatOptions): string {
    return `Time ${super.formatTime(value, options)}`;
  }

  /** Requires the same marker while retaining strict locale/precision checks. */
  override parseTime(text: string, options: CimaInputFormatOptions,
    previous: CimaTime | null = null): CimaTime | null {
    return text.startsWith('Time ') ? super.parseTime(text.slice(5), options, previous) : null;
  }
}

// Add to the application or owning component's providers:
// { provide: CimaInputFormats, useClass: MarkedTimeFormats }
```

`formatDatetime` calls `formatTime`, and `parseDatetime` calls `parseTime`, so a time customization also applies inside datetime strings. Custom date formats should override `formatDatetime` and `parseDatetime` together. Service methods must not mutate supplied values or throw for ordinary invalid input. The library does not interpret Moment-style format tokens or replace `MAT_DATE_FORMATS`.

[Documentation index](README.md) · [Datetime control](datetime.md) · [Time popup](popups.md)

## Hour-only inputs

With `precision="hours"`, editable time/datetime inputs retain localized date/time syntax but accept only zero minutes, and seconds must be omitted even when `showSeconds` is configured. Examples: `14:00`, `02:00 PM`, or `10/27/2026 02:00 PM` in US English. Previous hidden seconds are reset to zero on successful user parsing. Off-hour manual text is a parse error. Programmatic non-hour-aligned values are retained and reported as precision validation errors. Custom `CimaInputFormats` implementations receive `options.precision` and should honor it. The range field is always readonly and has no text parsing.
