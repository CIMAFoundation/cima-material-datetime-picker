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
    app.setLocalization('en-US');
    fixture.detectChanges();
    expect(app.timeIntl.enterTime).toBe('Enter time');
    expect(app.appointment.value).toBe(selected);
    expect(app.timeControl.value).toEqual({ hours: 14, minutes: 30, seconds: 0 });
    expect(app.hourCycle()).toBe('12');
  });

  it('keeps the playground English while localizing picker labels and formats', async () => {
    const fixture = TestBed.createComponent(App); fixture.detectChanges();
    const app = fixture.componentInstance;
    app.setLocalization('it-IT'); await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Localization');
    expect(fixture.nativeElement.textContent).toContain('Range layout');
    expect(fixture.nativeElement.textContent).not.toContain('Disposizione intervallo');
    expect(app.timeIntl.rangeStart).toBe('Inizio');
    expect(app.datetimeExample).toContain('27/10/2026');
    app.setLocalization('en-US'); expect(app.datetimeExample).toContain('10/27/2026');
    app.setLocalization('en-GB'); expect(app.datetimeExample).toContain('27/10/2026');
    app.setLocalization('pt-BR'); expect(app.timeIntl.rangeStart).toBe('Start');
    expect(app.datetimeExample).toContain('27/10/2026');
  });

  it('applies hour-only precision to examples, hints and generated snippets', async () => {
    const fixture = TestBed.createComponent(App); fixture.detectChanges();
    const app = fixture.componentInstance;
    app.precision.set('hours'); app.showSeconds.set(true); app.popupTimeView.set('input');
    await fixture.whenStable();
    for (const picker of fixture.nativeElement.querySelectorAll('cima-time-picker') as NodeListOf<HTMLElement>) {
      const fields = picker.querySelectorAll('.field');
      expect(fields).toHaveLength(2);
      expect((fields[1].querySelector('input,button') as HTMLInputElement).disabled).toBe(true);
    }
    expect(app.datetimeExample).toContain('02:00');
    expect(app.datetimeCode()).toContain('precision="hours"'); expect(app.popupCode()).toContain('precision="hours"');
    app.popup.open(); await fixture.whenStable();
    const inputs = TestBed.inject(OverlayContainer).getContainerElement().querySelectorAll('input');
    expect(inputs).toHaveLength(2); expect(inputs[1].disabled).toBe(true);
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

  it('makes both popup inputs readonly and opens them on click', async () => {
    const fixture = TestBed.createComponent(App); fixture.detectChanges();
    fixture.componentInstance.readonlyInputs.set(true); await fixture.whenStable();
    const datetime = fixture.nativeElement.querySelectorAll('.example input')[0] as HTMLInputElement;
    const time = fixture.nativeElement.querySelectorAll('.example input')[1] as HTMLInputElement;
    expect(datetime.readOnly).toBe(true);
    expect(time.readOnly).toBe(true);
    (time.closest('mat-form-field')!.querySelector('.mat-mdc-text-field-wrapper') as HTMLElement).click();
    await fixture.whenStable();
    expect(fixture.componentInstance.popup.isOpen()).toBe(true);
    fixture.componentInstance.popup.close(); await fixture.whenStable();
    (datetime.closest('mat-form-field')!.querySelector('.mat-mdc-text-field-wrapper') as HTMLElement).click();
    await fixture.whenStable();
    expect(datetime.getAttribute('aria-expanded')).toBe('true');
  });

  it('shows localized parsing errors without losing the text entered in the demo', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('.example input');
    input.value = '02/30/2026 02:30 PM';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    expect(fixture.componentInstance.appointment.hasError('cimaDatetimePickerParse')).toBe(true);
    expect(input.value).toBe('02/30/2026 02:30 PM');
    expect(fixture.nativeElement.textContent).toContain('Enter a valid local date');
  });
});
