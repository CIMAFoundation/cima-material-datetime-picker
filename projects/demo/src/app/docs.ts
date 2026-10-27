import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { Marked } from 'marked';
import { catchError, map, of, startWith, switchMap } from 'rxjs';

export const DOC_PAGES = [
  { slug: 'README', title: 'Overview' },
  { slug: 'getting-started', title: 'Getting started' },
  { slug: 'datetime', title: 'Date and time' },
  { slug: 'forms', title: 'Forms and values' },
  { slug: 'popups', title: 'Time input and popup' },
  { slug: 'parsing', title: 'Manual input and formats' },
  { slug: 'api', title: 'API reference' },
  { slug: 'theming', title: 'Theming' },
  { slug: 'internationalization', title: 'Internationalization' },
  { slug: 'status', title: 'Project status' },
];

/** Renders repository guides and keeps their Markdown links inside the demo. */
export function renderGuide(source: string): string {
  const markdown = new Marked({
    async: false,
    walkTokens(token) {
      if (token.type !== 'link') return;
      const page = DOC_PAGES.find(page => token.href === `${page.slug}.md`);
      if (page) token.href = `#/docs/${page.slug}`;
    },
  });
  return markdown.parse(source, { async: false });
}

@Component({
  selector: 'app-docs',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div class="docs-layout">
      <nav class="docs-nav" aria-label="Documentation">
        <p>DOCUMENTATION</p>
        @for (page of pages; track page.slug) {
          <a [routerLink]="['/docs', page.slug]" routerLinkActive="active"
            ariaCurrentWhenActive="page">{{ page.title }}</a>
        }
      </nav>
      <article class="docs-content" aria-label="Guide" aria-live="polite">
        @if (content().loading) { <p role="status">Loading guide…</p> }
        @else if (content().error) { <h1>Guide unavailable</h1><p>Please try again or choose another guide.</p> }
        @else { <div [innerHTML]="content().html"></div> }
      </article>
    </div>
  `,
})
export class Docs {
  readonly pages = DOC_PAGES;
  private readonly http = inject(HttpClient);
  readonly content = toSignal(inject(ActivatedRoute).paramMap.pipe(
    switchMap(params => {
      const slug = params.get('slug');
      if (!DOC_PAGES.some(page => page.slug === slug)) {
        return of({ html: '', loading: false, error: true });
      }
      return this.http.get(`docs/${slug}.md`, { responseType: 'text' }).pipe(
        map(source => ({ html: renderGuide(source), loading: false, error: false })),
        catchError(() => of({ html: '', loading: false, error: true })),
        startWith({ html: '', loading: true, error: false }),
      );
    }),
  ), { initialValue: { html: '', loading: true, error: false } });
}
