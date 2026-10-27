import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CimaTimePicker } from './time-picker';
import { CimaTime, isValidTime } from './time-value';
import { CimaTimepickerIntl } from './timepicker-intl';

@Component({
  imports: [CimaTimePicker, ReactiveFormsModule],
  template: '<cima-time-picker [formControl]="control" [minTime]="minimum()" [maxTime]="maximum()" />',
})
class FormHost {
  readonly minimum = signal<CimaTime | null>(null);
  readonly maximum = signal<CimaTime | null>(null);
  readonly control = new FormControl<CimaTime | null>({ hours: 7, minutes: 15, seconds: 32 });
}

describe('CimaTimePicker', () => {
  it('revalidates daily rules without replacing the form value or hiding its digits', async () => {
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    host.minimum.set({ hours: 9, minutes: 0, seconds: 0 });
    await fixture.whenStable();
    expect(host.control.hasError('timeMin')).toBe(true);
    const picker = fixture.debugElement.children[0].componentInstance as CimaTimePicker;
    expect(picker.display('hours')).toBe('07');
    expect(host.control.value?.hours).toBe(7);
    host.minimum.set(null);
    await fixture.whenStable();
    expect(host.control.valid).toBe(true);
  });

  it('keeps intermediate edits but does not complete an excluded time', () => {
    const fixture = TestBed.createComponent(CimaTimePicker);
    fixture.componentRef.setInput('minTime', { hours: 9, minutes: 30, seconds: 0 });
    const picker = fixture.componentInstance;
    picker.writeValue({ hours: 9, minutes: 0, seconds: 0 });
    picker.activeUnit.set('minutes');
    const complete = vi.fn();
    picker.selectionComplete.subscribe(complete);
    picker.clockKey(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(complete).not.toHaveBeenCalled();
    picker.writeValue({ hours: 9, minutes: 30, seconds: 0 });
    picker.clockKey(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(complete).toHaveBeenCalledOnce();
  });
  it('preserves invalid form values and reports invalidTime even with required', () => {
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    const control = fixture.componentInstance.control;
    control.addValidators(Validators.required);
    const invalid = { hours: 25, minutes: 0, seconds: 0 };
    control.setValue(invalid);
    fixture.detectChanges();
    const picker = fixture.debugElement.children[0].componentInstance as CimaTimePicker;
    expect(control.value).toBe(invalid);
    expect(control.hasError('invalidTime')).toBe(true);
    expect(control.valid).toBe(false);
    expect(picker.value()).toEqual(invalid);
    expect(picker.display('hours')).toBe('');
    control.setValue({ hours: 14, minutes: 30, seconds: 0 });
    expect(control.valid).toBe(true);
    control.reset();
    expect(control.hasError('required')).toBe(true);
    expect(control.hasError('invalidTime')).toBe(false);
  });

  it('rejects invalid direct bindings in the display without rewriting their model', () => {
    const fixture = TestBed.createComponent(CimaTimePicker);
    const invalid = { hours: 99, minutes: 0, seconds: 0 };
    fixture.componentRef.setInput('value', invalid);
    fixture.componentRef.setInput('hourCycle', '12');
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe(invalid);
    expect(fixture.componentInstance.invalidTime()).toBe(true);
    expect(fixture.componentInstance.display('hours')).toBe('');
    expect(fixture.nativeElement.getAttribute('aria-invalid')).toBe('true');
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toBe('Enter a valid time');
  });

  it('allows changing AM/PM after minute edits and confirms only on Enter', () => {
    const fixture = TestBed.createComponent(CimaTimePicker);
    fixture.componentRef.setInput('timeView', 'input');
    fixture.componentRef.setInput('hourCycle', '12');
    fixture.componentInstance.writeValue({ hours: 7, minutes: 0, seconds: 0 });
    const complete = vi.fn();
    fixture.componentInstance.selectionComplete.subscribe(complete);
    fixture.detectChanges();
    const minute = fixture.nativeElement.querySelectorAll('input')[1] as HTMLInputElement;
    minute.value = '30';
    minute.dispatchEvent(new Event('change'));
    (fixture.nativeElement.querySelectorAll('.period button')[1] as HTMLButtonElement).click();
    expect(complete).not.toHaveBeenCalled();
    expect(fixture.componentInstance.value()).toEqual({ hours: 19, minutes: 30, seconds: 0 });
    minute.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(complete).toHaveBeenCalledExactlyOnceWith({ hours: 19, minutes: 30, seconds: 0 });
  });

  it('does not confirm an invalid numeric field on Enter', () => {
    const fixture = TestBed.createComponent(CimaTimePicker);
    fixture.componentRef.setInput('timeView', 'input');
    fixture.componentInstance.writeValue({ hours: 7, minutes: 30, seconds: 0 });
    const complete = vi.fn();
    fixture.componentInstance.selectionComplete.subscribe(complete);
    fixture.detectChanges();
    const minute = fixture.nativeElement.querySelectorAll('input')[1] as HTMLInputElement;
    minute.value = '99';
    minute.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(complete).not.toHaveBeenCalled();
    expect(minute.value).toBe('30');
  });

  it('refreshes global translations at runtime without changing the value', () => {
    const intl = TestBed.inject(CimaTimepickerIntl);
    const fixture = TestBed.createComponent(CimaTimePicker);
    const value = { hours: 7, minutes: 15, seconds: 32 };
    fixture.componentInstance.writeValue(value);
    const changes = vi.fn();
    fixture.componentInstance.timeChange.subscribe(changes);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.heading').textContent).toBe('Select time');
    intl.selectTime = 'Seleziona ora';
    intl.hours = 'Ore';
    intl.changes.next();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.heading').textContent).toBe('Seleziona ora');
    expect(fixture.nativeElement.querySelector('.digit').getAttribute('aria-label')).toBe('Ore: 07');
    expect(fixture.componentInstance.value()).toEqual(value);
    expect(changes).not.toHaveBeenCalled();
  });

  it('preserves a local override while updating the other global labels', () => {
    const intl = TestBed.inject(CimaTimepickerIntl);
    const fixture = TestBed.createComponent(CimaTimePicker);
    fixture.componentRef.setInput('labels', { selectTime: 'Appointment' });
    fixture.detectChanges();
    intl.selectTime = 'Seleziona ora';
    intl.hours = 'Ore';
    intl.changes.next();
    fixture.detectChanges();
    expect(fixture.componentInstance.resolvedLabels().selectTime).toBe('Appointment');
    expect(fixture.componentInstance.resolvedLabels().hours).toBe('Ore');
  });

  it('allows replacing the global service through Angular providers', () => {
    const intl = new CimaTimepickerIntl();
    intl.selectTime = 'Custom global label';
    TestBed.configureTestingModule({ providers: [{ provide: CimaTimepickerIntl, useValue: intl }] });
    const fixture = TestBed.createComponent(CimaTimePicker);
    expect(fixture.componentInstance.resolvedLabels().selectTime).toBe('Custom global label');
  });

  it('validates canonical hours and rejects incomplete or fractional values', () => {
    expect(isValidTime({ hours: 23, minutes: 59, seconds: 59 })).toBe(true);
    expect(isValidTime({ hours: 24, minutes: 0, seconds: 0 })).toBe(false);
    expect(isValidTime({ hours: 12, minutes: 1.5, seconds: 0 })).toBe(false);
    expect(isValidTime({ hours: 12, minutes: 0 })).toBe(false);
  });

  it('does not publish changes when a value is written by the form', () => {
    const fixture = TestBed.createComponent(CimaTimePicker);
    const changes = vi.fn();
    fixture.componentInstance.registerOnChange(changes);
    fixture.componentInstance.timeChange.subscribe(changes);
    fixture.componentInstance.writeValue({ hours: 12, minutes: 30, seconds: 10 });
    expect(changes).not.toHaveBeenCalled();
  });

  it('maps 12 AM and 12 PM to canonical midnight and noon', () => {
    const fixture = TestBed.createComponent(CimaTimePicker);
    fixture.componentRef.setInput('hourCycle', '12');
    const picker = fixture.componentInstance;
    picker.writeValue({ hours: 0, minutes: 15, seconds: 32 });
    expect(picker.display('hours')).toBe('12');
    picker.setPeriod(true);
    expect(picker.value()).toEqual({ hours: 12, minutes: 15, seconds: 32 });
    picker.setPeriod(false);
    expect(picker.value()?.hours).toBe(0);
  });

  it('keeps hidden seconds and does not mutate the original object', () => {
    const fixture = TestBed.createComponent(CimaTimePicker);
    const original = { hours: 7, minutes: 15, seconds: 32 };
    fixture.componentInstance.writeValue(original);
    fixture.componentInstance.setPeriod(true);
    expect(fixture.componentInstance.value()).toEqual({ hours: 19, minutes: 15, seconds: 32 });
    expect(original.hours).toBe(7);
  });

  it('wraps keyboard selection and respects the configured increment', () => {
    const fixture = TestBed.createComponent(CimaTimePicker);
    fixture.componentRef.setInput('minuteStep', 5);
    const picker = fixture.componentInstance;
    picker.writeValue({ hours: 23, minutes: 55, seconds: 0 });
    picker.activeUnit.set('minutes');
    picker.clockKey(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    expect(picker.value()).toEqual({ hours: 23, minutes: 0, seconds: 0 });
  });

  it('uses 00–11 outside and 12–23 inside the 24-hour clock', () => {
    const fixture = TestBed.createComponent(CimaTimePicker);
    fixture.componentRef.setInput('hourDial', 'dual-ring');
    const picker = fixture.componentInstance;
    const pointer = dialPointer(picker);
    pointer.tap(182, 100);
    expect(picker.value()?.hours).toBe(3);
    picker.activeUnit.set('hours');
    pointer.tap(158, 100);
    expect(picker.value()?.hours).toBe(15);
    picker.activeUnit.set('hours');
    pointer.tap(100, 42);
    expect(picker.value()?.hours).toBe(12);
    picker.activeUnit.set('hours');
    pointer.tap(100, 18);
    expect(picker.value()?.hours).toBe(0);
    picker.activeUnit.set('hours');
    expect(picker.clockLabels()[0].value).toBe(0);
    expect(picker.clockLabels()[12].value).toBe(12);
  });

  it('defaults to one 24-hour ring with even labels and odd-hour marks', () => {
    const picker = TestBed.createComponent(CimaTimePicker).componentInstance;
    expect(picker.hourDial()).toBe('single-ring');
    const ticks = picker.clockLabels();
    expect(ticks).toHaveLength(24);
    expect(ticks.filter(tick => !tick.mark).map(tick => tick.value)).toEqual(
      [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]);
    expect(ticks.every(tick => !tick.inner)).toBe(true);
    expect(ticks[6].x).toBeGreaterThan(89);
    expect(ticks[6].y).toBeCloseTo(50);
  });

  it('selects all 24 single-ring hours independently of the pointer radius', () => {
    const picker = TestBed.createComponent(CimaTimePicker).componentInstance;
    const pointer = dialPointer(picker);
    for (let hour = 0; hour < 24; hour++) {
      const angle = hour * Math.PI / 12;
      for (const radius of [58, 82]) {
        picker.activeUnit.set('hours');
        pointer.tap(100 + Math.sin(angle) * radius, 100 - Math.cos(angle) * radius);
        expect(picker.value()?.hours).toBe(hour);
      }
    }
  });

  it('keeps the 12-hour dial unchanged when switching the 24-hour layout', () => {
    const fixture = TestBed.createComponent(CimaTimePicker);
    fixture.componentRef.setInput('hourCycle', '12');
    const picker = fixture.componentInstance;
    const single = picker.clockLabels();
    fixture.componentRef.setInput('hourDial', 'dual-ring');
    expect(picker.clockLabels()).toEqual(single);
    expect(picker.clockLabels()).toHaveLength(12);
    expect(picker.clockLabels().every(tick => !tick.mark && !tick.inner)).toBe(true);
  });

  it('snaps a minute tap to five while ignoring small pointer jitter', () => {
    const picker = TestBed.createComponent(CimaTimePicker).componentInstance;
    picker.activeUnit.set('minutes');
    const pointer = dialPointer(picker);
    const position = minutePoint(17);
    pointer.send('pointerdown', position.x, position.y);
    pointer.send('pointermove', position.x + 1, position.y);
    expect(picker.value()).toBeNull();
    pointer.send('pointerup', position.x, position.y);
    expect(picker.value()?.minutes).toBe(15);
    expect(picker.clockUnit()).toBe('minutes');
  });

  it('preserves minute precision during dragging and reads the final release position', () => {
    const picker = TestBed.createComponent(CimaTimePicker).componentInstance;
    picker.activeUnit.set('minutes');
    const pointer = dialPointer(picker);
    pointer.send('pointerdown', 100, 18);
    const move = minutePoint(17);
    pointer.send('pointermove', move.x, move.y);
    expect(picker.value()?.minutes).toBe(17);
    const release = minutePoint(18);
    pointer.send('pointerup', release.x, release.y);
    expect(picker.value()?.minutes).toBe(18);
  });

  it('wraps a minute tap near 59 to zero instead of clamping it to 59', () => {
    const picker = TestBed.createComponent(CimaTimePicker).componentInstance;
    picker.activeUnit.set('minutes');
    const position = minutePoint(59);
    dialPointer(picker).tap(position.x, position.y);
    expect(picker.value()?.minutes).toBe(0);
  });

  it('advances to minutes only after completing the hour gesture', () => {
    const picker = TestBed.createComponent(CimaTimePicker).componentInstance;
    const pointer = dialPointer(picker);
    pointer.send('pointerdown', 182, 100);
    expect(picker.clockUnit()).toBe('hours');
    pointer.send('pointerup', 182, 100);
    expect(picker.clockUnit()).toBe('minutes');
    expect(picker.dragging()).toBe(false);
  });

  it('does not commit or advance a cancelled pointer gesture', () => {
    const picker = TestBed.createComponent(CimaTimePicker).componentInstance;
    const pointer = dialPointer(picker);
    pointer.send('pointerdown', 182, 100);
    pointer.send('pointercancel', 182, 100);
    pointer.send('pointerup', 182, 100);
    expect(picker.value()).toBeNull();
    expect(picker.clockUnit()).toBe('hours');
    expect(picker.dragging()).toBe(false);
  });

  it('completes a minute selection only on release, including an unchanged value', () => {
    const picker = TestBed.createComponent(CimaTimePicker).componentInstance;
    picker.writeValue({ hours: 7, minutes: 0, seconds: 0 });
    picker.activeUnit.set('minutes');
    const complete = vi.fn();
    picker.selectionComplete.subscribe(complete);
    const pointer = dialPointer(picker);
    pointer.send('pointerdown', 100, 18);
    expect(complete).not.toHaveBeenCalled();
    pointer.send('pointerup', 100, 18);
    expect(complete).toHaveBeenCalledExactlyOnceWith({ hours: 7, minutes: 0, seconds: 0 });
  });

  it('waits for seconds when they are visible', () => {
    const fixture = TestBed.createComponent(CimaTimePicker);
    fixture.componentRef.setInput('showSeconds', true);
    const picker = fixture.componentInstance;
    picker.activeUnit.set('minutes');
    const complete = vi.fn();
    picker.selectionComplete.subscribe(complete);
    const pointer = dialPointer(picker);
    pointer.tap(182, 100);
    expect(picker.clockUnit()).toBe('seconds');
    expect(complete).not.toHaveBeenCalled();
    pointer.tap(182, 100);
    expect(complete).toHaveBeenCalledOnce();
    expect(picker.value()?.seconds).toBe(15);
  });

  it('completes keyboard selection only on Enter, not on arrow changes', () => {
    const picker = TestBed.createComponent(CimaTimePicker).componentInstance;
    picker.writeValue({ hours: 7, minutes: 0, seconds: 0 });
    picker.activeUnit.set('minutes');
    const complete = vi.fn();
    picker.selectionComplete.subscribe(complete);
    picker.clockKey(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    expect(complete).not.toHaveBeenCalled();
    picker.clockKey(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(complete).toHaveBeenCalledOnce();
  });

  it('takes the shortest animation path across twelve oclock', () => {
    const fixture = TestBed.createComponent(CimaTimePicker);
    fixture.componentRef.setInput('hourCycle', '12');
    const picker = fixture.componentInstance;
    picker.writeValue({ hours: 11, minutes: 0, seconds: 0 });
    const start = picker.handAngle();
    picker.writeValue({ hours: 0, minutes: 0, seconds: 0 });
    expect(picker.handAngle() - start).toBe(30);
  });

  it('restores an out-of-range manually entered field', () => {
    const fixture = TestBed.createComponent(CimaTimePicker);
    fixture.componentRef.setInput('timeView', 'input');
    fixture.componentInstance.writeValue({ hours: 7, minutes: 15, seconds: 0 });
    fixture.detectChanges();
    const field = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    field.value = '25';
    field.dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.value()?.hours).toBe(7);
    expect(field.value).toBe('07');
  });

  it('hides the switch when the view is fixed', () => {
    const fixture = TestBed.createComponent(CimaTimePicker);
    fixture.componentRef.setInput('allowViewSwitch', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.view-switch')).toBeNull();
  });

  it('falls back to the minute clock when seconds are hidden dynamically', () => {
    const fixture = TestBed.createComponent(CimaTimePicker);
    fixture.componentRef.setInput('showSeconds', true);
    fixture.componentInstance.activeUnit.set('seconds');
    fixture.componentRef.setInput('showSeconds', false);
    expect(fixture.componentInstance.clockUnit()).toBe('minutes');
  });

  it('propagates user edits and reset through a real form control', () => {
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    const picker = fixture.debugElement.children[0].componentInstance as CimaTimePicker;
    picker.setPeriod(true);
    expect(fixture.componentInstance.control.value).toEqual({ hours: 19, minutes: 15, seconds: 32 });
    fixture.componentInstance.control.reset();
    expect(picker.value()).toBeNull();
  });

  it('blocks changes when disabled by Angular Forms', () => {
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    const picker = fixture.debugElement.children[0].componentInstance as CimaTimePicker;
    fixture.componentInstance.control.disable();
    picker.setPeriod(true);
    expect(fixture.componentInstance.control.value?.hours).toBe(7);
    expect(picker.isDisabled()).toBe(true);
  });
});

/** Builds a pointer surface with real capture state and a deterministic 200px dial. */
function dialPointer(picker: CimaTimePicker) {
  let captured = false;
  const clock = {
    focus: vi.fn(),
    setPointerCapture: () => { captured = true; },
    hasPointerCapture: () => captured,
    releasePointerCapture: () => { captured = false; },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 200, height: 200 }),
  };
  /** Dispatches one phase through the component's public pointer handlers. */
  function send(type: string, x: number, y: number): void {
    const event = { type, button: 0, pointerId: 1, clientX: x, clientY: y,
      currentTarget: clock } as unknown as PointerEvent;
    if (type === 'pointerup') picker.finishPoint(event);
    else if (type === 'pointercancel') picker.cancelPoint(event);
    else picker.point(event);
  }
  return { send,
    /** Performs a tap without any movement. */
    tap(x: number, y: number): void { send('pointerdown', x, y); send('pointerup', x, y); },
  };
}

/** Returns a position on the dial for a particular minute. */
function minutePoint(minute: number) {
  const angle = minute * Math.PI / 30;
  return { x: 100 + Math.sin(angle) * 82, y: 100 - Math.cos(angle) * 82 };
}
