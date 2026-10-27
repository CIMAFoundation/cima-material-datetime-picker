# Documentation

Cima Material Datetime Picker is an Angular 22 / Angular Material 22 library in development. These guides describe the current implementation, not a future API.

## Start here

1. [Getting started](getting-started.md): requirements, local installation, imports, and the first picker.
2. [Forms and values](forms.md): Reactive Forms, ngModel, value binding, reset, and validation.
3. [Datetime control](datetime.md): public input, picker, toggle, and complete Date values.
4. [Time input and popup](popups.md): public anchored time input and optional confirmation actions.
5. [Manual input and formats](parsing.md): strict locale parsing, precision, errors, and custom formatting.

## Reference and customization

- [API reference](api.md): selector, value types, inputs, outputs, and interaction rules.
- [Theming](theming.md): Material 2/3 setup, overlays, and supported CSS variables.
- [Internationalization](internationalization.md): global labels, local overrides, and runtime language switching.
- [Project status](status.md): implemented features, limitations, accessibility coverage, and remaining work.

## Public controls and reusable content

`CimaTimePicker` is currently the public standalone time-selection component. It can be used inline with Angular Forms or value binding.

The combined datetime input, picker, and toggle are public library APIs using the original Material datepicker panel. The standalone time input, popup, and toggle are also public APIs built with CDK Overlay. Both external inputs support manual entry; the inline component remains reusable without an input or popup.

Run `npm start` from the repository root to explore the live demo, including the source snippets below its popup examples. The demo starts in English and includes Italian translation examples.

---

[Documentation index](README.md) · [API reference](api.md) · [Project status](status.md)
