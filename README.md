# Cima Material Datetime Picker

Angular 22 date, time, and **datetime range pickers** with **Material 3 (M3)** light and dark themes, numeric input, and clock dial views. Built on Angular Material 22, with Material 2 (M2) theme support as well.

## At a glance

Select a datetime range, choose a single date and time, or embed the time picker on its own. Switch between numeric input and clock dials, with light and dark Material themes.

### Datetime range · horizontal layout

<img src="https://raw.githubusercontent.com/CIMAFoundation/cima-material-datetime-picker/main/docs/images/datetime-range-horizontal.jpg" alt="Horizontal datetime range picker showing start October 19, 2026 at 09:00, a highlighted calendar range, and end October 22, 2026 at 17:00" width="960">

A range calendar between start and end time controls, with a compact vertical layout for mobile. Includes a read-only Material input, Angular Forms integration, inclusive datetime bounds, and explicit OK/Cancel confirmation. Numeric and clock views are supported. See the [datetime range guide](docs/datetime-range.md) for setup and API details.

### Single datetime and time pickers

| Date + time · numeric input · light | Standalone time · 24-hour dial · dark |
| --- | --- |
| <img src="https://raw.githubusercontent.com/CIMAFoundation/cima-material-datetime-picker/main/docs/images/datetime-light.png" alt="Material date and time popup with the calendar and numeric time input set to 14:30" width="294"> | <img src="https://raw.githubusercontent.com/CIMAFoundation/cima-material-datetime-picker/main/docs/images/time-dark.png" alt="Standalone time picker in the dark theme with a single-ring 24-hour clock dial" width="294"> |

| Date + time · 12-hour numeric input · PM | Standalone time · 12-hour dial · AM |
| --- | --- |
| <img src="https://raw.githubusercontent.com/CIMAFoundation/cima-material-datetime-picker/main/docs/images/datetime-12h-light.png" alt="Light datetime popup showing 02:30 PM with the AM/PM selector" width="294"> | <img src="https://raw.githubusercontent.com/CIMAFoundation/cima-material-datetime-picker/main/docs/images/time-12h-dark.png" alt="Dark time picker showing 07:00 AM with a 12-hour clock dial and AM/PM selector" width="294"> |

## Demo

Explore the [live demo](https://CIMAFoundation.github.io/cima-material-datetime-picker/), including interactive examples and documentation in light and dark themes.

## Installation and first picker

Available on [npm](https://www.npmjs.com/package/@cima-foundation/material-datetime-picker).

```sh
npm install @cima-foundation/material-datetime-picker
```

Targets Angular 22, Angular Forms 22, and Angular Material/CDK 22. The major version follows Angular.

For installation in a consuming application, follow the [getting started guide](docs/getting-started.md), which includes building and installing a local package.

Import the standalone component and bind a `CimaTime | null` value:

```typescript
import { Component, signal } from '@angular/core';
import { CimaTime, CimaTimePicker } from '@cima-foundation/material-datetime-picker';

@Component({
  selector: 'app-time-example',
  imports: [CimaTimePicker],
  template: `<cima-time-picker [(value)]="time" hourCycle="24" />`,
})
export class TimeExample {
  readonly time = signal<CimaTime | null>({ hours: 9, minutes: 30, seconds: 0 });
}
```

Configure an Angular Material theme using the [theming guide](docs/theming.md). Time-only controls do not require a date adapter.

## Features

- Datetime range picker with a range calendar, start/end time controls, responsive horizontal/vertical layouts, and atomic confirmation.
- Inline time picker, standalone time-input popup, and combined datetime input, picker, and toggle.
- Hour-only selection with visible disabled minutes, across time, datetime, and datetime ranges.
- Numeric input and clock dial views, 12/24-hour display, optional seconds, and configurable time increments.
- Angular Forms integration, strict localized manual input, and validation errors.
- Date, time, and complete datetime bounds and filters, including overnight time windows.
- Material 2/3 themes and included English, Italian, French, German, and Spanish translations, with English fallback and local overrides.

Datetime controls share a native `Date` value; time-only controls use `{ hours, minutes, seconds }`. The [datetime range picker](docs/datetime-range.md) uses `{ start, end }` Date endpoints with a responsive calendar and two time controls.

## Documentation

- [Documentation index](docs/README.md)
- [Changelog](docs/CHANGELOG.md)
- [Getting started](docs/getting-started.md)
- [API reference](docs/api.md)
- [Forms and values](docs/forms.md)
- [Datetime controls](docs/datetime.md)
- [Datetime range](docs/datetime-range.md)
- [Time input and popup](docs/popups.md)
- [Manual input and custom formats](docs/parsing.md)
- [Theming](docs/theming.md)
- [Internationalization](docs/internationalization.md)

## Contributing and maintenance

See [Contributing](CONTRIBUTING.md) for local development and tests, [the release guide](docs/releasing.md) for package preparation and publishing, and [the deployment guide](docs/deployment.md) for GitHub Pages setup.

## License

Licensed under MIT. See [LICENSE](LICENSE).
