# Documentation

Cima Material Datetime Picker is an Angular 22 / Angular Material 22 library in development. These guides describe the current implementation, not a future API.

## Start here

1. [Getting started](getting-started.md): requirements, local installation, imports, and the first picker.
2. [Forms and values](forms.md): Reactive Forms, ngModel, value binding, reset, and validation.
3. [Datetime control](datetime.md): public input, picker, toggle, and complete Date values.
4. [Time input and popup](popups.md): public anchored time input and optional confirmation actions.
5. [Manual input and formats](parsing.md): strict locale parsing, precision, errors, and custom formatting.

6. [Datetime range](datetime-range.md): responsive range calendar, start/end times, and atomic confirmation.

## Reference and customization

- [API reference](api.md): selector, value types, hour-only precision, inputs, outputs, and interaction rules.
- [Theming](theming.md): Material 2/3 setup, overlays, and supported CSS variables.
- [Internationalization](internationalization.md): included translations, locale fallback, application overrides, and runtime localization.
- [Project status](status.md): implemented features, limitations, accessibility coverage, and remaining work.

## Contributing and maintenance

- [Changelog](CHANGELOG.md): release history and user-facing changes.
- [npm package](https://www.npmjs.com/package/@cima-foundation/material-datetime-picker): published versions and installation.
- [Contributing](../CONTRIBUTING.md): development environment, commands, tests, and dependency notes.
- [Package preparation and release](releasing.md): package checks, publishing, and recovery.
- [Demo deployment](deployment.md): documentation assets and GitHub Pages setup.

## Public controls and reusable content

`CimaTimePicker` is currently the public standalone time-selection component. It can be used inline with Angular Forms or value binding.

The combined datetime input, picker, and toggle are public library APIs using the original Material datepicker panel. The standalone time input, popup, and toggle are also public APIs built with CDK Overlay. Both external inputs support manual entry; the inline component remains reusable without an input or popup.

Run `npm start` from the repository root to explore the live demo, including the source snippets below its popup examples. The demo interface always stays English. Its Localization selector offers en-US, en-GB, it-IT, fr-FR, de-DE, and es-ES for picker formats and internal labels.

---

[Documentation index](README.md) · [API reference](api.md) · [Project status](status.md)
