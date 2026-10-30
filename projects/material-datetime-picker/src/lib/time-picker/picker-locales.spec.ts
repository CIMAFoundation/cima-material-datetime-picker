import { TestBed } from '@angular/core/testing';
import { getCimaPickerTranslation } from './picker-locales';
import { CimaTimepickerIntl } from './timepicker-intl';
import { CimaTimePicker } from './time-picker';

describe('Included picker localization', () => {
  it.each([
    ['en-US', 'Hour', 'Start'], ['en-GB', 'Hour', 'Start'], ['it-IT', 'Ore', 'Inizio'],
    ['fr-FR', 'Heures', 'Début'], ['fr-CA', 'Heures', 'Début'], ['de-DE', 'Stunden', 'Beginn'],
    ['es-ES', 'Horas', 'Inicio'], ['pt-BR', 'Hour', 'Start'], ['__proto__', 'Hour', 'Start'],
    ['FR_ca', 'Heures', 'Début'],
  ])('resolves %s with language and English fallbacks', (locale, hours, start) => {
    const translation = getCimaPickerTranslation(locale);
    expect(translation.labels.hours).toBe(hours);
    expect(translation.labels.rangeStart).toBe(start);
    expect(translation.calendar.openCalendarLabel).toBeTruthy();
    expect(translation.calendar.formatYearRangeLabel('2020', '2040')).toContain('2040');
  });

  it('returns independent dictionaries and keeps service overrides across locale changes', () => {
    const first = getCimaPickerTranslation('it-IT');
    first.labels.hours = 'Custom'; first.calendar.calendarLabel = 'Custom';
    expect(getCimaPickerTranslation('it-IT').labels.hours).toBe('Ore');
    expect(getCimaPickerTranslation('it-IT').calendar.calendarLabel).toBe('Calendario');
    const intl = new CimaTimepickerIntl();
    const changed = vi.fn(); intl.changes.subscribe(changed);
    intl.setLocale('it-IT', { rangeStart: 'Arrival' });
    intl.setLocale('de-DE');
    expect(intl.hours).toBe('Stunden'); expect(intl.rangeStart).toBe('Arrival');
    intl.setLocale('pt-BR'); expect(intl.hours).toBe('Hour');
    expect(changed).toHaveBeenCalledTimes(3);
  });

  it('updates rendered time labels while retaining component overrides and the value', async () => {
    const fixture = TestBed.createComponent(CimaTimePicker);
    fixture.componentRef.setInput('timeView', 'input');
    fixture.componentRef.setInput('labels', { enterTime: 'Appointment time' });
    const value = { hours: 14, minutes: 30, seconds: 0 };
    fixture.componentInstance.writeValue(value); fixture.detectChanges();
    TestBed.inject(CimaTimepickerIntl).setLocale('fr-FR'); await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Appointment time');
    expect(fixture.nativeElement.querySelector('input').getAttribute('aria-label')).toBe('Heures');
    expect(fixture.componentInstance.value()).toEqual(value);
  });
});
