# Getting started

## Requirements

- Angular, Angular Forms, Angular Material, and Angular CDK 22.
- An Angular Material theme. Both M2 and M3 visual themes are supported on Material 22.
- For repository development: Node.js 22.22.3 or another version accepted by Angular 22. Installation is verified with npm 11.21.1.

Earlier Angular versions are not part of the current support target. M2 refers to a visual theme, not Angular Material version 2.

## Run the repository

```sh
nvm use
npx npm@11.21.1 ci
npm start
```

The demo imports the library's source entry point through a TypeScript alias. You do not need to rebuild the package after every edit.

```sh
npm run test:lib -- --watch=false
npm test -- --watch=false
npm run build:lib
npm run build
```

Build the library when checking distributable output. The demo currently exceeds its initial bundle warning budget; see [project status](status.md).

## Use a local library package

The package is not published or ready for production release. To test it in another Angular 22 application, first build and pack the local source:

```sh
npm run build:lib
npm pack ./dist/material-datetime-picker
```

Then install the generated tarball in the consuming application, using its actual absolute path:

```sh
npm install /absolute/path/cima-foundation-material-datetime-picker-22.0.0.tgz
```

The consuming application needs the Angular 22 peer dependencies listed above. The intended registry name is `@cima-foundation/material-datetime-picker`, version `22.0.0`; the major version follows Angular.

## First picker

Import `CimaTimePicker` in a standalone component:

```typescript
import { Component, signal } from '@angular/core';
import { CimaTime, CimaTimePicker } from '@cima-foundation/material-datetime-picker';

@Component({
  selector: 'app-time-example',
  imports: [CimaTimePicker],
  template: `
    <cima-time-picker [(value)]="time" hourCycle="24" />
  `,
})
export class TimeExample {
  readonly time = signal<CimaTime | null>({ hours: 9, minutes: 30, seconds: 0 });
}
```

The timepicker renders selection content, not an outer dialog or a form-field input. Use the public `CimaTimePickerInput`, `CimaTimePickerPopup`, and `CimaTimePickerToggle` for an input-triggered panel, or supply a custom host. No date adapter is required for time-only content.

Configure a [theme](theming.md) before checking its appearance. Continue with [Forms and values](forms.md) for form controls or [popup examples](popups.md) for an input-triggered panel.

---

[Documentation index](README.md) · [API reference](api.md) · [Project status](status.md)
