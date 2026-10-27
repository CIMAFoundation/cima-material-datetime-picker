import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withHashLocation, withInMemoryScrolling } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter([
      { path: 'docs/:slug', loadComponent: () => import('./docs').then(module => module.Docs) },
      { path: 'docs', redirectTo: 'docs/README', pathMatch: 'full' },
      { path: '', pathMatch: 'full', children: [] },
      { path: '**', redirectTo: '' },
    ], withHashLocation(), withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
  ],
};
