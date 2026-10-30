# Package preparation and release

## npm package preparation

The public package name is `@cima-foundation/material-datetime-picker`, with initial version `22.0.0` aligned to Angular 22. The root workspace remains private; only `dist/material-datetime-picker` is the distributable package.

```sh
npm run build:lib
npm pack ./dist/material-datetime-picker --dry-run
```

These commands build and inspect the package locally without publishing. The package includes the public JavaScript/TypeScript API, the `@cima-foundation/material-datetime-picker/theming` Sass entry point and README with links to the guides. Licensed under MIT; see [LICENSE](../LICENSE).

## Releasing to npm

Install GitHub CLI (`gh`), authenticate with `gh auth login` and `npm login`, and commit and push all changes to `main`. The npm account needs publishing access to `@cima-foundation`.

```sh
npm run release -- --dry-run
npm run release
```

The dry run checks prerequisites and proposes a patch version without building or publishing. It fetches remote tags but does not change working files. The release uses the highest stable version from merged `vX.Y.Z` tags, the library manifest, and npm. With no tags, the first proposed release after `22.0.0` is `22.0.1`.

Accept the proposed version or enter a higher stable version. The script runs library and demo tests, builds the library once, and inspects the npm package. After final confirmation, it commits the library version, creates an annotated tag, pushes branch and tag atomically, publishes to npm, and creates a GitHub Release with generated notes. npm may request browser authentication.

Failures before the release commit restore the original manifest. After a commit or publication, the script preserves the release state and prints recovery guidance: inspect Git and npm before retrying, because an npm version cannot be overwritten.

---

[Contributing](../CONTRIBUTING.md) · [Documentation index](README.md)
