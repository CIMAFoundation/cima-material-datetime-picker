import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { convertToParamMap, provideRouter, ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Docs, renderGuide } from './docs';

describe('Documentation', () => {
  it('renders code and tables while rewriting local Markdown links only', () => {
    const html = renderGuide('```html\n<cima-time-picker />\n```\n\n| Name | Value |\n| --- | --- |\n| Hour | 24 |\n\n[Forms](forms.md) [Source](https://github.com/CIMAFoundation)');
    expect(html).toContain('&lt;cima-time-picker /&gt;');
    expect(html).toContain('<table>');
    expect(html).toContain('href="#/docs/forms"');
    expect(html).toContain('href="https://github.com/CIMAFoundation"');
  });

  it('loads routed guides, sanitizes HTML, and reports missing pages', async () => {
    const params = new BehaviorSubject(convertToParamMap({ slug: 'getting-started' }));
    TestBed.configureTestingModule({
      imports: [Docs],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { paramMap: params } }],
    });
    const fixture = TestBed.createComponent(Docs);
    const http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading guide');
    http.expectOne('docs/getting-started.md').flush('# Getting started\n\n<script>alert(1)</script>');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe('Getting started');
    expect(fixture.nativeElement.querySelector('script')).toBeNull();
    params.next(convertToParamMap({ slug: 'forms' }));
    http.expectOne('docs/forms.md').flush('Unavailable', { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Guide unavailable');
    params.next(convertToParamMap({ slug: 'unknown' }));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Guide unavailable');
    http.verify();
  });
});
