import { ChangeDetectorRef, Component, signal, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MATERIAL_ANIMATIONS, provideNativeDateAdapter } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DateFilterFn, MatCalendarHeader } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { CimaDatetimePicker } from './datetime-picker';
import { CimaDatetimePickerInput } from './datetime-picker-input';
import { OverlayContainer } from '@angular/cdk/overlay';
import { CimaTimePicker } from '../time-picker/time-picker';
import { By } from '@angular/platform-browser';
import { DateAdapter } from '@angular/material/core';
import { CimaTime, CimaTimeFilter } from '../time-picker/time-value';
import { CimaDatetimePickerToggle } from './datetime-picker-toggle';

@Component({
  imports: [MatCalendarHeader],
  template: '<mat-calendar-header /><span>Custom calendar header</span>',
})
class CustomHeader {}

@Component({
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    CimaDatetimePicker, CimaDatetimePickerInput, CimaDatetimePickerToggle],
  providers: [provideNativeDateAdapter(), { provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } }],
  template: `<mat-form-field>
    <mat-label>Appointment</mat-label>
    <input matInput [cimaDatetimePicker]="picker" [formControl]="control" [min]="minimum()" [max]="maximum()" [cimaDatetimePickerFilter]="dateFilter()"
      [minTime]="minimumTime()" [maxTime]="maximumTime()" [timeFilter]="timeFilter()"
      [minDateTime]="minimumDateTime()" [maxDateTime]="maximumDateTime()">
    <cima-datetime-picker-toggle matIconSuffix [for]="picker" />
    <cima-datetime-picker #picker timeView="input" [panelClass]="panelClass()" [(opened)]="opened" [calendarHeaderComponent]="customHeader" />
  </mat-form-field>`,
})
class DatetimeHost {
  readonly panelClass = signal<string | string[]>([]);
  readonly opened = signal(false);
  readonly minimumTime = signal<CimaTime | null>(null);
  readonly maximumTime = signal<CimaTime | null>(null);
  readonly timeFilter = signal<CimaTimeFilter | null>(null);
  readonly minimumDateTime = signal<Date | null>(null);
  readonly maximumDateTime = signal<Date | null>(null);
  customHeader!: typeof CustomHeader;
  readonly minimum = signal<Date | null>(null);
  readonly maximum = signal<Date | null>(null);
  readonly dateFilter = signal<DateFilterFn<Date> | null>(null);
  readonly initial = new Date(2026, 9, 27, 14, 30, 45);
  readonly control = new FormControl<Date | null>(this.initial, Validators.required);
  @ViewChild(CimaDatetimePicker) picker!: CimaDatetimePicker;
  @ViewChild(CimaDatetimePickerInput) input!: CimaDatetimePickerInput;
}

@Component({
  imports: [FormsModule, MatFormFieldModule, MatInputModule, CimaDatetimePicker, CimaDatetimePickerInput],
  providers: [provideNativeDateAdapter(), { provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } }],
  template: `<mat-form-field><input matInput [cimaDatetimePicker]="picker" [(ngModel)]="value">
    <cima-datetime-picker #picker /></mat-form-field>`,
})
class ModelHost {
  value: Date | null = new Date(2026, 9, 27, 9, 15);
  @ViewChild(CimaDatetimePickerInput) input!: CimaDatetimePickerInput;
}

describe('Public datetime control', () => {
  it('shares panelClass with the calendar and time content, including updates and arrays', async () => {
    const fixture = TestBed.createComponent(DatetimeHost);
    fixture.detectChanges();
    const picker = fixture.componentInstance.picker;
    fixture.componentInstance.panelClass.set('m2-theme');
    fixture.detectChanges();
    picker.open();
    await fixture.whenStable();
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    expect(overlay.querySelector('mat-calendar.m2-theme')).not.toBeNull();
    expect(overlay.querySelector('.content.m2-theme cima-time-picker')).not.toBeNull();
    expect(overlay.querySelector('.content.m2-theme [matDatepickerApply]')).not.toBeNull();
    fixture.componentInstance.panelClass.set(['other-theme', 'custom-picker']);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(overlay.querySelector('.content.other-theme.custom-picker')).not.toBeNull();
    expect(overlay.querySelector('.content.m2-theme')).toBeNull();
    picker.close();
  });

  it('formats an initial complete value without mutating the Date or marking the form dirty', () => {
    const fixture = TestBed.createComponent(DatetimeHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    expect(host.input.element.nativeElement.value).toContain('14:30');
    expect(host.input.value?.getTime()).toBe(host.initial.getTime());
    expect(host.input.value).not.toBe(host.initial);
    expect(host.control.pristine).toBe(true);
    expect(host.input.element.nativeElement.readOnly).toBe(false);
  });

  it('restores drafts and preserves hidden seconds when the date alone changes', async () => {
    const fixture = TestBed.createComponent(DatetimeHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    host.picker.open();
    await fixture.whenStable();
    expect(host.picker.draftTime()).toEqual({ hours: 14, minutes: 30, seconds: 45 });
    const dialog = document.querySelector('[role="dialog"]')!;
    (dialog.querySelector('button[aria-label="October 28, 2026"]') as HTMLButtonElement).click();
    expect(host.control.value?.getDate()).toBe(27);
    const events = vi.fn();
    host.input.dateChange.subscribe(events);
    (dialog.querySelector('[matDatepickerApply]') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(host.control.value?.getDate()).toBe(28);
    expect(host.control.value?.getHours()).toBe(14);
    expect(host.control.value?.getSeconds()).toBe(45);
    expect(host.initial.getDate()).toBe(27);
    expect(events).toHaveBeenCalledOnce();
  });

  it('applies exact hours and validates unaligned external dates in hour-only mode', async () => {
    const fixture = TestBed.createComponent(DatetimeHost); fixture.detectChanges();
    const host = fixture.componentInstance;
    host.picker.precision = 'hours'; host.picker.ngOnChanges({});
    expect(host.control.hasError('cimaDatetimePickerPrecision')).toBe(true);
    host.picker.open(); await fixture.whenStable();
    expect(host.picker.draftTime()?.minutes).toBe(0);
    expect(host.picker.draftTime()?.seconds).toBe(0);
    (document.querySelector('[matDatepickerApply]') as HTMLButtonElement).click(); await fixture.whenStable();
    expect(host.control.value?.getMinutes()).toBe(0); expect(host.control.value?.getSeconds()).toBe(0);
    expect(host.control.valid).toBe(true);
  });

  it('applies time-only edits on OK even when the calendar date is unchanged', async () => {
    const fixture = TestBed.createComponent(DatetimeHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    host.picker.open();
    await fixture.whenStable();
    host.picker.draftTime.set({ hours: 19, minutes: 10, seconds: 45 });
    expect(host.control.value?.getHours()).toBe(14);
    const confirmed = vi.fn();
    const cancelled = vi.fn();
    host.picker.confirmed.subscribe(confirmed);
    host.picker.cancelled.subscribe(cancelled);
    (document.querySelector('[matDatepickerApply]') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(host.control.value?.getHours()).toBe(19);
    expect(host.control.value?.getMinutes()).toBe(10);
    expect(confirmed).toHaveBeenCalledOnce();
    expect(cancelled).not.toHaveBeenCalled();
    expect(host.control.touched).toBe(true);
  });

  it('discards time edits on close and restores the confirmed time on reopening', async () => {
    const fixture = TestBed.createComponent(DatetimeHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    host.picker.open();
    await fixture.whenStable();
    host.picker.draftTime.set({ hours: 22, minutes: 0, seconds: 0 });
    host.picker.close();
    await vi.waitFor(() => expect(host.picker.isOpen()).toBe(false));
    expect(host.control.value?.getHours()).toBe(14);
    host.picker.open();
    await fixture.whenStable();
    expect(host.picker.draftTime()?.hours).toBe(14);
    host.picker.close();
  });

  it('cancels a pending draft when a programmatic value replaces it', async () => {
    const fixture = TestBed.createComponent(DatetimeHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    host.picker.open();
    await fixture.whenStable();
    const replacement = new Date(2027, 0, 4, 8, 15);
    host.control.setValue(replacement);
    await fixture.whenStable();
    expect(host.picker.isOpen()).toBe(false);
    expect(host.input.value?.getTime()).toBe(replacement.getTime());
    expect(host.input.element.nativeElement.value).toContain('08:15');
  });

  it('resets the input and preserves required validation', () => {
    const fixture = TestBed.createComponent(DatetimeHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    host.control.reset();
    expect(host.input.value).toBeNull();
    expect(host.input.element.nativeElement.value).toBe('');
    expect(host.control.hasError('required')).toBe(true);
  });

  it('blocks both the toggle and programmatic opening when the form is disabled', async () => {
    const fixture = TestBed.createComponent(DatetimeHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    host.control.disable();
    fixture.detectChanges();
    host.picker.open();
    expect(host.picker.isOpen()).toBe(false);
    expect(host.input.element.nativeElement.disabled).toBe(true);
    expect((fixture.nativeElement.querySelector('cima-datetime-picker-toggle button') as HTMLButtonElement).disabled).toBe(true);
    host.control.enable();
    fixture.detectChanges();
    host.picker.open();
    await fixture.whenStable();
    expect(host.picker.isOpen()).toBe(true);
    host.picker.close();
  });

  it('opens from the toggle after enabling an initially disabled form control', async () => {
    const fixture = TestBed.createComponent(DatetimeHost);
    const host = fixture.componentInstance;
    host.control.disable();
    fixture.detectChanges();
    const toggle = fixture.nativeElement.querySelector('cima-datetime-picker-toggle button') as HTMLButtonElement;
    expect(toggle.disabled).toBe(true);

    host.control.enable();
    await fixture.whenStable();
    expect(toggle.disabled).toBe(false);
    toggle.click();
    await fixture.whenStable();
    expect(host.picker.isOpen()).toBe(true);
    host.picker.close();
    await fixture.whenStable();

    host.control.disable();
    await fixture.whenStable();
    expect(toggle.disabled).toBe(true);
    expect(host.picker.nativeCalendar.disabled).toBe(true);
  });

  it('reports invalid native Date values without formatting them or changing the form model', () => {
    const fixture = TestBed.createComponent(DatetimeHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const invalid = new Date(NaN);
    host.control.setValue(invalid);
    expect(host.control.value).toBe(invalid);
    expect(host.control.hasError('invalidDatetime')).toBe(true);
    expect(host.input.element.nativeElement.value).toBe('');
  });

  it('compares date limits inclusively and ignores their time portions', () => {
    const fixture = TestBed.createComponent(DatetimeHost);
    const host = fixture.componentInstance;
    host.minimum.set(new Date(2026, 9, 27, 23, 59));
    host.maximum.set(new Date(2026, 9, 27, 0, 0));
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(host.control.valid).toBe(true);
    host.control.setValue(new Date(2026, 9, 26, 23, 59));
    expect(host.control.hasError('cimaDatetimePickerMin')).toBe(true);
    host.control.setValue(new Date(2026, 9, 28, 0, 0));
    expect(host.control.hasError('cimaDatetimePickerMax')).toBe(true);
    expect(host.control.value?.getDate()).toBe(28);
  });

  it('revalidates programmatic values when date rules change', () => {
    const fixture = TestBed.createComponent(DatetimeHost);
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    const host = fixture.componentInstance;
    expect(host.control.valid).toBe(true);
    host.minimum.set(new Date(2026, 9, 28));
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(host.control.hasError('cimaDatetimePickerMin')).toBe(true);
    host.minimum.set(null);
    host.dateFilter.set(() => false);
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(host.control.hasError('cimaDatetimePickerFilter')).toBe(true);
    host.dateFilter.set(null);
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(host.control.valid).toBe(true);
  });

  it('disables excluded calendar days without discarding out-of-range form values', async () => {
    const fixture = TestBed.createComponent(DatetimeHost);
    const host = fixture.componentInstance;
    host.minimum.set(new Date(2026, 9, 27));
    host.maximum.set(new Date(2026, 9, 29));
    host.dateFilter.set(date => date?.getDate() !== 28);
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    host.picker.open();
    await fixture.whenStable();
    const day = (label: string) => document.querySelector(`button[aria-label="${label}"]`) as HTMLButtonElement;
    expect(day('October 26, 2026').getAttribute('aria-disabled')).toBe('true');
    expect(day('October 28, 2026').getAttribute('aria-disabled')).toBe('true');
    expect(day('October 29, 2026').getAttribute('aria-disabled')).toBeNull();
    host.picker.close();
  });

  it('reports invalid configurations and clears the error when limits are corrected', () => {
    const fixture = TestBed.createComponent(DatetimeHost);
    const host = fixture.componentInstance;
    host.minimum.set(new Date(2026, 9, 29));
    host.maximum.set(new Date(2026, 9, 27));
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(host.control.hasError('invalidDatetimeConstraints')).toBe(true);
    host.maximum.set(new Date(2026, 9, 30));
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(host.control.hasError('invalidDatetimeConstraints')).toBe(false);
    host.minimum.set(new Date(NaN));
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(host.control.hasError('invalidDatetimeConstraints')).toBe(true);
  });

  it('cancels an open draft when constraints change without rewriting the form value', async () => {
    const fixture = TestBed.createComponent(DatetimeHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    host.picker.open();
    await fixture.whenStable();
    host.picker.draftTime.set({ hours: 19, minutes: 0, seconds: 0 });
    host.minimum.set(new Date(2026, 9, 28));
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    await vi.waitFor(() => expect(host.picker.isOpen()).toBe(false));
    expect(host.control.value?.getDate()).toBe(27);
    expect(host.control.value?.getHours()).toBe(14);
    expect(host.control.hasError('cimaDatetimePickerMin')).toBe(true);
  });

  it('does not confirm an existing value that is excluded by date constraints', async () => {
    const fixture = TestBed.createComponent(DatetimeHost);
    const host = fixture.componentInstance;
    host.minimum.set(new Date(2026, 9, 28));
    fixture.detectChanges();
    const confirmed = vi.fn();
    const changed = vi.fn();
    host.picker.confirmed.subscribe(confirmed);
    host.input.dateChange.subscribe(changed);
    host.picker.open();
    await fixture.whenStable();
    const apply = document.querySelector('[matDatepickerApply]') as HTMLButtonElement;
    expect(apply.disabled).toBe(true);
    apply.click();
    expect(host.picker.isOpen()).toBe(true);
    host.picker.close();
    expect(host.control.value?.getDate()).toBe(27);
    expect(host.control.hasError('cimaDatetimePickerMin')).toBe(true);
    expect(confirmed).not.toHaveBeenCalled();
    expect(changed).not.toHaveBeenCalled();
  });

  it('combines recurring overnight limits with date filtering', () => {
    const fixture = TestBed.createComponent(DatetimeHost);
    const host = fixture.componentInstance;
    host.minimumTime.set({ hours: 22, minutes: 0, seconds: 0 });
    host.maximumTime.set({ hours: 6, minutes: 0, seconds: 0 });
    host.dateFilter.set(date => date?.getDate() !== 28);
    fixture.detectChanges();
    expect(host.control.hasError('cimaDatetimePickerTimeRange')).toBe(true);
    host.control.setValue(new Date(2026, 9, 27, 22, 0));
    expect(host.control.valid).toBe(true);
    host.control.setValue(new Date(2026, 9, 28, 3, 0));
    expect(host.control.hasError('cimaDatetimePickerFilter')).toBe(true);
    host.control.setValue(new Date(2026, 9, 29, 6, 0));
    expect(host.control.valid).toBe(true);
  });

  it('validates inclusive full instants and rejects reversed bounds', () => {
    const fixture = TestBed.createComponent(DatetimeHost);
    const host = fixture.componentInstance;
    const minimum = new Date(2026, 9, 27, 16, 0, 30);
    const maximum = new Date(2026, 9, 28, 10, 0, 30);
    host.minimumDateTime.set(minimum);
    host.maximumDateTime.set(maximum);
    fixture.detectChanges();
    expect(host.control.hasError('cimaDatetimePickerMinDateTime')).toBe(true);
    host.control.setValue(new Date(minimum.getTime()));
    expect(host.control.valid).toBe(true);
    host.control.setValue(new Date(maximum.getTime()));
    expect(host.control.valid).toBe(true);
    host.control.setValue(new Date(maximum.getTime() + 1));
    expect(host.control.hasError('cimaDatetimePickerMaxDateTime')).toBe(true);
    host.maximumDateTime.set(new Date(2026, 9, 26));
    fixture.detectChanges();
    expect(host.control.hasError('invalidDatetimeConstraints')).toBe(true);
  });

  it('updates OK from pending day and time changes before committing anything', async () => {
    const fixture = TestBed.createComponent(DatetimeHost);
    const host = fixture.componentInstance;
    host.minimumDateTime.set(new Date(2026, 9, 27, 16));
    host.maximumDateTime.set(new Date(2026, 9, 28, 10));
    fixture.detectChanges();
    host.picker.open();
    await fixture.whenStable();
    const apply = document.querySelector('[matDatepickerApply]') as HTMLButtonElement;
    expect(apply.disabled).toBe(true);
    (document.querySelector('button[aria-label="October 28, 2026"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(host.picker.draftDate()?.getDate()).toBe(28);
    expect(apply.disabled).toBe(true);
    host.picker.draftTime.set({ hours: 9, minutes: 30, seconds: 0 });
    fixture.detectChanges();
    expect(apply.disabled).toBe(false);
    expect(host.control.value?.getDate()).toBe(27);
    apply.click();
    await fixture.whenStable();
    expect(host.control.value?.getDate()).toBe(28);
    expect(host.control.value?.getHours()).toBe(9);
  });

  it('preserves caller headers while observing their calendar selections', async () => {
    const fixture = TestBed.createComponent(DatetimeHost);
    const host = fixture.componentInstance;
    host.customHeader = CustomHeader;
    fixture.detectChanges();
    host.picker.open();
    await fixture.whenStable();
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain('Custom calendar header');
    (document.querySelector('button[aria-label="October 28, 2026"]') as HTMLButtonElement).click();
    expect(host.picker.draftDate()?.getDate()).toBe(28);
    host.picker.close();
  });

  it('keeps invalid text visible, reports parsing separately and preserves hidden seconds after correction', () => {
    const fixture = TestBed.createComponent(DatetimeHost); fixture.detectChanges();
    const { input, control } = fixture.componentInstance;
    const edits = vi.fn(); const changes = vi.fn();
    input.dateInput.subscribe(edits); input.dateChange.subscribe(changes);
    input.element.nativeElement.value = '02/30/2026 14:30';
    input.element.nativeElement.dispatchEvent(new Event('input'));
    expect(control.value).toBeNull(); expect(control.hasError('cimaDatetimePickerParse')).toBe(true);
    input.onBlur(); expect(input.element.nativeElement.value).toBe('02/30/2026 14:30');
    input.element.nativeElement.value = '10/28/2026 9:5';
    input.element.nativeElement.dispatchEvent(new Event('input'));
    expect(control.value?.getDate()).toBe(28); expect(control.value?.getSeconds()).toBe(45);
    expect(control.valid).toBe(true); expect(changes).not.toHaveBeenCalled();
    input.element.nativeElement.dispatchEvent(new Event('change'));
    input.onBlur(); expect(input.element.nativeElement.value).toBe('10/28/2026 09:05');
    expect(edits).toHaveBeenCalledTimes(2); expect(changes).toHaveBeenCalledTimes(1);
    input.element.nativeElement.value = ''; input.onInput();
    expect(control.hasError('cimaDatetimePickerParse')).toBe(false); expect(control.hasError('required')).toBe(true);
    input.element.nativeElement.value = '10/28/2026 09:05'; input.onInput();
    expect(control.value?.getSeconds()).toBe(0);
  });

  it('parses the active adapter locale and retains syntactically valid values excluded by constraints', () => {
    const fixture = TestBed.createComponent(DatetimeHost); fixture.detectChanges();
    const host = fixture.componentInstance;
    fixture.debugElement.injector.get(DateAdapter).setLocale('it-IT');
    host.minimum.set(new Date(2026, 9, 28)); fixture.detectChanges();
    host.input.element.nativeElement.value = '27/10/2026 14:30'; host.input.onInput();
    expect(host.control.value?.getDate()).toBe(27);
    expect(host.control.hasError('cimaDatetimePickerMin')).toBe(true);
    expect(host.control.hasError('cimaDatetimePickerParse')).toBe(false);
    host.control.reset(); expect(host.input.element.nativeElement.value).toBe('');
    expect(host.control.hasError('cimaDatetimePickerParse')).toBe(false);
  });

  it('cancels an open draft on manual typing and respects readonly and disabled input', async () => {
    const fixture = TestBed.createComponent(DatetimeHost); fixture.detectChanges();
    const host = fixture.componentInstance;
    host.picker.open(); await fixture.whenStable();
    host.input.element.nativeElement.value = '10/29/2026 10:00'; host.input.onInput();
    await fixture.whenStable(); expect(host.picker.isOpen()).toBe(false);
    expect(host.control.value?.getDate()).toBe(29);
    host.input.readonly = true;
    host.input.element.nativeElement.value = '10/30/2026 10:00'; host.input.onInput();
    expect(host.control.value?.getDate()).toBe(29);
    host.input.readonly = false; host.control.disable(); host.input.onInput();
    expect(host.control.value?.getDate()).toBe(29);
  });

  it('supports initial and runtime writable opened state with lifecycle synchronization', async () => {
    const fixture = TestBed.createComponent(DatetimeHost);
    const host = fixture.componentInstance;
    host.opened.set(true); fixture.detectChanges(); await fixture.whenStable();
    expect(host.picker.isOpen()).toBe(true);
    host.opened.set(false); await fixture.whenStable(); expect(host.picker.isOpen()).toBe(false);
    await vi.waitFor(() => expect(TestBed.inject(OverlayContainer).getContainerElement().querySelector('.cdk-overlay-pane')).toBeNull());
    // Material's closed event can precede its final focus-restoration timer.
    await new Promise<void>(resolve => setTimeout(resolve, 0));
    host.picker.open(); await fixture.whenStable(); expect(host.opened()).toBe(true);
    host.picker.close(); await fixture.whenStable(); expect(host.opened()).toBe(false);
  });

  it('synchronizes writable opened state when opened through methods and closed by Material', async () => {
    const fixture = TestBed.createComponent(DatetimeHost); fixture.detectChanges();
    const host = fixture.componentInstance;
    host.picker.open(); await fixture.whenStable(); expect(host.opened()).toBe(true);
    host.picker.nativeCalendar.close(); await fixture.whenStable();
    expect(host.opened()).toBe(false);
  });

  it('selects a pending day through public calendar APIs and only commits on OK', async () => {
    const fixture = TestBed.createComponent(DatetimeHost); fixture.detectChanges();
    const host = fixture.componentInstance;
    host.picker.select(new Date(2026, 9, 29)); expect(host.control.value?.getDate()).toBe(27);
    host.picker.open(); await fixture.whenStable();
    host.picker.select(new Date(2026, 9, 29, 23)); await fixture.whenStable();
    expect(host.picker.draftDate()?.getDate()).toBe(29);
    expect(host.picker.draftTime()?.hours).toBe(14);
    expect(host.control.value?.getDate()).toBe(27);
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    expect(overlay.querySelector('.mat-calendar-body-selected')?.textContent?.trim()).toBe('29');
    const ok = Array.from(overlay.querySelectorAll<HTMLButtonElement>('button')).find(button => button.textContent?.trim() === 'OK')!;
    ok.click(); await fixture.whenStable();
    expect(host.control.value?.getDate()).toBe(29); expect(host.control.value?.getHours()).toBe(14);
  });

  it('uses the native Material touch dialog and prevents confirmation of a selected excluded day', async () => {
    const fixture = TestBed.createComponent(DatetimeHost); fixture.detectChanges();
    const host = fixture.componentInstance;
    host.minimum.set(new Date(2026, 9, 27)); fixture.detectChanges();
    host.picker.touchUi = true;
    fixture.debugElement.query(By.directive(CimaDatetimePicker)).injector.get(ChangeDetectorRef).markForCheck();
    fixture.detectChanges(); host.picker.open(); await fixture.whenStable();
    expect(document.querySelector('.mat-datepicker-dialog')).not.toBeNull();
    host.picker.select(new Date(2026, 9, 26)); await fixture.whenStable();
    expect(host.picker.canConfirm).toBe(false);
    expect((document.querySelector('[matDatepickerApply]') as HTMLButtonElement).disabled).toBe(true);
    host.picker.close(); await fixture.whenStable(); expect(host.control.value?.getDate()).toBe(27);
  });

  it('forwards increments, labels and Material display/navigation options', async () => {
    const fixture = TestBed.createComponent(DatetimeHost); fixture.detectChanges();
    const picker = fixture.componentInstance.picker;
    picker.hourStep = 2; picker.minuteStep = 15; picker.secondStep = 10;
    picker.labels = { hours: 'Custom hours' };
    picker.startAt = new Date(2026, 9, 1); picker.startView = 'year';
    picker.xPosition = 'end'; picker.yPosition = 'above'; picker.restoreFocus = false;
    picker.panelClass = ['custom-panel']; picker.color = 'accent';
    const dateClass = () => 'special-day'; picker.dateClass = dateClass;
    fixture.debugElement.query(By.directive(CimaDatetimePicker)).injector.get(ChangeDetectorRef).markForCheck();
    fixture.detectChanges(); picker.open(); await fixture.whenStable();
    const native = picker.nativeCalendar;
    expect(native.startAt).toEqual(picker.startAt); expect(native.startView).toBe('year');
    expect(native.xPosition).toBe('end'); expect(native.yPosition).toBe('above');
    expect(native.restoreFocus).toBe(false); expect(native.panelClass).toEqual(['custom-panel']);
    expect(native.color).toBe('accent'); expect(native.dateClass).toBe(dateClass);
    const content = fixture.debugElement.query(By.directive(CimaTimePicker)).componentInstance as CimaTimePicker;
    expect(content.hourStep()).toBe(2); expect(content.minuteStep()).toBe(15); expect(content.secondStep()).toBe(10);
    expect(content.resolvedLabels().hours).toBe('Custom hours');
    picker.close();
  });

  it('supports ngModel and external model updates', async () => {
    const fixture = TestBed.createComponent(ModelHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const host = fixture.componentInstance;
    expect(host.input.value?.getHours()).toBe(9);
    host.value = new Date(2026, 9, 28, 17, 40);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(host.input.value?.getHours()).toBe(17);
  });
});
