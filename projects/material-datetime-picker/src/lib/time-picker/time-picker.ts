import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, effect, ElementRef, forwardRef, inject, input, linkedSignal,
  model, output, signal, untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { validateTime } from './time-constraints';
import { CimaTimepickerIntl } from './timepicker-intl';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  CimaHourDial, CimaTime, CimaTimeFilter, CimaTimeLabels, CimaTimeUnit, CimaTimeView, isValidTime,
} from './time-value';

/** Reusable time selection content; the host owns the popup and confirmation buttons. */
@Component({
  selector: 'cima-time-picker',
  imports: [MatButtonModule],
  templateUrl: './time-picker.html',
  styleUrl: './time-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CimaTimePicker), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => CimaTimePicker), multi: true },
  ],
  host: { '[class.cima-time-disabled]': 'isDisabled()', '[attr.aria-invalid]': '!!timeErrors() || null', '(focusout)': 'onFocusOut($event)' },
})
export class CimaTimePicker implements ControlValueAccessor, Validator {
  readonly value = model<CimaTime | null>(null);
  readonly timeView = model<CimaTimeView>('clock');
  readonly allowViewSwitch = input(true);
  readonly hourCycle = input<'12' | '24'>('24');
  readonly hourDial = input<CimaHourDial>('single-ring');
  readonly singleRing24 = computed(() => this.hourCycle() === '24' && this.hourDial() === 'single-ring');
  readonly showSeconds = input(false);
  readonly hourStep = input(1);
  readonly minuteStep = input(1);
  readonly secondStep = input(1);
  readonly disabled = input(false);
  readonly minTime = input<CimaTime | null>(null);
  readonly maxTime = input<CimaTime | null>(null);
  readonly timeFilter = input<CimaTimeFilter | null>(null);
  readonly timeErrors = computed(() => this.validateTimeValue(this.value()));
  readonly labels = input<Partial<CimaTimeLabels>>({});
  private readonly intl = inject(CimaTimepickerIntl);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly intlChanges = toSignal(this.intl.changes, { equal: () => false });
  readonly resolvedLabels = computed<CimaTimeLabels>(() => {
    this.intlChanges();
    return { selectTime: this.intl.selectTime, enterTime: this.intl.enterTime,
      hours: this.intl.hours, minutes: this.intl.minutes, seconds: this.intl.seconds,
      am: this.intl.am, pm: this.intl.pm, period: this.intl.period, invalidTime: this.intl.invalidTime, unavailableTime: this.intl.unavailableTime,
      switchToInput: this.intl.switchToInput, switchToClock: this.intl.switchToClock,
      ...this.labels() };
  });
  /** User edits only; writing a form value never emits this event. */
  readonly timeChange = output<CimaTime>();
  /** A completed selection of the last visible unit, even when its value is unchanged. */
  readonly selectionComplete = output<CimaTime>();

  readonly activeUnit = signal<CimaTimeUnit>('hours');
  private readonly formDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  readonly invalidTime = computed(() => this.value() != null && !isValidTime(this.value()));
  readonly time = computed(() => {
    const value = this.value();
    return isValidTime(value) ? value : { hours: 0, minutes: 0, seconds: 0 };
  });
  readonly units = computed<CimaTimeUnit[]>(() =>
    this.showSeconds() ? ['hours', 'minutes', 'seconds'] : ['hours', 'minutes']);
  readonly clockUnit = computed(() => this.activeUnit() === 'seconds' && !this.showSeconds()
    ? 'minutes' : this.activeUnit());
  readonly clockMaximum = computed(() => this.clockUnit() === 'hours' ? 23 : 59);
  readonly clockValue = computed(() => this.time()[this.clockUnit()]);
  readonly clockLabels = computed(() => {
    const hours = this.clockUnit() === 'hours';
    const count = hours && this.hourCycle() === '24' ? 24 : 12;
    return Array.from({ length: count }, (_, index) => {
      const value = hours ? (this.hourCycle() === '24' ? index : index || 12) : index * 5;
      const single = hours && this.singleRing24();
      const angle = index * (single ? Math.PI / 12 : Math.PI / 6);
      const inner = !single && index >= 12;
      const radius = inner ? 69 / 256 * 100 : 101 / 256 * 100;
      return { value, inner, mark: single && index % 2 === 1, angle: angle * 180 / Math.PI, label: hours ? String(value).padStart(this.hourCycle() === '24' ? 2 : 1, '0')
        : String(value).padStart(2, '0'), x: 50 + Math.sin(angle) * radius,
        y: 50 - Math.cos(angle) * radius };
    });
  });
  readonly handAngle = linkedSignal<number, number>({
    source: () => this.clockValue() * (this.clockUnit() === 'hours' ? (this.singleRing24() ? 15 : 30) : 6) % 360,
    // Keep equivalent angles continuous so transitions take the shortest path across zero.
    computation: (angle, previous) => {
      const start = previous?.value ?? angle;
      return start + ((angle - start % 360 + 540) % 360 - 180);
    },
  });
  readonly dragging = signal(false);
  private gesture: { id: number; x: number; y: number; unit: CimaTimeUnit; moved: boolean } | null = null;
  readonly handLength = computed(() => this.clockUnit() === 'hours' && this.hourCycle() === '24'
    && this.hourDial() === 'dual-ring' && this.clockValue() >= 12 ? `${69 / 256 * 100}%` : `${101 / 256 * 100}%`);
  private onChange: (value: CimaTime | null) => void = () => {};
  private onTouched: () => void = () => {};
  private onValidatorChange: () => void = () => {};

  /** Retains the control root for detecting focus transitions outside the picker. */
  constructor(private readonly element: ElementRef<HTMLElement>) {
    effect(() => {
      this.minTime(); this.maxTime(); this.timeFilter();
      untracked(() => this.onValidatorChange());
    });
  }

  /** Receives a form value without emitting a user change or mutating the object. */
  writeValue(value: CimaTime | null): void {
    this.value.set(isValidTime(value) ? { ...value } : value ?? null);
  }

  /** Reports invalid incoming values without changing Angular Forms' model. */
  validate(control: AbstractControl): ValidationErrors | null {
    return this.validateTimeValue(control.value);
  }

  /** Notifies Forms when daily constraints change, even if the selected value stays the same. */
  registerOnValidatorChange(callback: () => void): void { this.onValidatorChange = callback; }

  /** Shares the same daily-time rules between form validation and completion. */
  private validateTimeValue(value: unknown): ValidationErrors | null {
    return validateTime(value, { minTime: this.minTime(), maxTime: this.maxTime(), timeFilter: this.timeFilter() });
  }

  /** Registers Angular Forms' value callback. */
  registerOnChange(callback: (value: CimaTime | null) => void): void { this.onChange = callback; }

  /** Registers Angular Forms' touched callback. */
  registerOnTouched(callback: () => void): void { this.onTouched = callback; }

  /** Applies the disabled state from Angular Forms. */
  setDisabledState(disabled: boolean): void { this.formDisabled.set(disabled); }

  /** Marks the control touched only when focus leaves the entire picker. */
  onFocusOut(event: FocusEvent): void {
    if (!this.element.nativeElement.contains(event.relatedTarget as Node | null)) this.onTouched();
  }

  /** Formats a field without changing the canonical 24-hour value. */
  display(unit: CimaTimeUnit): string {
    if (this.invalidTime()) return '';
    let value = this.time()[unit];
    if (unit === 'hours' && this.hourCycle() === '12') value = value % 12 || 12;
    return String(value).padStart(2, '0');
  }

  /** Returns a localized accessible label for a unit. */
  label(unit: CimaTimeUnit): string { return this.resolvedLabels()[unit]; }

  /** Includes the period so a 12-hour clock remains unambiguous to screen readers. */
  clockValueText(): string {
    const period = this.hourCycle() === '12' && this.clockUnit() === 'hours'
      ? ` ${this.time().hours >= 12 ? this.resolvedLabels().pm : this.resolvedLabels().am}` : '';
    return this.display(this.clockUnit()) + period;
  }

  /** Returns a positive integer step; malformed configuration falls back to one. */
  step(unit: CimaTimeUnit): number {
    const value = unit === 'hours' ? this.hourStep() : unit === 'minutes' ? this.minuteStep() : this.secondStep();
    return Number.isInteger(value) && value > 0 && value <= (unit === 'hours' ? 23 : 59) ? value : 1;
  }

  /** Selects the whole numeric field so the next digit replaces its current value. */
  selectField(unit: CimaTimeUnit, event: Event): void {
    this.activeUnit.set(unit);
    (event.target as HTMLInputElement).select();
  }

  /** Clamps typed or pasted values immediately and advances after two digits. */
  typeUnit(unit: CimaTimeUnit, event: Event): void {
    if (this.isDisabled()) return;
    const field = event.target as HTMLInputElement;
    const text = field.value;
    if (!text) return;
    if (!/^\d+$/.test(text)) { field.value = this.display(unit); return; }
    const twelve = unit === 'hours' && this.hourCycle() === '12';
    const maximum = unit === 'hours' ? (twelve ? 12 : 23) : 59;
    const value = Number(text);
    // A leading zero must remain editable so 01–09 can be entered in 12-hour mode.
    if (text.length < 2 && value <= maximum) {
      if (!twelve || value > 0) {
        this.edit(unit, event);
        // Refresh the formatted binding before restoring the unfinished single digit.
        this.changeDetector.detectChanges();
        field.value = text;
      }
      return;
    }
    field.value = String(text.length > 2 ? maximum : Math.max(twelve ? 1 : 0, Math.min(value, maximum)));
    this.edit(unit, event);
    const next = this.units().indexOf(unit) + 1;
    const nextField = this.element.nativeElement.querySelectorAll<HTMLInputElement>('input')[next];
    if (nextField) { this.activeUnit.set(this.units()[next]); nextField.focus(); }
  }

  /** Commits a valid keyboard field and restores its display when invalid. */
  edit(unit: CimaTimeUnit, event: Event): boolean {
    const field = event.target as HTMLInputElement;
    const value = Number(field.value);
    const twelve = unit === 'hours' && this.hourCycle() === '12';
    const maximum = unit === 'hours' ? (twelve ? 12 : 23) : 59;
    const valid = !this.isDisabled() && !!field.value.trim() && Number.isInteger(value)
      && value >= (twelve ? 1 : 0) && value <= maximum;
    if (valid) {
      this.setUnit(unit, twelve ? value % 12 + (this.time().hours >= 12 ? 12 : 0) : value);
    }
    field.value = this.display(unit);
    return valid;
  }

  /** Confirms numeric fields explicitly, so blur to AM/PM or Cancel never confirms. */
  confirmInput(unit: CimaTimeUnit, event: Event): void {
    event.preventDefault();
    if ((event as KeyboardEvent).repeat || !this.edit(unit, event)) return;
    this.finishSelection(unit);
    const next = this.units().indexOf(unit) + 1;
    this.element.nativeElement.querySelectorAll<HTMLInputElement>('input')[next]?.focus();
  }

  /** Updates AM/PM while preserving minutes, seconds and the hour within the period. */
  setPeriod(pm: boolean): void { this.setUnit('hours', this.time().hours % 12 + (pm ? 12 : 0)); }

  /** Switches between the clock and editable fields without committing the host's draft. */
  switchView(): void {
    if (!this.isDisabled()) this.timeView.set(this.timeView() === 'clock' ? 'input' : 'clock');
  }

  /** Captures a primary pointer and updates the dial only after a real drag starts. */
  point(event: PointerEvent): void {
    if (this.isDisabled()) return;
    const clock = event.currentTarget as HTMLElement;
    if (event.type === 'pointerdown') {
      if (event.button !== 0 || this.gesture) return;
      this.gesture = { id: event.pointerId, x: event.clientX, y: event.clientY,
        unit: this.clockUnit(), moved: false };
      this.dragging.set(true);
      clock.focus();
      clock.setPointerCapture(event.pointerId);
      return;
    }
    const gesture = this.gesture;
    if (!gesture || gesture.id !== event.pointerId || !clock.hasPointerCapture(event.pointerId)) return;
    if (gesture.unit !== this.clockUnit()) { this.cancelPoint(event); return; }
    // Eight CSS pixels prevent pointer jitter from turning a tap into a precise drag.
    gesture.moved ||= Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 8;
    if (gesture.moved) this.selectPoint(event, false);
  }

  /** Reads the release position, snaps minute taps to five, then advances the active unit. */
  finishPoint(event: PointerEvent): void {
    const gesture = this.gesture;
    if (!gesture || gesture.id !== event.pointerId) return;
    gesture.moved ||= Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 8;
    if (!this.isDisabled() && gesture.unit === this.clockUnit()) {
      this.selectPoint(event, !gesture.moved);
      this.cancelPoint(event);
      this.finishSelection(gesture.unit);
    } else {
      this.cancelPoint(event);
    }
  }

  /** Cancels a lost/interrupted pointer without selecting a new value or advancing the view. */
  cancelPoint(event: PointerEvent): void {
    if (this.gesture?.id !== event.pointerId) return;
    this.gesture = null;
    this.dragging.set(false);
    const clock = event.currentTarget as HTMLElement;
    if (clock.hasPointerCapture(event.pointerId)) clock.releasePointerCapture(event.pointerId);
  }

  /** Converts a dial position to the active unit using the configured 24-hour dial layout. */
  private selectPoint(event: PointerEvent, tap: boolean): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    const turn = (Math.atan2(x, -y) + Math.PI * 2) % (Math.PI * 2);
    const unit = this.clockUnit();
    const count = unit === 'hours' ? (this.singleRing24() ? 24 : 12) : 60;
    let value = Math.round(turn / (Math.PI * 2) * count) % count;
    if (unit === 'hours') {
      const inner = Math.hypot(x, y) <= rect.width * (81 / 256);
      if (this.hourCycle() === '12') value += this.time().hours >= 12 ? 12 : 0;
      else if (!this.singleRing24() && inner) value += 12;
    } else {
      const configuredStep = this.step(unit);
      const step = tap && configuredStep === 1 ? 5 : configuredStep;
      value = Math.round(value / step) * step;
      if (value >= 60) value = 0;
    }
    this.setUnit(unit, value);
  }

  /** Supports arrow keys, Home and End on the clock's accessible slider. */
  clockKey(event: KeyboardEvent): void {
    if (this.isDisabled()) return;
    if (event.key === 'Enter') {
      event.preventDefault();
      if (!event.repeat) this.finishSelection(this.clockUnit());
      return;
    }
    const maximum = this.clockMaximum();
    const direction = ['ArrowUp', 'ArrowRight'].includes(event.key) ? 1
      : ['ArrowDown', 'ArrowLeft'].includes(event.key) ? -1 : 0;
    if (!direction && event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault();
    const value = event.key === 'Home' ? 0 : event.key === 'End' ? maximum
      : (this.clockValue() + direction * this.step(this.clockUnit()) + maximum + 1) % (maximum + 1);
    this.setUnit(this.clockUnit(), value);
  }

  /** Advances intermediate units or lets the host confirm the last visible unit. */
  private finishSelection(unit: CimaTimeUnit): void {
    if (unit === 'hours') this.activeUnit.set('minutes');
    else if (unit === 'minutes' && this.showSeconds()) this.activeUnit.set('seconds');
    else {
      const value = this.value();
      if (isValidTime(value) && !this.timeErrors()) this.selectionComplete.emit({ ...value });
    }
  }

  /** Publishes an immutable, valid user selection through binding and Angular Forms. */
  private setUnit(unit: CimaTimeUnit, value: number): void {
    if (this.isDisabled()) return;
    const next = { ...this.time(), [unit]: value };
    if (!isValidTime(next)) return;
    const previous = this.value();
    if (previous && previous.hours === next.hours && previous.minutes === next.minutes && previous.seconds === next.seconds) return;
    this.value.set(next);
    this.onChange({ ...next });
    this.timeChange.emit({ ...next });
  }
}
