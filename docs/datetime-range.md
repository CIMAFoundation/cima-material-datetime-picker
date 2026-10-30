# Datetime range picker

`CimaDatetimeRangePicker` is a standalone range control with an integrated read-only Material text field, calendar icon, and popup. It combines the public Material range calendar and two CIMA time pickers. This first version uses native `Date` endpoints and always confirms the interval with OK.

## Horizontal layout preview

<img src="https://raw.githubusercontent.com/CIMAFoundation/cima-material-datetime-picker/main/docs/images/datetime-range-horizontal.jpg" alt="Datetime range popup with start time, highlighted date range calendar, and end time in a horizontal layout" width="960">

## Setup

Import `CimaDatetimeRangePicker` and `ReactiveFormsModule`, configure your Material theme, and provide a native date adapter in the application (the library does not install one):

```typescript
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { CimaDatetimeRange, CimaDatetimeRangePicker } from '@cima-foundation/material-datetime-picker';

// Component metadata:
// imports: [ReactiveFormsModule, CimaDatetimeRangePicker]
// providers: [provideNativeDateAdapter()]

readonly range = new FormControl<CimaDatetimeRange | null>(null);
```

```html
<cima-datetime-range-picker
  [formControl]="range"
  layout="auto"
  timeView="input"
  hourCycle="24"
/>
```

`[(ngModel)]` and `[(value)]` are also supported; use only one binding mechanism per control. The component includes its own `mat-form-field`, read-only text input, calendar icon, and popup; do not wrap it in another `mat-form-field`. Click the field or icon, or press Enter, Space, or ArrowDown on the field, to open it. Manual text entry and parsing are intentionally unsupported. The playground includes a working example with layout selection, reset, and disabling.

## Values and selection

```typescript
interface CimaDatetimeRange {
  start: Date | null;
  end: Date | null;
}
```

Opening copies the current interval into a draft. An empty interval starts with 09:00 and 17:00 without writing to the form. Select a start day and then an end day. Selecting an earlier day starts a new range; selecting again after a complete range also starts a new selection. Material's default range strategy supplies the highlighted range and hover preview.

Dates and times remain provisional until OK. Both dates must be selected, both times must be valid, and the complete start datetime must be at or before the end datetime. Equal endpoints are allowed. Overnight intervals work by selecting an end day after the start day; an earlier end time on the same day is invalid and is never silently moved to tomorrow.

Cancel, Escape, backdrop clicks, and `close()` discard edits. Reset, an external Forms value replacement, and disabling cancel the session. Closing marks the form touched and restores focus to the trigger. Confirmed values are copied so consumers cannot mutate the internal dates through an event payload.

## Responsive layout

- `auto` (default): start time | range calendar | end time when the popup is wider than 850 px. At 850 px or narrower, the calendar, start time, and end time stack in one column without an intermediate two-column layout.
- `horizontal`: keeps the three columns; use when enough width is available.
- `vertical`: always stacks the calendar, start time, and end time in one column.

The vertical popup has a fixed width of 328 px, matching the time popup, and shrinks to fit narrower viewports. Automatic layout uses the same width when it switches to one column. The popup stays within the viewport and scrolls vertically; its actions remain visible. `timeView="input"` is the compact default; `timeView="clock"` and `allowViewSwitch` use the existing dial/numeric controls. Switching layout does not change the selected interval. A forced horizontal layout is intended for wide screens.

## Inputs

Text defaults below are the initial English labels. Omit label inputs to use the included translation selected by `CimaTimepickerIntl.setLocale(locale)`; explicit inputs always override it. See [Localization](internationalization.md) for the five included languages and fallback rules.

| Input | Default | Purpose |
| --- | --- | --- |
| `value` | `null` | `CimaDatetimeRange \| null`; supports `[(value)]` |
| `layout` | `'auto'` | `'auto'`, `'horizontal'`, or `'vertical'` |
| `timeView` | `'input'` | Initial numeric or clock view for both endpoints |
| `hourCycle` | `'24'` | `'12'` or `'24'` |
| `hourDial` | `'dual-ring'` | Layout of the 24-hour dials |
| `precision` | `'full'` | `'hours'` keeps minutes visible and disabled at 00, hides seconds, and limits selection to exact hours |
| `showSeconds` | `false` | Show seconds; existing hidden seconds are preserved |
| `allowViewSwitch` | `true` | Allow switching each time control's view |
| `disabled` | `false` | Combined with Angular Forms disabling |
| `min`, `max` | `null` | Inclusive full datetime bounds for the entire interval |
| `label` | `'Date and time range'` | Field and dialog label |
| `startLabel`, `endLabel` | `'Start'`, `'End'` | Endpoint headings |
| `invalidRangeLabel` | English validation message | Error text for a complete but invalid interval |

Calendar labels, endpoint previews, and the confirmed summary follow the supplied Material adapter's locale, including runtime `setLocale()` changes. Previews and summary respect `hourCycle` and `showSeconds`; `formatPreview(date)` exposes the same formatting for external summaries. Time, action, endpoint, field, and range-error labels default to `CimaTimepickerIntl`, including its built-in translations and fallback. The optional label inputs above override the global translation. Call `DateAdapter.setLocale(locale)` for the displayed formats and coordinate `MatDatepickerIntl` for calendar labels as shown in [Localization](internationalization.md). The playground itself stays English.

## Outputs and methods

- `valueChange`: confirmed bound interval for `[(value)]`.
- `confirmed`: copied complete interval after OK.
- `opened`, `closed`, `cancelled`: session events; cancellation never applies the draft.
- `open()`, `close()`, `confirm()`: programmatic session control.
- `isOpen()`: current popup state.
- `canConfirm`: whether the current draft can be applied.

Forms validation reports `cimaDatetimeRangeIncomplete`, `cimaDatetimeRangeOrder`, or `cimaDatetimeRangeBounds`. Invalid or reversed `min`/`max` configuration reports `cimaDatetimeRangeConfig`, even when the value is empty. A `null` value with valid configuration is left to Angular's `Validators.required`. Malformed external endpoints are retained as invalid dates internally and reported through Forms without attempting to parse them. The `min` and `max` dates limit calendar days as well as full endpoint instants; time portions are checked at confirmation. Changing bounds revalidates the form and the current draft.

Local times that do not exist during the spring daylight-saving transition are rejected instead of being silently shifted forward. An existing repeated autumn instant is preserved when confirmed unchanged; newly selected ambiguous local times follow the native Date choice. No additional timezone or offset selection is provided.

The popup's DOM and initial focus follow the visible layout: start time first horizontally, calendar first vertically. Tab navigation remains inside the dialog. Reset, disabling, and external value replacement cancel pending edits; changed bounds revalidate the current draft without applying it.

The first version does not include typed range inputs, recurring daily-time filters, minimum/maximum duration, alternate date adapters, or a timezone policy beyond native local `Date` behavior. It reuses the application's existing M2/M3 theme.

---

[Documentation index](README.md) · [API reference](api.md) · [Single datetime picker](datetime.md)

## Exact-hour selection

Set `precision="hours"` to edit/select hours only, with visible disabled minutes at 00 and hidden seconds. It overrides `showSeconds`. `precision="full"` is the default. AM/PM stays available. Form values supplied by the application are preserved and validated if not aligned to an exact hour; user edits/confirmation zero minutes and seconds. See [Hour-only precision](api.md#hour-only-precision) for completion behavior, validation, and examples.
