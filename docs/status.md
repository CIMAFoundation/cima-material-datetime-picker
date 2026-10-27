# Project status

## Current scope

The public library targets Angular, Angular Forms, Material, and CDK 22. The demo and guides are English-first. The package is still in development and is not ready for publication.

The core timepicker has unit coverage for time values, forms, localization, pointer interaction, dial layouts, and selection completion. Demo tests cover locale changes, popup drafts, confirmation, cancellation, and optional actions. Browser checks have exercised both visual themes and the main popup workflows. These checks are not a full accessibility, browser, or mobile certification.

## Known limitations

- Public time and datetime inputs support manual localized text entry and popup selection.
- Default parsing targets native Date, numeric Gregorian dates, Latin digits, and explicit 12/24-hour formats. Other adapters/calendars and specialized formats require a custom service and verification.
- There is no timezone conversion or configurable DST ambiguity policy. Manual parsing rejects nonexistent local times; popup confirmation uses native adapter normalization.
- Date-only, recurring-time, and full-datetime constraints are implemented. Ranges remain outside the current scope.
- Steps are interaction increments, not validation constraints.
- The single-ring 24-hour dial and seconds are library extensions to the Material reference behavior.
- Full keyboard/screen-reader, mobile, RTL, and dark-theme audits remain open.
- The demo production build exceeds its initial bundle warning budget (about 916 kB versus 500 kB) and the timepicker component style warning budget (about 4.57 kB versus 4 kB); optimization remains to be done.
- The calendar composition has only been exercised with the native date adapter.

## Implementation checklist


This checklist separates implemented features from decisions that still need to become APIs. An option being available on Material's calendar does not mean it is already connected to our datetime control.

- [x] Reusable timepicker content with numeric and clock views.
- [x] Alternative single-ring 24-hour dial (default), with selectable Material dual-ring layout.
- [x] Connected `value`, `timeView`, `allowViewSwitch`, `hourCycle`, `showSeconds`, steps, `disabled`, and `labels` inputs.
- [x] Exposed `valueChange`, `timeViewChange`, `timeChange`, and `selectionComplete` outputs.
- [x] Angular Forms integration: Reactive Forms, `ngModel`, reset, disabled, touched, and `invalidTime` validation for invalid incoming values.
- [x] Numeric popup completion requires Enter; AM/PM and cancellation remain editable without premature confirmation.
- [x] M2/M3 themes with separate typography and corner radii.
- [x] Global `CimaTimepickerIntl`, partial local overrides, and runtime language switching.
- [x] English/Italian demo coordinated with `DateAdapter` and `MatDatepickerIntl`.
- [x] `ngModel` and Reactive Forms examples with reset, required, and disabled state.
- [x] Demo below the original calendar, dividers, and Material Apply/Cancel buttons.
- [x] Manual verification of datetime confirmation and cancellation in the demo.
- [x] Time input with anchored popup demo, optional actions (hidden by default), automatic final-unit confirmation, visible datetime/time template syntax, and keyboard/focus checks.
- [x] Public datetime input, picker, and toggle with complete native Date values and Forms integration.
- [x] Native datetime panel lifecycle, cancellation, reset, disabled, invalid Date validation, and complete input formatting.
- [x] Forward native Material display/navigation options and support writable opened state with lifecycle events: `startAt`, `startView`, `disabled`, `opened`, `touchUi`, `xPosition`, `yPosition`, `restoreFocus`, `dateClass`, `panelClass`, `calendarHeaderComponent`, and `color` (M2).
- [x] Connect `min`, `max`, and `cimaDatetimePickerFilter` to native calendar exclusions and form validation, preserving date-only semantics.
- [x] Public datetime events: `opened`, `closed`, `yearSelected`, `monthSelected`, `viewChanged`, `dateInput`, and `dateChange`, with documented semantics for the complete value.
- [x] Public datetime methods: `open()` and `close()`.
- [x] Public datetime method: `select(date)` changes the pending day while open and requires OK.
- [x] Time constraints: `minTime`, `maxTime`, and `timeFilter`, including inclusive overnight windows.
- [x] Complete datetime constraints: `minDateTime`, `maxDateTime`, shared form/draft validation, errors, and disabled OK for invalid candidates.
- [x] Datetime events: `confirmed` and `cancelled`; native Escape and backdrop-click behavior.
- [x] Strict time/datetime manual parsing, locale-aware formats, dedicated parse errors, precision policy, and replaceable `CimaInputFormats` for native Date.
- [x] Datetime time increments and partial local time labels connected to selection content.
- [ ] Verify alternative adapters and additional calendar/numeral systems.
- [ ] Datetime ranges based on Material's range model.
- [x] Public standalone time input, anchored dialog, toggle, Forms validation, optional actions, and automatic final-unit confirmation.
- [x] Inline time content remains reusable independently of the popup.
- [ ] Full accessibility, mobile, RTL, and dark-theme verification.
- [ ] Supported adapter documentation, npm packaging, and publication preparation.

`writeValue`, `registerOnChange`, `registerOnTouched`, and `setDisabledState` implement the Angular Forms contract; they are separate from the datetime picker’s public `open()` and `close()` methods.


## Verification of this milestone

- 98 library tests and 7 demo/documentation tests pass (105 total).
- Library tests run with `TZ=Europe/Rome`, including spring-gap rejection and native autumn repeated-time handling.
- Added integration coverage for text events, parse versus constraint errors, required/reset/disabled, hidden seconds, runtime locale, custom format providers, ngModel, popup drafts, backdrop/Escape/focus, explicit and automatic numeric confirmation, writable opened state, pending select(), Material options, touch UI, labels, and increments.
- Library and demo production builds succeed. The demo budget limits are unchanged; scoped standalone imports and M2 styles for the components actually used keep the initial bundle at 916.15 kB.
- Browser smoke checks cover invalid/valid manual entry in English/Italian, public popup opening, numeric Enter completion, optional actions, focus restoration, M3 light, and M2 dark. These are targeted checks, not a full accessibility or device audit.
- The original Material closed event can precede its final focus-restoration timer; lifecycle tests allow that native cleanup to complete before immediate programmatic reopening.

## Next milestones

1. Complete accessibility, keyboard/screen-reader, mobile, RTL, and theme verification.
2. Assess additional adapter/calendar formats and application timezone requirements.
3. Optimize demo/style budgets and finish packaging/license/release review before publication.

Ranges are deliberately excluded from this milestone. No package or site is published by the verification commands.

---

[Documentation index](README.md) · [API reference](api.md) · [Project status](status.md)
