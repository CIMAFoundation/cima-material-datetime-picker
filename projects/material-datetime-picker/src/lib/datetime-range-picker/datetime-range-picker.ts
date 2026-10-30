import { NgTemplateOutlet } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { booleanAttribute, ChangeDetectorRef, Component, ElementRef, forwardRef, inject, Input, model, OnChanges, output, signal, SimpleChanges, ViewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DateAdapter } from '@angular/material/core';
import { DateRange, DefaultMatCalendarRangeStrategy, MAT_DATE_RANGE_SELECTION_STRATEGY, MatCalendar } from '@angular/material/datepicker';
import { CimaTimePicker } from '../time-picker/time-picker';
import { CimaHourDial, CimaTimePrecision, withTimePrecision, CimaTime, CimaTimeView, isValidTime } from '../time-picker/time-value';
import { CimaTimepickerIntl } from '../time-picker/timepicker-intl';

export interface CimaDatetimeRange { start: Date | null; end: Date | null; }
export type CimaDatetimeRangeLayout = 'auto' | 'horizontal' | 'vertical';

/** Confirmed datetime interval with a Material range calendar and two reusable time controls. */
@Component({
  selector: 'cima-datetime-range-picker',
  exportAs: 'cimaDatetimeRangePicker',
  imports: [NgTemplateOutlet, MatFormFieldModule, MatInputModule, CdkOverlayOrigin, CdkConnectedOverlay, CdkTrapFocus, MatButtonModule, MatCalendar, CimaTimePicker],
  providers: [
    DefaultMatCalendarRangeStrategy,
    { provide: MAT_DATE_RANGE_SELECTION_STRATEGY, useExisting: DefaultMatCalendarRangeStrategy },
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CimaDatetimeRangePicker), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => CimaDatetimeRangePicker), multi: true },
  ],
  templateUrl: './datetime-range-picker.html',
  styleUrl: './datetime-range-picker.scss',
})
export class CimaDatetimeRangePicker implements ControlValueAccessor, Validator, OnChanges {
  readonly value = model<CimaDatetimeRange | null>(null);
  @Input() layout: CimaDatetimeRangeLayout = 'auto';
  @Input() timeView: CimaTimeView = 'input';
  @Input() precision: CimaTimePrecision = 'full';
  @Input() hourCycle: '12' | '24' = '24';
  @Input() hourDial: CimaHourDial = 'dual-ring';
  @Input({ transform: booleanAttribute }) showSeconds = false;
  @Input({ transform: booleanAttribute }) allowViewSwitch = true;
  @Input({ transform: booleanAttribute }) disabled = false;
  @Input() min: Date | null = null;
  @Input() max: Date | null = null;
  @Input() label?: string;
  @Input() startLabel?: string;
  @Input() endLabel?: string;
  @Input() invalidRangeLabel?: string;
  readonly confirmed = output<CimaDatetimeRange>();
  readonly cancelled = output<void>();
  readonly opened = output<void>();
  readonly closed = output<void>();
  readonly isOpen = signal(false);
  readonly dates = signal(new DateRange<Date>(null, null));
  readonly startTime = signal<CimaTime | null>(null);
  readonly endTime = signal<CimaTime | null>(null);
  readonly formDisabled = signal(false);
  private readonly compactLayout = toSignal(inject(BreakpointObserver).observe('(max-width: 882px)'));
  readonly intl = inject(CimaTimepickerIntl);
  private readonly rangeStrategy = inject<DefaultMatCalendarRangeStrategy<Date>>(DefaultMatCalendarRangeStrategy);
  private readonly adapter = inject<DateAdapter<Date>>(DateAdapter);
  private readonly changeDetector = inject(ChangeDetectorRef);
  @ViewChild('trigger', { read: ElementRef }) private trigger?: ElementRef<HTMLInputElement>;
  private onChange: (value: CimaDatetimeRange | null) => void = () => {};
  private onTouched: () => void = () => {};
  private onValidatorChange: () => void = () => {};

  /** Focuses the first control after the range dialog has attached. */
  @ViewChild(CdkTrapFocus)
  set focusTrap(trap: CdkTrapFocus | undefined) { void trap?.focusTrap.focusFirstTabbableElementWhenReady(); }

  /** Combines explicit and Angular Forms disabling. */
  get isDisabled(): boolean { return this.disabled || this.formDisabled(); }

  /** Keeps visual and keyboard order consistent when the popup changes orientation. */
  get isVertical(): boolean { return this.layout === 'vertical' || (this.layout === 'auto' && !!this.compactLayout()?.matches); }

  /** Refreshes open previews and actions when the application changes locale or translations. */
  constructor() {
    merge(this.adapter.localeChanges, this.intl.changes).pipe(takeUntilDestroyed())
      .subscribe(() => this.changeDetector.markForCheck());
  }

  /** Formats previews and summaries with the calendar locale and configured time precision. */
  formatPreview(date: Date | null | undefined): string {
    if (!this.validDate(date)) return '';
    return this.adapter.format(date, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
      ...(this.showSeconds && this.precision !== 'hours' ? { second: '2-digit' } : {}),
      hourCycle: this.hourCycle === '12' ? 'h12' : 'h23',
    });
  }

  /** Displays the confirmed interval without parsing or exposing an editable text value. */
  get summary(): string {
    const range = this.value();
    return range ? `${this.formatPreview(range.start)} – ${this.formatPreview(range.end)}` : '';
  }

  /** Opens the read-only range field from the keyboard without inserting text. */
  onTriggerKeydown(event: KeyboardEvent): void {
    if (['Enter', ' ', 'ArrowDown'].includes(event.key)) { event.preventDefault(); this.open(); }
  }

  /** Combines calendar dates and local wall times without mutating either draft. */
  get draftValue(): CimaDatetimeRange {
    const { start, end } = this.dates();
    const first = this.startTime();
    const last = this.endTime();
    return {
      start: this.combine(start, first),
      end: this.combine(end, last),
    };
  }

  /** Allows confirmation only for a complete ordered interval within the instant limits. */
  get canConfirm(): boolean { return !this.isDisabled && !this.rangeErrors(this.draftValue); }

  /** Cancels disabled or replaced sessions and revalidates changed bounds. */
  ngOnChanges(changes: SimpleChanges): void {
    if (this.isDisabled || changes['value']) this.close();
    this.onValidatorChange();
  }

  /** Copies the current interval into an independent editing session. */
  open(): void {
    if (this.isDisabled || this.isOpen()) return;
    const value = this.value();
    const start = this.validDate(value?.start) ? value!.start : null;
    const end = this.validDate(value?.end) ? value!.end : null;
    this.dates.set(new DateRange(start ? this.adapter.clone(start) : null, end ? this.adapter.clone(end) : null));
    this.startTime.set(this.timeOf(start, 9));
    this.endTime.set(this.timeOf(end, 17));
    this.isOpen.set(true);
    this.opened.emit();
  }

  /** Starts a new interval after a complete range, or selects the second calendar day. */
  selectDate(date: Date | null): void {
    if (!this.validDate(date) || this.isDisabled || !this.isOpen()) return;
    this.dates.set(this.rangeStrategy.selectionFinished(this.adapter.clone(date), this.dates()));
  }

  /** Applies both endpoints atomically and emits copies independent of the form value. */
  confirm(): void {
    if (!this.isOpen() || !this.canConfirm) return;
    const value = this.copy(this.draftValue)!;
    this.value.set(value);
    this.onChange(this.copy(value));
    this.finish();
    this.confirmed.emit(this.copy(value)!);
  }

  /** Discards pending edits, including backdrop and Escape dismissals. */
  close(): void {
    if (!this.isOpen()) return;
    this.finish();
    this.cancelled.emit();
  }

  /** Closes on Escape without committing the interval. */
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); this.close(); }
  }

  /** Replaces the form value and cancels a stale editing session. */
  writeValue(value: CimaDatetimeRange | null): void { this.close(); this.value.set(this.copy(value)); }

  /** Registers the Angular Forms value callback. */
  registerOnChange(callback: (value: CimaDatetimeRange | null) => void): void { this.onChange = callback; }

  /** Registers the Angular Forms touched callback. */
  registerOnTouched(callback: () => void): void { this.onTouched = callback; }

  /** Registers revalidation when bounds change. */
  registerOnValidatorChange(callback: () => void): void { this.onValidatorChange = callback; }

  /** Applies Forms disabling and cancels an open session. */
  setDisabledState(disabled: boolean): void { this.formDisabled.set(disabled); if (disabled) this.close(); }

  /** Leaves empty values to required validators and validates every populated interval. */
  validate(control: AbstractControl): ValidationErrors | null {
    return this.configurationErrors() ?? (control.value == null ? null : this.rangeErrors(control.value));
  }

  /** Checks complete native dates and compares full instants, including overnight ranges. */
  private rangeErrors(value: CimaDatetimeRange): ValidationErrors | null {
    const config = this.configurationErrors();
    if (config) return config;
    if (!this.validDate(value?.start) || !this.validDate(value?.end)) return { cimaDatetimeRangeIncomplete: true };
    if (this.precision === 'hours' && [value.start!, value.end!].some(date => date.getMinutes() !== 0 || date.getSeconds() !== 0 || date.getMilliseconds() !== 0)) return { cimaDatetimeRangePrecision: true };
    if (value.start!.getTime() > value.end!.getTime()) return { cimaDatetimeRangeOrder: true };
    if ((this.min && (!this.validDate(this.min) || value.start!.getTime() < this.min.getTime()))
      || (this.max && (!this.validDate(this.max) || value.end!.getTime() > this.max.getTime()))) return { cimaDatetimeRangeBounds: true };
    return null;
  }

  /** Rejects invalid or reversed bounds even when no interval has been selected yet. */
  private configurationErrors(): ValidationErrors | null {
    if ((this.min != null && !this.validDate(this.min)) || (this.max != null && !this.validDate(this.max))
      || (this.min && this.max && this.min.getTime() > this.max.getTime())) return { cimaDatetimeRangeConfig: true };
    return null;
  }

  /** Rejects DST gaps and preserves the original instant for unchanged repeated local times. */
  private combine(date: Date | null, time: CimaTime | null): Date | null {
    if (!this.validDate(date) || !isValidTime(time)) return null;
    const selected = withTimePrecision(time, this.precision);
    const matches = (value: Date) => this.adapter.getHours(value) === selected.hours
      && this.adapter.getMinutes(value) === selected.minutes && this.adapter.getSeconds(value) === selected.seconds;
    if (matches(date) && (this.precision !== 'hours' || date.getMilliseconds() === 0)) return this.adapter.clone(date);
    const result = this.adapter.setTime(date, selected.hours, selected.minutes, selected.seconds);
    return this.adapter.sameDate(date, result) && matches(result) ? result : null;
  }

  /** Recognizes supported native Date values before using the adapter. */
  private validDate(date: unknown): date is Date { return date instanceof Date && this.adapter.isValid(date); }

  /** Extracts the endpoint time, using a useful initial hour for empty intervals. */
  private timeOf(date: Date | null, hour: number): CimaTime {
    return withTimePrecision(date ? { hours: this.adapter.getHours(date), minutes: this.adapter.getMinutes(date), seconds: this.adapter.getSeconds(date) }
      : { hours: hour, minutes: 0, seconds: 0 }, this.precision);
  }

  /** Copies valid endpoints while retaining invalid dates for Forms validation. */
  private copy(value: CimaDatetimeRange | null): CimaDatetimeRange | null {
    return value == null ? null : { start: this.copyDate(value.start), end: this.copyDate(value.end) };
  }

  /** Retains malformed endpoints as invalid dates so Forms can report them without throwing. */
  private copyDate(date: unknown): Date | null {
    return date == null ? null : new Date(date instanceof Date ? date.getTime() : NaN);
  }

  /** Ends a session, marks the control touched, and restores its trigger focus. */
  private finish(): void {
    this.isOpen.set(false);
    this.onTouched();
    this.trigger?.nativeElement.focus();
    this.closed.emit();
  }
}
