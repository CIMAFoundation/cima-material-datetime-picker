# @cima-foundation/material-datetime-picker

Version 22.0.0 targets Angular 22 and Angular Material 22. The major version follows Angular. This release is being prepared locally and has not been published.

`CimaTimePicker` provides numeric and clock views, 12/24-hour display, optional seconds, configurable 24-hour ring layouts, Angular Forms support, and global/local translations. M2 and M3 visual themes are supported on Material 22.

Daily `minTime`, `maxTime`, and `timeFilter` constraints support inclusive and overnight windows. The datetime input also supports `minDateTime` and `maxDateTime`; confirmation requires the complete pending date and time to satisfy every constraint. See the API and datetime guides for examples and validation errors.

## At a glance

Choose a combined date and time picker or embed the time picker on its own. Switch between numeric input and a clock dial, with light and dark Material themes.

| Date + time · numeric input · light | Standalone time · 24-hour dial · dark |
| --- | --- |
| <img src="https://raw.githubusercontent.com/CIMAFoundation/cima-material-datetime-picker/main/docs/images/datetime-light.png" alt="Material date and time popup with the calendar and numeric time input set to 14:30" width="294"> | <img src="https://raw.githubusercontent.com/CIMAFoundation/cima-material-datetime-picker/main/docs/images/time-dark.png" alt="Standalone time picker in the dark theme with a single-ring 24-hour clock dial" width="294"> |

```html
<cima-time-picker
  [(ngModel)]="time"
  hourCycle="24"
  hourDial="single-ring"
  [showSeconds]="false"
/>
```

Import the standalone `CimaTimePicker` component and `FormsModule` for this example. The value is `CimaTime | null`: `{ hours, minutes, seconds }`, always using 24-hour values.

## Installation

Once version 22.0.0 is published:

```sh
npm install @cima-foundation/material-datetime-picker@22.0.0
```

```typescript
import { CimaTimePicker } from '@cima-foundation/material-datetime-picker';
```

For M2 themes, import the Sass bridge after Angular Material:

```scss
@use '@cima-foundation/material-datetime-picker/theming' as cima;
```

See the theming guide for the complete setup. For local testing before publication, follow the getting started guide.

## Guides

- [Documentation index](https://github.com/CIMAFoundation/cima-material-datetime-picker/blob/main/docs/README.md)
- [Getting started](https://github.com/CIMAFoundation/cima-material-datetime-picker/blob/main/docs/getting-started.md)
- [API reference](https://github.com/CIMAFoundation/cima-material-datetime-picker/blob/main/docs/api.md)
- [Forms and values](https://github.com/CIMAFoundation/cima-material-datetime-picker/blob/main/docs/forms.md)
- [Datetime input, picker, and toggle](https://github.com/CIMAFoundation/cima-material-datetime-picker/blob/main/docs/datetime.md)
- [Time input and popup API](https://github.com/CIMAFoundation/cima-material-datetime-picker/blob/main/docs/popups.md)
- [Manual input and custom formats](https://github.com/CIMAFoundation/cima-material-datetime-picker/blob/main/docs/parsing.md)
- [Theming](https://github.com/CIMAFoundation/cima-material-datetime-picker/blob/main/docs/theming.md)
- [Internationalization](https://github.com/CIMAFoundation/cima-material-datetime-picker/blob/main/docs/internationalization.md)
- [Project status and checklist](https://github.com/CIMAFoundation/cima-material-datetime-picker/blob/main/docs/status.md)

Run `npm start` from the repository root for the live examples. The datetime input, picker, and toggle are public library controls. The standalone time-input popup, input, and toggle are public too. Both external inputs support strict local manual parsing, Forms validation, and a replaceable `CimaInputFormats` service. See the guides for precision, confirmation, increments, and controlled opening.

The guide links target the source repository. License selection and final release review remain pending before publication.
