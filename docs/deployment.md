# Demo documentation and deployment

The demo serves the existing Markdown guides from the repository’s `docs/` directory, without a second documentation source. Open `/#/docs/getting-started` or use **Documentation** in the demo navigation. Guides are loaded on demand and share the demo's light/dark theme.

Restart `npm start` after changing the Angular asset configuration so the development server picks up the guides.

```sh
npm run build:pages
```

This prepares `dist/demo/browser` for hosting at `/cima-material-datetime-picker/`. Hash routes also support direct links and refreshes on static GitHub Pages hosting. The output includes the Markdown assets. The local build command does not upload or publish anything.

In the repository settings, select **Pages → Build and deployment → Source → GitHub Actions**. The `Deploy demo to GitHub Pages` workflow builds and publishes the demo on every push to `main`; it can also be started manually from the Actions tab.

The published demo is available at https://CIMAFoundation.github.io/cima-material-datetime-picker/.

---

[Contributing](../CONTRIBUTING.md) · [Documentation index](README.md)
