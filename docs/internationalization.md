# Localization and translations

The library includes English, Italian, French, German, and Spanish picker translations. Date and time formats remain the responsibility of the application's native Material `DateAdapter`. You can coordinate both at startup and whenever the locale changes; selecting a locale never changes form values or `hourCycle`.

## Included locales and fallback

`getCimaPickerTranslation(locale)` resolves an exact dictionary key, then the base language, then English. Locale identifiers are case-insensitive, and underscores are accepted as hyphens. The included dictionary keys are `en`, `it`, `fr`, `de`, and `es`:

| Locale | Picker text | Date/time formats |
| --- | --- | --- |
| `en-US` | English | US English |
| `en-GB` | English | British English |
| `it-IT` | Italian | Italian |
| `fr-FR`, `fr-CA` | French | French or Canadian French |
| `de-DE` | German | German |
| `es-ES` | Spanish | Spanish |
| `pt-BR` | English fallback | Brazilian Portuguese |

Text fallback does not replace the date adapter's locale. A valid unsupported locale can retain its date order, month names, punctuation, and day periods while the picker labels fall back to English. Regional English locales share translations but retain their own formats. Use valid locale identifiers with the native adapter.

## Coordinate formats and labels

```typescript
import { inject } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { MatDatepickerIntl } from '@angular/material/datepicker';
import { CimaTimepickerIntl, getCimaPickerTranslation } from '@cima-foundation/material-datetime-picker';

// Inside the component/service managing application localization:
const adapter = inject<DateAdapter<Date>>(DateAdapter);
const timeIntl = inject(CimaTimepickerIntl);
const calendarIntl = inject(MatDatepickerIntl);

adapter.setLocale('fr-CA');
timeIntl.setLocale('fr-CA');
Object.assign(calendarIntl, getCimaPickerTranslation('fr-CA').calendar);
calendarIntl.changes.next();
```

Call these steps at startup as well as on subsequent changes. `MAT_DATE_LOCALE` configures date formats; it does not by itself select the library's text translations. Defaults remain English until you call `CimaTimepickerIntl.setLocale()` or customize the service yourself. Neither the library nor its dictionaries install or replace the application's date adapter or `MatDatepickerIntl` provider.

`setLocale()` emits `changes` automatically and updates open time, datetime, and datetime range pickers. Updating calendar labels still requires `calendarIntl.changes.next()`, following Material's public API. The calendar dictionaries include navigation, opening/closing, comparison/range accessible labels, and the spoken year-range format. `getCimaPickerTranslation()` returns independent copies, so customization does not mutate the built-in catalog.

## Application overrides

Persistent service overrides can be passed to `setLocale()`:

```typescript
timeIntl.setLocale('it-IT', {
  enterTime: 'Orario appuntamento',
  rangeStart: 'Arrivo',
  rangeEnd: 'Partenza',
});
// These overrides remain in effect after later setLocale() calls.
timeIntl.setLocale('de-DE');
```

Subsequent calls merge explicitly supplied overrides with those already registered. Supplying a new string for the same field replaces its override. For calendar overrides, merge application labels after the dictionary and notify the calendar service:

```typescript
Object.assign(calendarIntl, getCimaPickerTranslation('de-DE').calendar, {
  openCalendarLabel: 'Buchungszeitraum wählen',
});
calendarIntl.changes.next();
```

Component inputs have the highest precedence and remain unchanged when switching locale:

```html
<cima-time-picker [labels]="{ enterTime: 'Appointment time' }" />
<cima-datetime-picker #picker [labels]="{ hours: 'Start hour' }" />
<cima-datetime-range-picker startLabel="Arrival" endLabel="Departure" />
```

The range's optional `label`, `startLabel`, `endLabel`, and `invalidRangeLabel` override the corresponding global fields. Omit them to use the selected translation automatically. Inline time content supports partial `CimaTimeLabels` overrides; action labels come from the service.

## Manual or external translation systems

`CimaTimepickerIntl` retains its mutable fields and `changes` observable. Existing providers, Transloco, ngx-translate, or another translation system can continue to assign fields and then call `changes.next()`; none is a dependency. Direct field assignments are refreshed by the next `setLocale()` call; use its override argument or component inputs for customization that must survive locale changes.

You can replace or scope the service with `{ provide: CimaTimepickerIntl, useClass: MyTimepickerIntl }`. Coordinate the adapter and calendar service in the same injector scope as the pickers using them.

## Label reference

| Field | English default |
| --- | --- |
| `selectTime`, `enterTime` | Select time, Enter time |
| `hours`, `minutes`, `seconds` | Hour, Minute, Second |
| `am`, `pm`, `period` | AM, PM, Period |
| `invalidTime`, `unavailableTime` | Enter a valid time, This time is unavailable |
| `switchToInput`, `switchToClock` | Use keyboard, Use clock |
| `cancel`, `confirm` | Cancel, OK |
| `rangeLabel`, `rangeStart`, `rangeEnd` | Date and time range, Start, End |
| `invalidRange` | Choose a complete range with the end at or after the start, within the allowed limits. |

`CimaTimeLabels` contains the time-content fields. `CimaPickerLabels` extends it with actions and range labels. `CIMA_PICKER_TRANSLATIONS` exposes the built-in catalogs; `CimaPickerTranslation` groups picker labels and `CimaCalendarLabels`.

## Playground

The entire playground interface stays English. Its **Localization** selector offers `en-US`, `en-GB`, `it-IT`, `fr-FR`, `de-DE`, and `es-ES`; it changes only picker formats and internal labels. Headings, settings, example descriptions, validation explanations owned by the demo, and example buttons stay English. A deliberate local label override also remains English to demonstrate precedence.

Manual-entry hints use the same locale and precision as the input. The range's read-only summary and endpoint previews use the adapter locale, explicit hour cycle, and optional seconds. Changing Localization leaves `hourCycle` independent so you can test 12/24-hour views in any locale. See [Manual input](parsing.md) for localized AM/PM parsing and [Datetime range](datetime-range.md) for interval behavior.

For the implementation, see `setLocalization()` in [app.ts](https://github.com/CIMAFoundation/cima-material-datetime-picker/blob/main/projects/demo/src/app/app.ts) and the locale options in [demo-locales.ts](https://github.com/CIMAFoundation/cima-material-datetime-picker/blob/main/projects/demo/src/app/demo-locales.ts).

---

[Documentation index](README.md) · [API reference](api.md) · [Datetime range](datetime-range.md)
