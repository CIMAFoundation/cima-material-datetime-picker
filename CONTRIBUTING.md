# Contributing

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

The demo imports library sources through a TypeScript alias. During development, `npm start` updates both projects without rebuilding the library package after each change. Build the library when checking distributable output.

The demo starts in English and supports switching between English and Italian. It includes global translations, local label overrides, and `ngModel` and Reactive Forms examples, and compares M2/M3 themes.

## Dependencies

TypeScript stays on the 6.0 release line supported by Angular 22. A targeted override sets Vite 8.3.5 for `@angular/build`, which still declares Vite 8.3.0 with known vulnerabilities. Remove the override when Angular Build includes the fix.

## Maintainer guides

- [Project status and development checklist](docs/status.md)
- [Package preparation and release](docs/releasing.md)
- [Demo documentation and GitHub Pages deployment](docs/deployment.md)
