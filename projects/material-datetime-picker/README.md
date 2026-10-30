# @cima-foundation/material-datetime-picker

Angular date, time, and **datetime range pickers** with **Material 3 (M3)** light and dark themes, numeric input, and clock dial views. Material 2 (M2) themes are also supported.

Targets Angular 22 and Angular Material 22. The major version follows Angular.

`CimaTimePicker` provides numeric and clock views, 12/24-hour display, optional seconds, configurable 24-hour ring layouts, Angular Forms support, and included English, Italian, French, German, and Spanish translations with English fallback and global/local overrides. M2 and M3 visual themes are supported on Material 22.

Use `precision="hours"` on time, datetime, or range pickers for exact-hour selection: minutes stay visible but disabled at 00, seconds are hidden, and the dial selects hours only. The default `precision="full"` retains minute and optional-second selection.

Daily `minTime`, `maxTime`, and `timeFilter` constraints support inclusive and overnight windows. The datetime input also supports `minDateTime` and `maxDateTime`; confirmation requires the complete pending date and time to satisfy every constraint. See the API and datetime guides for examples and validation errors.

## At a glance

Select a datetime range, choose a single date and time, or embed the time picker on its own. Switch between numeric input and clock dials, with light and dark Material themes.

### Datetime range · horizontal layout

<img src="https://raw.githubusercontent.com/CIMAFoundation/cima-material-datetime-picker/main/docs/images/datetime-range-horizontal.jpg" alt="Horizontal datetime range picker showing start October 19, 2026 at 09:00, a highlighted calendar range, and end October 22, 2026 at 17:00" width="960">

A range calendar between start and end time controls, with a compact vertical layout for mobile. Includes a read-only Material input, Angular Forms integration, inclusive datetime bounds, and explicit OK/Cancel confirmation. Numeric and clock views are supported. See the [datetime range guide](https://github.com/CIMAFoundation/cima-material-datetime-picker/blob/main/docs/datetime-range.md) for setup and API details.

### Single datetime and time pickers

| Date + time · numeric input · light | Standalone time · 24-hour dial · dark |
| --- | --- |
| <img src="https://raw.githubusercontent.com/CIMAFoundation/cima-material-datetime-picker/main/docs/images/datetime-light.png" alt="Material date and time popup with the calendar and numeric time input set to 14:30" width="294"> | <img src="https://raw.githubusercontent.com/CIMAFoundation/cima-material-datetime-picker/main/docs/images/time-dark.png" alt="Standalone time picker in the dark theme with a single-ring 24-hour clock dial" width="294"> |

| Date + time · 12-hour numeric input · PM | Standalone time · 12-hour dial · AM |
| --- | --- |
| <img src="https://raw.githubusercontent.com/CIMAFoundation/cima-material-datetime-picker/main/docs/images/datetime-12h-light.png" alt="Light datetime popup showing 02:30 PM with the AM/PM selector" width="294"> | <img src="https://raw.githubusercontent.com/CIMAFoundation/cima-material-datetime-picker/main/docs/images/time-12h-dark.png" alt="Dark time picker showing 07:00 AM with a 12-hour clock dial and AM/PM selector" width="294"> |

```html
<cima-time-picker
  [(ngModel)]="time"
  hourCycle="24"
  hourDial="dual-ring"
  [showSeconds]="false"
/>
```

Import the standalone `CimaTimePicker` component and `FormsModule` for this example. The value is `CimaTime | null`: `{ hours, minutes, seconds }`, always using 24-hour values.

## Installation

Available on [npm](https://www.npmjs.com/package/@cima-foundation/material-datetime-picker).

```sh
npm install @cima-foundation/material-datetime-picker
```

```typescript
import { CimaTimePicker } from '@cima-foundation/material-datetime-picker';
```

For M2 themes, include the recommended Sass bridge alongside the application’s Material theme:

```scss
@use '@cima-foundation/material-datetime-picker/theming' as cima;

// $theme is the application's M2 theme.
html {
  @include cima.m2-theme($theme);
}
```

See the theming guide for the complete setup. For local testing, follow the getting started guide.

The standalone `CimaDatetimeRangePicker` combines a range calendar and two time controls, with responsive layouts, Angular Forms integration, and explicit confirmation.

## Guides

- [Documentation index](https://github.com/CIMAFoundation/cima-material-datetime-picker/blob/main/docs/README.md)
- [Changelog](https://github.com/CIMAFoundation/cima-material-datetime-picker/blob/main/docs/CHANGELOG.md)
- [Getting started](https://github.com/CIMAFoundation/cima-material-datetime-picker/blob/main/docs/getting-started.md)
- [API reference](https://github.com/CIMAFoundation/cima-material-datetime-picker/blob/main/docs/api.md)
- [Forms and values](https://github.com/CIMAFoundation/cima-material-datetime-picker/blob/main/docs/forms.md)
- [Datetime range](https://github.com/CIMAFoundation/cima-material-datetime-picker/blob/main/docs/datetime-range.md)
- [Datetime input, picker, and toggle](https://github.com/CIMAFoundation/cima-material-datetime-picker/blob/main/docs/datetime.md)
- [Time input and popup API](https://github.com/CIMAFoundation/cima-material-datetime-picker/blob/main/docs/popups.md)
- [Manual input and custom formats](https://github.com/CIMAFoundation/cima-material-datetime-picker/blob/main/docs/parsing.md)
- [Theming](https://github.com/CIMAFoundation/cima-material-datetime-picker/blob/main/docs/theming.md)
- [Internationalization](https://github.com/CIMAFoundation/cima-material-datetime-picker/blob/main/docs/internationalization.md)
- [Project status and checklist](https://github.com/CIMAFoundation/cima-material-datetime-picker/blob/main/docs/status.md)

Run `npm start` from the repository root for the live examples. The datetime input, picker, and toggle are public library controls. The standalone time-input popup, input, and toggle are public too. Both external inputs support strict local manual parsing, Forms validation, and a replaceable `CimaInputFormats` service. See the guides for precision, confirmation, increments, and controlled opening.

The guide links target the source repository.

## License

MIT © 2026 CIMA Foundation. See LICENSE.
