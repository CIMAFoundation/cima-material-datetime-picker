# Internationalization

`CimaTimepickerIntl` is a global service provided by the library. Its default labels are English. Like `MatDatepickerIntl`, it exposes mutable label fields and a `changes` observable. Call `changes.next()` after changing the language to refresh existing OnPush components, including open pickers.

```typescript
import { inject } from '@angular/core';
import { CimaTimepickerIntl } from '@cima-foundation/material-datetime-picker';

// Inside the component or service managing the application's language:
const intl = inject(CimaTimepickerIntl);
Object.assign(intl, {
  selectTime: 'Select a time', enterTime: 'Enter a time',
  hours: 'Hour', minutes: 'Minute', seconds: 'Second',
  period: 'Period', invalidTime: 'Enter a valid time', unavailableTime: 'This time is unavailable', am: 'AM', pm: 'PM',
  switchToInput: 'Use keyboard', switchToClock: 'Use clock',
  cancel: 'Cancel', confirm: 'OK',
});
intl.changes.next();
```

You can replace the service with a provider such as `{ provide: CimaTimepickerIntl, useClass: MyTimepickerIntl }`, optionally scoped to a component and its descendants. Transloco, ngx-translate, or another translation system can populate these fields; none is a package dependency.

The `labels` input overrides only the specified fields:

```html
<cima-time-picker
  timeView="input"
  [labels]="{ enterTime: 'Appointment time' }"
/>
```

`cancel` and `confirm` belong to the service and are used by the public popup and datetime controls. The timepicker content does not create its own confirmation buttons.

Label language and value format are separate. The service changes neither `hourCycle` nor form values. External input formats and AM/PM parsing follow the date adapter locale independently of translated button labels; see [Manual input](parsing.md). The calendar continues to use `MAT_DATE_LOCALE`, `DateAdapter.setLocale()`, and `MatDatepickerIntl`; the library does not override them. The demo explicitly coordinates the two services with its English/Italian language selector and starts in English. The surrounding demo interface remains English.

## Label reference

| Field | English default |
| --- | --- |
| `selectTime` | Select time |
| `enterTime` | Enter time |
| `hours` | Hour |
| `minutes` | Minute |
| `seconds` | Second |
| `am`, `pm` | AM, PM |
| `period` | Period |
| `invalidTime` | Enter a valid time |
| `unavailableTime` | This time is unavailable |
| `switchToInput` | Use keyboard |
| `switchToClock` | Use clock |
| `cancel`, `confirm` | Cancel, OK |

All fields except `cancel` and `confirm` are part of `CimaTimeLabels` and the local `labels` input. `cancel` and `confirm` are service fields for the container's actions.

For a working two-language example, see [demo-locales.ts](https://github.com/CIMAFoundation/cima-material-datetime-picker/blob/main/projects/demo/src/app/demo-locales.ts) and `setLanguage()` in [app.ts](https://github.com/CIMAFoundation/cima-material-datetime-picker/blob/main/projects/demo/src/app/app.ts). Labels from Italian dictionaries are intentional example translations; the guide and surrounding demo UI remain English.

---

[Documentation index](README.md) · [API reference](api.md) · [Project status](status.md)
