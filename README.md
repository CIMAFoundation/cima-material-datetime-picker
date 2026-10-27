# Cima Material Datetime Picker

An Angular 22 and Angular Material 22 library in development, rebuilt from scratch around Material 2 and Material 3 references.

## At a glance

Choose a combined date and time picker or embed the time picker on its own. Switch between numeric input and a clock dial, with light and dark Material themes.

| Date + time · numeric input · light | Standalone time · 24-hour dial · dark |
| --- | --- |
| <img src="https://raw.githubusercontent.com/CIMAFoundation/cima-material-datetime-picker/main/docs/images/datetime-light.png" alt="Material date and time popup with the calendar and numeric time input set to 14:30" width="294"> | <img src="https://raw.githubusercontent.com/CIMAFoundation/cima-material-datetime-picker/main/docs/images/time-dark.png" alt="Standalone time picker in the dark theme with a single-ring 24-hour clock dial" width="294"> |

## Development

Requires Node.js 22.22.3 or another version supported by Angular 22. Installation has been verified with npm 11.21.1.

```sh
nvm use
npx npm@11.21.1 ci
npm start
```

- `npm run build`: build the demo.
- `npm run build:lib`: build the library package.
- `npm test -- --watch=false`: run the demo tests with Vitest.
- `npm run test:lib -- --watch=false`: run the library tests.

The library exposes `CimaTimePicker`: numeric input and clock dial views, 12/24-hour display, optional seconds, and Angular Forms integration. The demo compares M2/M3 themes and places the timepicker inside the original Material datepicker's actions area.

The demo imports library sources through a TypeScript alias. During development, `npm start` updates both projects without rebuilding the library package after each change.

The demo starts in English and supports switching between English and Italian. It includes global translations, local label overrides, and `ngModel` and Reactive Forms examples. `CimaTimepickerIntl` manages timepicker labels; the calendar retains Material's `DateAdapter` and `MatDatepickerIntl`.

The public datetime input, picker, and toggle share one native Date value with Angular Forms and show the complete date and time in the input. Date-only, recurring-time (including overnight), and complete datetime bounds and filtering are supported. Both external inputs support strict localized manual parsing with Forms errors. The standalone time-input popup, input, and toggle are public controls, with automatic or explicit confirmation. Datetime also exposes writable opened state, pending day selection, and all three time increments. Ranges remain outside the current scope.

See the [documentation index](docs/README.md) for setup, API reference, integration guides, theming, translations, and the development checklist. The [library README](projects/material-datetime-picker/README.md) provides a short introduction.

## Dependencies

TypeScript stays on the 6.0 release line supported by Angular 22. A targeted override sets Vite 8.3.5 for `@angular/build`, which still declares Vite 8.3.0 with known vulnerabilities. Remove the override when Angular Build includes the fix.

## npm package preparation

The public package name is `@cima-foundation/material-datetime-picker`, with initial version `22.0.0` aligned to Angular 22. The root workspace remains private; only `dist/material-datetime-picker` is the distributable package.

```sh
npm run build:lib
npm pack ./dist/material-datetime-picker --dry-run
```

These commands build and inspect the package locally without publishing. The package includes the public JavaScript/TypeScript API, the `@cima-foundation/material-datetime-picker/theming` Sass entry point and README with links to the guides. Licensed under MIT; see [LICENSE](LICENSE).

## Releasing to npm

Install GitHub CLI (`gh`), authenticate with `gh auth login` and `npm login`, and commit and push all changes to `main`. The npm account needs publishing access to `@cima-foundation`.

```sh
npm run release -- --dry-run
npm run release
```

The dry run checks prerequisites and proposes a patch version without building or publishing. It fetches remote tags but does not change working files. The release uses the highest stable version from merged `vX.Y.Z` tags, the library manifest, and npm. With no tags, the first proposed release after `22.0.0` is `22.0.1`.

Accept the proposed version or enter a higher stable version. The script runs library and demo tests, builds the library once, and inspects the npm package. After final confirmation, it commits the library version, creates an annotated tag, pushes branch and tag atomically, publishes to npm, and creates a GitHub Release with generated notes. npm may request browser authentication.

Failures before the release commit restore the original manifest. After a commit or publication, the script preserves the release state and prints recovery guidance: inspect Git and npm before retrying, because an npm version cannot be overwritten.

## Demo documentation and GitHub Pages

The demo serves the existing Markdown guides from `docs/`, without a second documentation source. Open `/#/docs/getting-started` or use **Documentation** in the demo navigation. Guides are loaded on demand and share the demo's light/dark theme.

Restart `npm start` after changing the Angular asset configuration so the development server picks up the guides.

```sh
npm run build:pages
```

This prepares `dist/demo/browser` for hosting at `/cima-material-datetime-picker/`. Hash routes also support direct links and refreshes on static GitHub Pages hosting. The output includes the Markdown assets. The local build command does not upload or publish anything.

In the repository settings, select **Pages → Build and deployment → Source → GitHub Actions**. The `Deploy demo to GitHub Pages` workflow builds and publishes the demo on every push to `main`; it can also be started manually from the Actions tab.

The published demo is available at https://CIMAFoundation.github.io/cima-material-datetime-picker/.
