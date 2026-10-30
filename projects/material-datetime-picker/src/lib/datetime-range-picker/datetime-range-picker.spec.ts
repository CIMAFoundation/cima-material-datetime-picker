import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import { InteractivityChecker } from '@angular/cdk/a11y';
import { OverlayContainer } from '@angular/cdk/overlay';
import { CimaTimepickerIntl } from '../time-picker/timepicker-intl';
import { CimaDatetimeRange, CimaDatetimeRangePicker } from './datetime-range-picker';

@Component({
  imports: [ReactiveFormsModule, CimaDatetimeRangePicker],
  providers: [provideNativeDateAdapter()],
  template: '<cima-datetime-range-picker [formControl]="range" />',
})
class RangeHost {
  readonly range = new FormControl<CimaDatetimeRange | null>(null);
}

describe('CimaDatetimeRangePicker', () => {
  /** Creates a range picker using the application's native date adapter. */
  function createPicker() {
    TestBed.configureTestingModule({ providers: [provideNativeDateAdapter()] });
    return TestBed.createComponent(CimaDatetimeRangePicker);
  }

  it('confirms both endpoints as exact hours while preserving the external value until OK', () => {
    const fixture = createPicker(); fixture.componentRef.setInput('precision', 'hours'); fixture.detectChanges();
    const picker = fixture.componentInstance;
    const original = { start: new Date(2026, 9, 19, 9, 30, 15), end: new Date(2026, 9, 20, 17, 45, 30) };
    picker.writeValue(original);
    expect(picker.validate(new FormControl(original))).toEqual({ cimaDatetimeRangePrecision: true });
    picker.open(); expect(picker.value()).toEqual(original);
    expect(picker.startTime()?.minutes).toBe(0); expect(picker.endTime()?.seconds).toBe(0);
    picker.confirm();
    expect(picker.value()?.start?.getMinutes()).toBe(0); expect(picker.value()?.end?.getSeconds()).toBe(0);
    expect(original.start.getMinutes()).toBe(30);
  });

  it('confirms a complete overnight interval atomically and copies dates', () => {
    const fixture = createPicker(); fixture.detectChanges();
    const picker = fixture.componentInstance;
    const change = vi.fn(); picker.registerOnChange(change);
    picker.open(); picker.selectDate(new Date(2026, 9, 30)); picker.selectDate(new Date(2026, 9, 31));
    picker.startTime.set({ hours: 23, minutes: 30, seconds: 0 });
    picker.endTime.set({ hours: 2, minutes: 0, seconds: 0 });
    expect(change).not.toHaveBeenCalled();
    expect(picker.canConfirm).toBe(true);
    picker.confirm();
    expect(change).toHaveBeenCalledTimes(1);
    expect(picker.value()?.start?.getHours()).toBe(23);
    expect(picker.value()?.end?.getDate()).toBe(31);
    change.mock.calls[0][0].start.setHours(1);
    expect(picker.value()?.start?.getHours()).toBe(23);
  });

  it('rejects missing endpoints, reversed times on the same day and instant bounds', () => {
    const picker = createPicker().componentInstance;
    picker.open(); picker.selectDate(new Date(2026, 9, 30));
    expect(picker.canConfirm).toBe(false);
    picker.selectDate(new Date(2026, 9, 30));
    picker.startTime.set({ hours: 18, minutes: 0, seconds: 0 });
    picker.endTime.set({ hours: 9, minutes: 0, seconds: 0 });
    expect(picker.canConfirm).toBe(false);
    picker.endTime.set({ hours: 19, minutes: 0, seconds: 0 });
    picker.min = new Date(2026, 9, 30, 18, 30);
    expect(picker.canConfirm).toBe(false);
    picker.min = null;
    picker.max = new Date(2026, 9, 30, 18, 30);
    expect(picker.canConfirm).toBe(false);
  });

  it('discards drafts on Escape and starts a new range after a complete selection', () => {
    const picker = createPicker().componentInstance;
    const original = { start: new Date(2026, 9, 30, 9), end: new Date(2026, 9, 31, 17) };
    picker.writeValue(original); picker.open();
    picker.selectDate(new Date(2026, 10, 2));
    expect(picker.dates().end).toBeNull();
    picker.onKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(picker.value()).toEqual(original);
    expect(picker.isOpen()).toBe(false);
  });

  it('updates previews and the trigger on locale changes without changing the interval', async () => {
    const fixture = createPicker(); fixture.detectChanges();
    const picker = fixture.componentInstance;
    const adapter = fixture.debugElement.injector.get<DateAdapter<Date>>(DateAdapter);
    const value = { start: new Date(2026, 9, 19, 14, 30, 45), end: new Date(2026, 9, 20, 17) };
    picker.writeValue(value);
    adapter.setLocale('en-US');
    picker.open(); await fixture.whenStable();
    const panel = TestBed.inject(OverlayContainer).getContainerElement();
    expect(panel.querySelector('.start-time > p')?.textContent).toContain('Oct');
    expect(picker.formatPreview(value.start)).toContain('14:30');
    adapter.setLocale('it-IT'); await fixture.whenStable();
    expect(panel.querySelector('.start-time > p')?.textContent).toContain('ott');
    expect(fixture.nativeElement.querySelector('input').value).toContain('ott');
    fixture.componentRef.setInput('hourCycle', '12');
    fixture.componentRef.setInput('showSeconds', true); await fixture.whenStable();
    expect(panel.querySelector('.start-time > p')?.textContent).toContain('02:30:45');
    expect(picker.formatPreview(value.start)).toContain('PM');
    expect(picker.value()).toEqual(value);
  });

  it('localizes an open range and retains explicit endpoint labels', async () => {
    const fixture = createPicker(); fixture.componentRef.setInput('startLabel', 'Arrival'); fixture.detectChanges();
    const picker = fixture.componentInstance;
    picker.open(); await fixture.whenStable();
    const intl = TestBed.inject(CimaTimepickerIntl);
    intl.setLocale('fr-FR'); await fixture.whenStable();
    const panel = TestBed.inject(OverlayContainer).getContainerElement();
    expect(panel.querySelector('h2')?.textContent).toBe('Intervalle de dates et heures');
    expect(panel.querySelector('.start-time h3')?.textContent).toBe('Arrival');
    expect(panel.querySelector('.end-time h3')?.textContent).toBe('Fin');
    expect(panel.textContent).toContain('Annuler');
    expect(picker.value()).toBeNull();
  });

  it('uses a read-only field, opens from keyboard and restores field focus', async () => {
    const fixture = createPicker(); fixture.detectChanges();
    const picker = fixture.componentInstance;
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.readOnly).toBe(true);
    expect(input.value).toBe('');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await fixture.whenStable();
    expect(picker.isOpen()).toBe(true);
    picker.selectDate(new Date(2026, 9, 19)); picker.selectDate(new Date(2026, 9, 20));
    picker.confirm(); await fixture.whenStable();
    expect(input.value).toBe(picker.summary);
    expect(document.activeElement).toBe(input);
    fixture.componentRef.setInput('disabled', true); await fixture.whenStable();
    expect(input.disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(true);
  });

  it('accepts equal endpoints and inclusive bounds across a year boundary', () => {
    const picker = createPicker().componentInstance;
    const start = new Date(2026, 11, 31, 23, 30, 45);
    const end = new Date(2027, 0, 1, 0, 15, 30);
    picker.min = start; picker.max = end;
    picker.writeValue({ start, end }); picker.open();
    expect(picker.canConfirm).toBe(true);
    picker.confirm();
    expect(picker.value()).toEqual({ start, end });
    expect(picker.validate(new FormControl({ start, end: start }))).toBeNull();
  });

  it('reports malformed external endpoints without throwing or mutating the form', async () => {
    const fixture = TestBed.createComponent(RangeHost); fixture.detectChanges();
    const picker = fixture.debugElement.children[0].componentInstance as CimaDatetimeRangePicker;
    const invalid = { start: 'not a date', end: new Date(NaN) } as unknown as CimaDatetimeRange;
    expect(() => fixture.componentInstance.range.setValue(invalid)).not.toThrow();
    await fixture.whenStable();
    expect(fixture.componentInstance.range.value).toBe(invalid);
    expect(fixture.componentInstance.range.hasError('cimaDatetimeRangeIncomplete')).toBe(true);
    expect(fixture.nativeElement.querySelector('input').value).not.toContain('Invalid Date');
    picker.open(); expect(picker.canConfirm).toBe(false);
    fixture.componentInstance.range.reset();
    expect(fixture.componentInstance.range.errors).toBeNull();
  });

  it('rejects invalid and reversed bounds even for an empty control', () => {
    const picker = createPicker().componentInstance;
    picker.min = new Date(NaN);
    expect(picker.validate(new FormControl(null))).toEqual({ cimaDatetimeRangeConfig: true });
    picker.min = new Date(2026, 10, 1); picker.max = new Date(2026, 9, 1);
    expect(picker.validate(new FormControl(null))).toEqual({ cimaDatetimeRangeConfig: true });
    picker.min = null; picker.max = null;
    expect(picker.validate(new FormControl(null))).toBeNull();
  });

  it('revalidates changed bounds while open without applying an excluded draft', async () => {
    const fixture = createPicker(); fixture.detectChanges();
    const picker = fixture.componentInstance;
    const original = { start: new Date(2026, 9, 19, 9), end: new Date(2026, 9, 20, 17) };
    picker.writeValue(original); picker.open();
    fixture.componentRef.setInput('max', new Date(2026, 9, 20, 12)); await fixture.whenStable();
    expect(picker.canConfirm).toBe(false);
    picker.confirm();
    expect(picker.isOpen()).toBe(true);
    expect(picker.value()).toEqual(original);
    fixture.componentRef.setInput('value', { start: new Date(2026, 10, 1), end: null });
    await fixture.whenStable();
    expect(picker.isOpen()).toBe(false);
  });

  it('keeps DOM reading and tab order aligned with each layout', async () => {
    const fixture = createPicker();
    fixture.componentRef.setInput('layout', 'horizontal'); fixture.detectChanges();
    const picker = fixture.componentInstance;
    picker.open(); await fixture.whenStable();
    const panel = TestBed.inject(OverlayContainer).getContainerElement();
    const blocks = () => [...panel.querySelector('.range-layout')!.children].map(el => el.tagName);
    expect(blocks()).toEqual(['SECTION', 'MAT-CALENDAR', 'SECTION']);
    fixture.componentRef.setInput('layout', 'vertical'); await fixture.whenStable();
    expect(blocks()).toEqual(['MAT-CALENDAR', 'SECTION', 'SECTION']);
    expect(panel.querySelectorAll('mat-calendar')).toHaveLength(1);
  });

  it.runIf(Intl.DateTimeFormat().resolvedOptions().timeZone === 'Europe/Rome')('rejects nonexistent spring times at either endpoint', () => {
    const picker = createPicker().componentInstance;
    picker.open(); picker.selectDate(new Date(2026, 2, 29)); picker.selectDate(new Date(2026, 2, 29));
    picker.startTime.set({ hours: 2, minutes: 30, seconds: 0 });
    picker.endTime.set({ hours: 4, minutes: 0, seconds: 0 });
    expect(picker.draftValue.start).toBeNull();
    expect(picker.canConfirm).toBe(false);
    picker.startTime.set({ hours: 1, minutes: 0, seconds: 0 });
    picker.endTime.set({ hours: 2, minutes: 30, seconds: 0 });
    expect(picker.draftValue.end).toBeNull();
    picker.confirm(); expect(picker.value()).toBeNull();
    picker.endTime.set({ hours: 3, minutes: 30, seconds: 0 });
    expect(picker.canConfirm).toBe(true);
  });

  it.runIf(Intl.DateTimeFormat().resolvedOptions().timeZone === 'Europe/Rome')('preserves an existing autumn repeated instant when confirmed unchanged', () => {
    const picker = createPicker().componentInstance;
    const start = new Date('2026-10-25T02:30:00+01:00');
    const end = new Date('2026-10-25T03:30:00+01:00');
    picker.writeValue({ start, end }); picker.open(); picker.confirm();
    expect(picker.value()?.start?.getTime()).toBe(start.getTime());
    expect(picker.value()?.end?.getTime()).toBe(end.getTime());
  });

  it.each(['horizontal', 'vertical'] as const)('focuses the first visible block in %s layout', async layout => {
    const fixture = createPicker();
    fixture.componentRef.setInput('layout', layout); fixture.detectChanges();
    // jsdom has no layout, so visibility checks use native interactive elements.
    const focusable = vi.spyOn(TestBed.inject(InteractivityChecker), 'isFocusable')
      .mockImplementation(element => element.matches('input, button') && !element.hasAttribute('disabled'));
    fixture.componentInstance.open(); await fixture.whenStable();
    const panel = TestBed.inject(OverlayContainer).getContainerElement();
    expect(document.activeElement).toBe(panel.querySelector(layout === 'vertical' ? 'mat-calendar button' : '.start-time input'));
    focusable.mockRestore();
  });

  it('integrates with Forms, renders the dialog and honors reset and disabling', async () => {
    const fixture = TestBed.createComponent(RangeHost); fixture.detectChanges();
    const picker = fixture.debugElement.children[0].componentInstance as CimaDatetimeRangePicker;
    picker.open(); await fixture.whenStable();
    const panel = TestBed.inject(OverlayContainer).getContainerElement();
    expect(panel.querySelector('[role="dialog"]')).not.toBeNull();
    expect(panel.querySelectorAll('cima-time-picker')).toHaveLength(2);
    picker.selectDate(new Date(2026, 9, 30)); picker.selectDate(new Date(2026, 9, 31)); picker.confirm();
    expect(fixture.componentInstance.range.value?.start?.getHours()).toBe(9);
    picker.open(); fixture.componentInstance.range.reset();
    expect(picker.isOpen()).toBe(false);
    fixture.componentInstance.range.disable(); picker.open();
    expect(picker.isOpen()).toBe(false);
  });
});
