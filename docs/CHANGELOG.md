# Changelog

## Unreleased

### Added
- Datetime range picker with a readonly Material input, range calendar, start/end times, responsive layouts, Angular Forms, and inclusive datetime bounds.
- Hour-only precision across time, datetime, and range pickers: minutes remain visible and disabled at 00, seconds are hidden, and dial selection completes after hours.
- Included English, Italian, French, German, and Spanish picker/calendar translations, with locale/language fallback and application overrides.

### Changed
- Use the Material dual-ring layout by default; the optional single ring now displays all 24 hour labels.
- Apply valid time popup edits immediately when confirmation buttons are hidden. With buttons, edits remain provisional until OK.
- Keep the playground interface in English, with six Localization options, new examples, and updated guides.

### Fixed
- Open readonly time, datetime, and range pickers from the entire Material field.
- Keep range previews and summaries synchronized with the calendar locale and selected time precision.
- Reject nonexistent DST times, malformed ranges, and invalid bounds; preserve unchanged repeated-time instants and match keyboard order to the responsive layout.

## 22.0.4 - 2026-10-30

- Select the full numeric time field on focus or click and automatically advance to the next field after two digits.
- Clamp typed or pasted time values to the allowed hour, minute, and second ranges immediately.
- Focus the hours control when opening the time popup and avoid triggering the mobile keyboard before showing the clock dial.
- Improve the demo's responsive layout and navigation, with independent view controls for datetime and time popups and direct access to npm and the changelog.

## 22.0.3 - 2026-10-28

- Keep confirmation and cancel buttons visible while scrolling the datetime picker's time controls.
- Prevent the view-switch button from being clipped in the datetime popup.

## 22.0.2 - 2026-10-27

- Apply `panelClass` consistently to the datetime calendar, time controls, and popup actions.
- Improve Material 2 theme colors and fallback styling for time controls and popups.

## 22.0.1 - 2026-10-27

- Keep the datetime picker and toggle in sync when the input or Angular Forms disabled state changes.

## 22.0.0 - 2026-10-27

- Initial release for Angular 22 and Angular Material 22, with Material 2/3 themes.
- Combined datetime picker, standalone time popup, and inline time picker with numeric and clock views, 12/24-hour display, and optional seconds.
- Angular Forms integration, localized manual input, translations, and configurable date/time bounds, filters, and increments.
