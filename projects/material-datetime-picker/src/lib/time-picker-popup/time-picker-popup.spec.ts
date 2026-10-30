import { Component, Injectable, signal, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { InteractivityChecker } from '@angular/cdk/a11y';
import { OverlayContainer } from '@angular/cdk/overlay';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CimaTimepickerIntl } from '../time-picker/timepicker-intl';
import { CimaTimePickerPopup } from './time-picker-popup';
import { CimaTimePickerInput } from './time-picker-input';
import { CimaTimePickerToggle } from './time-picker-toggle';
import { CimaInputFormats, CimaInputFormatOptions } from '../input/input-formats';
import { CimaTime, CimaTimeLabels } from '../time-picker/time-value';

@Component({
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, CimaTimePickerInput, CimaTimePickerPopup, CimaTimePickerToggle],
  providers: [provideNativeDateAdapter()],
  template: `<mat-form-field>
    <mat-label>Time</mat-label>
    <input matInput [cimaTimePicker]="popup" [formControl]="control" [minTime]="minimum()" [maxTime]="maximum()" [readonly]="readonly()">
    <cima-time-picker-toggle matIconSuffix [for]="popup" />
    <cima-time-picker-popup #popup [showActions]="actions()" [showSeconds]="seconds()" [disabled]="disabled()" [labels]="labels()" timeView="input" />
  </mat-form-field>`,
})
class PopupHost {
  readonly control = new FormControl<CimaTime | null>({ hours: 7, minutes: 0, seconds: 45 }, Validators.required);
  readonly minimum = signal<CimaTime | null>(null);
  readonly maximum = signal<CimaTime | null>(null);
  readonly actions = signal(false);
  readonly disabled = signal(false);
  readonly labels = signal<Partial<CimaTimeLabels>>({});
  readonly seconds = signal(false);
  readonly readonly = signal(false);
  @ViewChild(CimaTimePickerPopup) popup!: CimaTimePickerPopup;
  @ViewChild(CimaTimePickerInput) input!: CimaTimePickerInput;
}

@Component({
  imports: [FormsModule, MatInputModule, CimaTimePickerInput, CimaTimePickerPopup],
  providers: [provideNativeDateAdapter()],
  template: `<input matInput [cimaTimePicker]="popup" [(ngModel)]="time"><cima-time-picker-popup #popup />`,
})
class ModelHost {
  readonly time = signal<CimaTime | null>(null);
  @ViewChild(CimaTimePickerPopup) popup!: CimaTimePickerPopup;
  @ViewChild(CimaTimePickerInput) input!: CimaTimePickerInput;
}

@Injectable()
class MarkedTimeFormats extends CimaInputFormats {
  /** Demonstrates a scoped custom display format. */
  override formatTime(value: CimaTime, options: CimaInputFormatOptions): string {
    return `Time ${super.formatTime(value, options)}`;
  }

  /** Demonstrates strict parsing paired with the custom display. */
  override parseTime(text: string, options: CimaInputFormatOptions, previous: CimaTime | null = null): CimaTime | null {
    return text.startsWith('Time ') ? super.parseTime(text.slice(5), options, previous) : null;
  }
}

describe('Public time input and popup', () => {
  /** Dispatches a real input event to exercise the directive and Angular Forms together. */
  function type(input: CimaTimePickerInput, text: string): void {
    input.element.nativeElement.value = text;
    input.element.nativeElement.dispatchEvent(new Event('input'));
  }

  it('preserves unfinished text, separates parse errors from required and normalizes valid edits on blur', () => {
    const fixture = TestBed.createComponent(PopupHost); fixture.detectChanges();
    const { input, control } = fixture.componentInstance;
    const edits = vi.fn(); const changes = vi.fn();
    input.timeInput.subscribe(edits); input.timeChange.subscribe(changes);
    type(input, '14:');
    expect(control.value).toBeNull();
    expect(control.hasError('cimaTimePickerParse')).toBe(true);
    input.onBlur(); expect(input.element.nativeElement.value).toBe('14:');
    type(input, '14:3');
    expect(control.value).toEqual({ hours: 14, minutes: 3, seconds: 45 });
    input.onBlur(); expect(input.element.nativeElement.value).toBe('14:03');
    expect(changes).not.toHaveBeenCalled();
    input.element.nativeElement.dispatchEvent(new Event('change'));
    expect(changes).toHaveBeenCalledTimes(1);
    expect(edits).toHaveBeenCalledTimes(2);
    type(input, '');
    expect(control.hasError('cimaTimePickerParse')).toBe(false);
    expect(control.hasError('required')).toBe(true);
    type(input, '14:30'); expect(control.value?.seconds).toBe(0);
  });

  it('keeps valid excluded values in the form and revalidates changed overnight constraints', () => {
    const fixture = TestBed.createComponent(PopupHost); fixture.detectChanges();
    const host = fixture.componentInstance;
    host.minimum.set({ hours: 22, minutes: 0, seconds: 0 });
    host.maximum.set({ hours: 6, minutes: 0, seconds: 0 }); fixture.detectChanges();
    type(host.input, '14:30');
    expect(host.control.value?.hours).toBe(14);
    expect(host.control.hasError('timeRange')).toBe(true);
    type(host.input, '23:30'); expect(host.control.valid).toBe(true);
    host.minimum.set({ hours: 25, minutes: 0, seconds: 0 }); fixture.detectChanges();
    expect(host.control.hasError('invalidTimeConstraints')).toBe(true);
  });

  it('keeps programmatic invalid values in Forms and clears errors on reset', () => {
    const fixture = TestBed.createComponent(PopupHost); fixture.detectChanges();
    const { input, control } = fixture.componentInstance;
    const invalid = { hours: 25, minutes: 0, seconds: 0 };
    control.setValue(invalid);
    expect(control.value).toBe(invalid);
    expect(control.hasError('invalidTime')).toBe(true);
    expect(input.element.nativeElement.value).toBe('');
    type(input, 'bad'); control.reset();
    expect(input.element.nativeElement.value).toBe('');
    expect(control.hasError('cimaTimePickerParse')).toBe(false);
    expect(control.hasError('required')).toBe(true);
  });

  it('keeps a separate draft, cancels on Escape and restores trigger focus', async () => {
    const fixture = TestBed.createComponent(PopupHost); fixture.detectChanges();
    const { popup, control } = fixture.componentInstance;
    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    const focus = vi.spyOn(trigger, 'focus');
    const cancelled = vi.fn(); popup.cancelled.subscribe(cancelled);
    popup.open(trigger); await fixture.whenStable();
    popup.draftTime.set({ hours: 9, minutes: 30, seconds: 45 });
    expect(control.value?.hours).toBe(7);
    const panel = TestBed.inject(OverlayContainer).getContainerElement().querySelector('[role="dialog"]');
    expect(panel?.getAttribute('aria-modal')).toBe('true');
    popup.onKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();
    expect(control.value?.hours).toBe(7);
    expect(control.touched).toBe(true);
    expect(cancelled).toHaveBeenCalledTimes(1);
    expect(focus).toHaveBeenCalledTimes(2);
    popup.open(); expect(popup.draftTime()?.hours).toBe(7);
  });

  it('focuses and selects hours on opening without focusing the editable trigger', async () => {
    const fixture = TestBed.createComponent(PopupHost); fixture.detectChanges();
    const { popup } = fixture.componentInstance;
    // jsdom has no layout, so CDK visibility checks need a focusability substitute.
    const focusable = vi.spyOn(TestBed.inject(InteractivityChecker), 'isFocusable').mockReturnValue(true);
    const focus = vi.spyOn(popup.control!.element.nativeElement, 'focus');
    popup.open(); await fixture.whenStable();
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    const hours = overlay.querySelector('input')!;
    expect(focus).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(hours);
    expect(hours.selectionEnd).toBe(2);
    popup.close(); await fixture.whenStable();
    popup.timeView = 'clock';
    popup.open(); await fixture.whenStable();
    expect(document.activeElement).toBe(overlay.querySelector('.digit'));
    expect(overlay.querySelector('input')).toBeNull();
    focusable.mockRestore();
  });

  it('auto-confirms on the final numeric Enter and never on blur', async () => {
    const fixture = TestBed.createComponent(PopupHost); fixture.detectChanges();
    const { popup, control } = fixture.componentInstance;
    popup.open(); await fixture.whenStable();
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    const inputs = overlay.querySelectorAll<HTMLInputElement>('input');
    inputs[1].value = '30'; inputs[1].dispatchEvent(new Event('change')); await fixture.whenStable();
    expect(popup.isOpen()).toBe(true); expect(control.value?.minutes).toBe(0);
    inputs[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await fixture.whenStable();
    expect(popup.isOpen()).toBe(false); expect(control.value?.minutes).toBe(30);
  });

  it('waits for seconds when visible and for OK when actions are enabled', async () => {
    const fixture = TestBed.createComponent(PopupHost); fixture.detectChanges();
    const host = fixture.componentInstance;
    host.seconds.set(true); fixture.detectChanges();
    host.popup.open(); await fixture.whenStable();
    const inputs = TestBed.inject(OverlayContainer).getContainerElement().querySelectorAll<HTMLInputElement>('input');
    inputs[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(host.popup.isOpen()).toBe(true);
    inputs[2].value = '15'; inputs[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await fixture.whenStable();
    expect(host.control.value?.seconds).toBe(15); expect(host.popup.isOpen()).toBe(false);
    host.actions.set(true); fixture.detectChanges(); host.popup.open();
    host.popup.draftTime.set({ hours: 8, minutes: 15, seconds: 30 });
    host.popup.complete(host.popup.draftTime()!);
    expect(host.popup.isOpen()).toBe(true); expect(host.control.value?.hours).toBe(7);
    host.popup.confirm(); expect(host.control.value?.hours).toBe(8);
  });

  it('guards confirmation with daily rules and cancels on rule changes', async () => {
    const fixture = TestBed.createComponent(PopupHost); fixture.detectChanges();
    const host = fixture.componentInstance;
    host.minimum.set({ hours: 9, minutes: 0, seconds: 0 }); fixture.detectChanges();
    host.popup.open(); await fixture.whenStable();
    host.popup.complete({ hours: 8, minutes: 0, seconds: 0 });
    expect(host.popup.isOpen()).toBe(true); expect(host.control.value?.hours).toBe(7);
    host.maximum.set({ hours: 18, minutes: 0, seconds: 0 }); fixture.detectChanges();
    expect(host.popup.isOpen()).toBe(false);
    host.popup.open(); host.popup.complete({ hours: 10, minutes: 0, seconds: 0 });
    expect(host.control.value?.hours).toBe(10);
  });

  it('cancels on reset, external replacement and disabled state; disabled controls cannot reopen', async () => {
    const fixture = TestBed.createComponent(PopupHost); fixture.detectChanges();
    const { popup, control, input } = fixture.componentInstance;
    popup.open(); await fixture.whenStable();
    control.setValue({ hours: 10, minutes: 0, seconds: 0 }); expect(popup.isOpen()).toBe(false);
    popup.open(); control.reset(); expect(popup.isOpen()).toBe(false);
    popup.open(); expect(popup.draftTime()).toEqual({ hours: 0, minutes: 0, seconds: 0 });
    expect(control.value).toBeNull();
    control.disable(); expect(popup.isOpen()).toBe(false);
    popup.open(); expect(popup.isOpen()).toBe(false);
    fixture.detectChanges(); expect(input.element.nativeElement.disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(true);
  });

  it('updates a closed popup toggle when Forms disables the input or translations change', async () => {
    const fixture = TestBed.createComponent(PopupHost); fixture.detectChanges();
    const { control, popup } = fixture.componentInstance;
    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    control.disable(); await fixture.whenStable(); expect(trigger.disabled).toBe(true);
    control.enable(); await fixture.whenStable(); expect(trigger.disabled).toBe(false);
    const intl = fixture.debugElement.injector.get(CimaTimepickerIntl);
    intl.selectTime = 'Choose appointment time'; intl.changes.next(); await fixture.whenStable();
    expect(trigger.getAttribute('aria-label')).toBe('Choose appointment time');
    const host = fixture.componentInstance;
    host.labels.set({ selectTime: 'Local trigger label' }); await fixture.whenStable();
    expect(trigger.getAttribute('aria-label')).toBe('Local trigger label');
    host.disabled.set(true); await fixture.whenStable(); expect(trigger.disabled).toBe(true);
    expect(popup.isOpen()).toBe(false);
  });

  it('uses public keyboard opening and read-only click without committing a value', async () => {
    const fixture = TestBed.createComponent(PopupHost); fixture.detectChanges();
    const host = fixture.componentInstance;
    host.input.element.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true }));
    await fixture.whenStable(); expect(host.popup.isOpen()).toBe(true); host.popup.close();
    host.readonly.set(true); fixture.detectChanges();
    host.input.element.nativeElement.click(); await fixture.whenStable();
    expect(host.popup.isOpen()).toBe(true); expect(host.control.pristine).toBe(true);
  });

  it('supports component-scoped custom formats without replacing Material adapters', () => {
    TestBed.overrideComponent(PopupHost, { add: { providers: [{ provide: CimaInputFormats, useClass: MarkedTimeFormats }] } });
    const fixture = TestBed.createComponent(PopupHost); fixture.detectChanges();
    const { input, control } = fixture.componentInstance;
    expect(input.element.nativeElement.value).toBe('Time 07:00');
    type(input, '09:30'); expect(control.hasError('cimaTimePickerParse')).toBe(true);
    type(input, 'Time 09:30'); expect(control.value).toEqual({ hours: 9, minutes: 30, seconds: 45 });
  });

  it('cancels on backdrop and honors explicit focus-restoration disabling', async () => {
    const fixture = TestBed.createComponent(PopupHost); fixture.detectChanges();
    const { popup, control } = fixture.componentInstance;
    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    const focus = vi.spyOn(trigger, 'focus');
    popup.restoreFocus = false; popup.open(trigger); await fixture.whenStable();
    popup.draftTime.set({ hours: 10, minutes: 0, seconds: 0 });
    const backdrop = TestBed.inject(OverlayContainer).getContainerElement().querySelector<HTMLElement>('.cdk-overlay-backdrop')!;
    backdrop.click(); await fixture.whenStable();
    expect(popup.isOpen()).toBe(false); expect(control.value?.hours).toBe(7);
    expect(focus).toHaveBeenCalledTimes(1);
  });

  it('refreshes locale day periods and supports ngModel without requiring a form-field', async () => {
    const fixture = TestBed.createComponent(ModelHost); await fixture.whenStable();
    const host = fixture.componentInstance;
    host.popup.hourCycle = '12';
    type(host.input, '02:30 PM'); await fixture.whenStable();
    fixture.detectChanges(); await fixture.whenStable();
    expect(host.time()).toEqual({ hours: 14, minutes: 30, seconds: 0 });
    host.time.set({ hours: 9, minutes: 15, seconds: 0 }); fixture.changeDetectorRef.markForCheck(); fixture.detectChanges(); await fixture.whenStable();
    expect(host.input.element.nativeElement.value).toBe('09:15 AM');
    fixture.debugElement.injector.get(DateAdapter).setLocale('it-IT');
    expect(host.input.element.nativeElement.value).toBe('09:15 AM');
  });
});
