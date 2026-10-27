import { provideRouter } from '@angular/router';
import { OverlayContainer } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));
  it('renders the starter page', async () => {
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Cima Material Datetime Picker');
  });

  it('applies both appearance settings to the page and popup container', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    for (const theme of ['m2', 'm3'] as const) {
      app.theme.set(theme);
      app.darkMode.set(true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('main').classList.contains('dark')).toBe(true);
      expect(overlay.classList.contains('dark')).toBe(true);
      expect(overlay.classList.contains('m2')).toBe(theme === 'm2');
      app.darkMode.set(false);
      fixture.detectChanges();
      expect(overlay.classList.contains('dark')).toBe(false);
    }
  });

  it('changes the calendar locale and time labels without changing the selected values', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const selected = new Date(2026, 9, 20, 14, 30);
    app.appointment.setValue(selected);
    app.timeControl.setValue({ hours: 14, minutes: 30, seconds: 0 });
    app.setLanguage('en');
    fixture.detectChanges();
    expect(app.timeIntl.enterTime).toBe('Enter time');
    expect(app.appointment.value).toBe(selected);
    expect(app.timeControl.value).toEqual({ hours: 14, minutes: 30, seconds: 0 });
    expect(app.hourCycle()).toBe('12');
  });

  it('uses the public popup API and propagates confirmed values into its form', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const app = fixture.componentInstance;
    app.popup.open();
    await fixture.whenStable();
    app.popup.complete({ hours: 14, minutes: 30, seconds: 0 });
    expect(app.popupControl.value).toEqual({ hours: 14, minutes: 30, seconds: 0 });
    expect(app.popup.isOpen()).toBe(false);
  });

  it('shows localized parsing errors without losing the text entered in the demo', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('section.featured input');
    input.value = '02/30/2026 02:30 PM';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    expect(fixture.componentInstance.appointment.hasError('cimaDatetimePickerParse')).toBe(true);
    expect(input.value).toBe('02/30/2026 02:30 PM');
    expect(fixture.nativeElement.textContent).toContain('Enter a valid local date');
  });
});
