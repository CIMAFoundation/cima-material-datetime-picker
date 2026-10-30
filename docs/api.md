# API reference

## Public exports

| Export | Purpose |
| --- | --- |
| `CimaDatetimeRangePicker` | Standalone datetime range control with integrated trigger, responsive popup, and Angular Forms support |
| `CimaDatetimeRange`, `CimaDatetimeRangeLayout` | Native Date endpoints and auto/horizontal/vertical layouts; see [Datetime range](datetime-range.md) |
| `CimaDatetimePicker` | Public datetime picker using the original Material panel |
| `CimaDatetimePickerInput` | Editable Date input, CVA, parsing and constraint validation |
| `CimaDatetimePickerToggle` | Native Material toggle wrapper |
| `CimaDatetimeInputEvent` | Confirmed complete datetime input event |
| `CimaTimePickerPopup`, `CimaTimePickerInput`, `CimaTimePickerToggle` | Public anchored time popup and editable Forms input |
| `CimaTimeInputEvent` | Time input/change event with source, native element, and complete value |
| `CimaInputFormats`, `CimaInputFormatOptions` | Replaceable strict locale parsing and formatting service/context |
| `CimaTimePicker` | Standalone component; selector `cima-time-picker` |
| `CimaTime` | Time-only value interface |
| `CimaTimePrecision` | `'full'` (existing behavior) or `'hours'` (exact hours only) |
| `withTimePrecision(time, precision)` | Returns a copied time, zeroing minutes/seconds in hours precision |
| `CimaTimeView` | `'input'` or `'clock'` |
| `CimaHourDial` | `'single-ring'` or `'dual-ring'` |
| `CimaTimeFilter` | `(time: CimaTime) => boolean`, recurring daily predicate |
| `CimaTimeUnit` | `'hours'`, `'minutes'`, or `'seconds'` |
| `CimaTimeLabels` | Complete set of time-selection labels |
| `CIMA_TIME_LABELS` | Default English time-selection labels |
| `CimaTimepickerIntl` | Global time/action/range labels; `setLocale(locale, overrides?)` applies included translations and notifies open controls |
| `CimaPickerLabels`, `CimaCalendarLabels`, `CimaPickerTranslation` | Types for included picker and Material calendar translations |
| `CIMA_PICKER_TRANSLATIONS`, `getCimaPickerTranslation(locale)` | Included en/it/fr/de/es catalogs, locale → language → English fallback, and independent dictionary copies |
| `isValidTime(value)` | Runtime guard for a complete, valid `CimaTime` |

## Value contract

```typescript
interface CimaTime {
  hours: number;   // Integer, 0–23.
  minutes: number; // Integer, 0–59.
  seconds: number; // Integer, 0–59, including when hidden.
}
```

The value carries no date, timezone, UTC offset, or daylight-saving information. Changing display format, theme, language, or hour-dial layout does not change it.

## Component usage, inputs, and outputs

All inputs are optional. Defaults apply when an input is omitted.

Import the standalone `CimaTimePicker` component and, when using `ngModel`, `FormsModule`:

```html
<cima-time-picker
  [(ngModel)]="time"
  timeView="clock"
  hourCycle="24"
  [allowViewSwitch]="true"
  [showSeconds]="false"
/>
```

The value is `CimaTime | null`: `{ hours, minutes, seconds }`, always using 24-hour values and independent of dates and timezones. Reactive Forms and `[(value)]` are also supported. Use only one value-binding mechanism per control.

| Input | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `CimaTime \| null` | `null` | A `CimaTime` using 24-hour values; supports `[(value)]` |
| `timeView` | `CimaTimeView` | `'clock'` | `'input'` or `'clock'`; supports two-way binding |
| `allowViewSwitch` | `boolean` | `true` | Shows the keyboard/clock switch button |
| `hourCycle` | `'12' \| '24'` | `'24'` | `'12'` or `'24'`; does not change the value format |
| `hourDial` | `CimaHourDial` | `'dual-ring'` | 24-hour layout: `'single-ring'` or `'dual-ring'`; ignored in 12-hour mode |
| `precision` | `CimaTimePrecision` | `'full'` | Set `'hours'` for editable hours with visible disabled minutes fixed at 00 and hidden seconds |
| `showSeconds` | `boolean` | `false` | Shows seconds in full precision; hours precision always hides and zeros them |
| `hourStep`, `minuteStep`, `secondStep` | `number` | `1` | Control increments; these are not validation constraints |
| `minTime`, `maxTime` | `CimaTime \| null` | `null` | Inclusive recurring time limits, supporting overnight windows |
| `timeFilter` | `CimaTimeFilter \| null` | `null` | Additional recurring time predicate |
| `disabled` | `boolean` | `false` | Prevents interaction; also supports the form's disabled state |
| `labels` | `Partial<CimaTimeLabels>` | `{}` | Local `Partial<CimaTimeLabels>` overrides; omitted fields use `CimaTimepickerIntl` |

| Output | Value | When emitted |
| --- | --- | --- |
| `valueChange` | `CimaTime \| null` | When the internal `value` model is updated, including through Forms' `writeValue` |
| `timeViewChange` | `'input' \| 'clock'` | When the switch button changes the view |
| `timeChange` | `CimaTime` | When the user actually changes the time; not during `writeValue` |
| `selectionComplete` | `CimaTime` | When the last visible unit is completed: dial release or Enter on the last visible dial/numeric unit; also emitted when the value is unchanged, provided all time constraints pass |

`timeChange` emits a `CimaTime` during user edits. The component does not create OK/Cancel buttons: its container owns draft selection and confirmation. Numeric fields update their draft on `change`; out-of-range edits revert to the previous value. Blur never completes selection. Press Enter on the final numeric field to emit `selectionComplete`; on earlier fields Enter moves focus to the next field. A `null` value displays 00:00 as a starting point without setting the form value until the first edit.

The dial supports pointer input, dragging, arrow keys, Home, and End. The default 24-hour dial uses the Material reference dual-ring layout with 00–11 outside and 12–23 inside. Set `hourDial="single-ring"` for one ring with 24 positions, 15 degrees apart. All hours from 00 to 23 are labelled. The single-ring layout is a library alternative, not a Material Design recommendation. Switching layouts preserves the time value; the 12-hour dial is unaffected. Completing an hour selection advances to minutes with an animated hand transition. Motion is disabled when `prefers-reduced-motion` is enabled.

With the default minute step, a tap selects the nearest five-minute mark; dragging selects individual minutes. The final pointer position is read on release. Small movements up to eight CSS pixels are treated as tap jitter. An explicit `minuteStep` other than one takes precedence over the default five-minute tap snapping. Values rounded past 59 wrap to zero.

Minute interactions and dual-ring ordering follow Google's [Material clock presenter](https://github.com/material-components/material-components-android/blob/master/lib/java/com/google/android/material/timepicker/TimePickerClockPresenter.java) and [clock hand implementation](https://github.com/material-components/material-components-android/blob/master/lib/java/com/google/android/material/timepicker/ClockHandView.java). Browser-specific adaptations include the fixed eight-CSS-pixel movement tolerance, pointer capture/cancellation, keyboard controls, and a 180ms CSS transition. This does not constitute a complete accessibility conformance audit.

Seconds and their automatic advancement after minutes are library extensions, not behavior specified by the referenced hour/minute picker. The seconds dial follows the same tap/drag rule; an explicit `secondStep` overrides default snapping. Embedding the timepicker below the calendar is also a library composition.

## Steps and validation

The step inputs control keyboard/native-number increments and minute/second dial snapping. They do not constrain all accepted values. Manual entry can accept any integer in the field's valid range. Clicking an hour on the dial selects that hour regardless of `hourStep`.

Invalid step configuration falls back to one. Valid steps are integers 1–23 for hours and 1–59 for minutes or seconds. A numeric field outside its range is restored to the previous display; this does not currently expose a dedicated parsing error on the form.

## Daily time constraints

```html
<cima-time-picker [(ngModel)]="time"
  [minTime]="{ hours: 22, minutes: 0, seconds: 0 }"
  [maxTime]="{ hours: 6, minutes: 0, seconds: 0 }" />
```

Bounds are inclusive and compare at second precision, including hidden seconds. With min <= max, the allowed window is between them. With min > max, the window crosses midnight: 22:00–06:00 allows times >=22:00 or <=06:00. Equal bounds permit only that exact time; null means no bound. A daily window never adds a day or changes the selected date.

`timeFilter` receives a copy of the complete time and combines with both bounds. Supply a pure function that returns true for allowed values. Replacing a bound or predicate revalidates Forms without changing the selected time; use new objects/function references rather than mutating existing inputs.

| Error | Meaning |
| --- | --- |
| `invalidTime` | Non-null value is not a complete valid CimaTime |
| `invalidTimeConstraints` | A bound is malformed or the predicate input is not a function |
| `timeMin`, `timeMax` | A daytime/open-ended bound rejects the value |
| `timeRange` | A value falls in the excluded daytime gap of an overnight window |
| `timeFilter` | The recurring predicate rejects the time |

Null passes value constraints unless required; malformed constraint configuration is reported even when the value is null. Syntactically valid but excluded times remain visible and in the model, with a translated `unavailableTime` message and an invalid form state. Intermediate hour/minute edits are allowed so users can reach an allowed complete time. The dial does not disable every individual tick; `selectionComplete` is suppressed until the final time satisfies the rules.

`timeErrors()` is a computed signal exposing these errors for value-only integrations and custom confirmation buttons. See the popup guide for a usage example.

## Angular Forms methods

`writeValue`, `registerOnChange`, `registerOnTouched`, and `setDisabledState` implement `ControlValueAccessor`. Consumers normally use Angular Forms rather than calling them directly. `writeValue` copies a valid complete value and preserves invalid incoming values for diagnosis; it does not emit `timeChange`. The component implements `Validator` and reports `{ invalidTime: true }` for a non-null value that fails `isValidTime`. Invalid bound values render blank numeric displays, an accessible invalid state, and the translated `invalidTime` message rather than a formatted hour. The model is not silently rewritten. Editing starts from a safe midnight baseline when replacing an invalid value.

The inline time-only content does not expose popup methods. `CimaTimePickerPopup` adds `open()`, `close()`, and guarded `confirm()`; see the [time input/popup API](popups.md). Both external inputs support [manual parsing and custom formats](parsing.md). The public datetime picker exposes `open()` and `close()`; see the [datetime API](datetime.md).

---

[Documentation index](README.md) · [API reference](api.md) · [Project status](status.md)

## Datetime range control

`CimaDatetimeRangePicker` (`cima-datetime-range-picker`) uses `CimaDatetimeRange | null`: `{ start: Date | null, end: Date | null }`. It supports Reactive Forms, ngModel, and `[(value)]`. The popup combines a Material range calendar and two time controls, with explicit OK/Cancel and `layout="auto"` by default. See [Datetime range](datetime-range.md) for the full input/output API, responsive breakpoints, native-date constraints, validation errors, and selection behavior.

## Localization

Coordinate `DateAdapter.setLocale(locale)` for formats, `CimaTimepickerIntl.setLocale(locale, overrides?)` for picker labels, and `MatDatepickerIntl` with `getCimaPickerTranslation(locale).calendar` for calendar labels. The English defaults remain until explicitly configured. Unsupported text languages fall back to English while formats retain the chosen locale. Service overrides registered through `setLocale` persist across later locale changes; component inputs take precedence. See [Localization and translations](internationalization.md) for startup/runtime setup, calendar overrides, all included locales, and the English-only playground policy.

## Hour-only precision

All four public containers (`CimaTimePicker`, `CimaTimePickerPopup`, `CimaDatetimePicker`, and `CimaDatetimeRangePicker`) support `precision="hours"`. The default `precision="full"` preserves existing minute/optional-second behavior.

```html
<cima-time-picker precision="hours" />
<cima-time-picker-popup #timePopup precision="hours" />
<cima-datetime-picker #datetimePicker precision="hours" />
<cima-datetime-range-picker [formControl]="range" precision="hours" />
```

Minutes remain visible as `00` but disabled in both numeric and clock views. Seconds are hidden even if `showSeconds` is true. The dial only selects hours and never advances to minutes. Clicking/releasing an hour or pressing Enter in the hour field completes selection; a time popup without actions closes at that point. Typing updates the exact-hour value without auto-closing; press Enter to finish. With confirmation actions, OK remains the application boundary. AM/PM remains selectable in 12-hour mode.

User selections produce zero minutes/seconds (and zero milliseconds for Date endpoints). Programmatic form writes are never silently rounded: non-hour-aligned external values remain in the form and receive `timePrecision`, `cimaDatetimePickerPrecision`, or `cimaDatetimeRangePrecision`. Opening a popup prepares an exact-hour draft; only an edit or confirmation applies it. Disabled minute controls cannot edit or activate the minute dial, and minute/second increments have no effect in this mode. Daily/full datetime limits remain exact and are not rounded; for example a 09:30 minimum means the first selectable hour is 10:00.

External editable inputs keep their usual localized syntax, with zero minutes and no seconds: `14:00` or `02:00 PM`, plus the date for datetime fields. Off-hour text is a parse error; plain `14` is not a new supported syntax. Hidden seconds from a prior value are cleared on hour-only user edits instead of preserved. The datetime range input remains read-only. See [Manual input](parsing.md).
