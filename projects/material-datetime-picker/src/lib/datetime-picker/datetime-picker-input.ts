import { booleanAttribute, DestroyRef, Directive, ElementRef, forwardRef, inject, Input, OnDestroy, OnInit, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import { DateAdapter, ThemePalette } from '@angular/material/core';
import { DateFilterFn, MatDatepickerControl } from '@angular/material/datepicker';
import { MatFormField } from '@angular/material/form-field';
import { Subject } from 'rxjs';
import { CimaTime, CimaTimeFilter } from '../time-picker/time-value';
import { validateTime } from '../time-picker/time-constraints';
import { CimaDatetimePicker } from './datetime-picker';
import { CimaInputFormats } from '../input/input-formats';

export interface CimaDatetimeInputEvent {
  source: CimaDatetimePickerInput;
  targetElement: HTMLInputElement;
  value: Date | null;
}

/** Editable full-datetime input and CVA for the native-Date first implementation. */
@Directive({
  selector: 'input[cimaDatetimePicker]',
  exportAs: 'cimaDatetimePickerInput',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CimaDatetimePickerInput), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => CimaDatetimePickerInput), multi: true },
  ],
  host: {
    '[readOnly]': 'readonly', '[disabled]': 'disabled', '[attr.aria-haspopup]': '"dialog"',
    '[attr.aria-expanded]': 'picker.isOpen()', '[attr.aria-invalid]': 'errors ? true : null',
    '(blur)': 'onBlur()', '(keydown)': 'onKeydown($event)', '(input)': 'onInput()', '(change)': 'onNativeChange()',
  },
})
export class CimaDatetimePickerInput implements ControlValueAccessor, Validator, MatDatepickerControl<Date>, OnInit, OnDestroy {
  @Input({ required: true, alias: 'cimaDatetimePicker' }) picker!: CimaDatetimePicker;
  readonly dateInput = output<CimaDatetimeInputEvent>();
  readonly dateChange = output<CimaDatetimeInputEvent>();
  readonly stateChanges = new Subject<void>();
  readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly adapter = inject<DateAdapter<Date>>(DateAdapter);
  private readonly formField = inject(MatFormField, { optional: true });
  private readonly destroyRef = inject(DestroyRef);
  private readonly formats = inject(CimaInputFormats);
  @Input({ transform: booleanAttribute }) readonly = false;
  private parseError = false;
  private rawText: string | null = null;
  private editBase: Date | null = null;
  private date: Date | null = null;
  private inputDisabled = false;
  private formDisabled = false;
  invalid = false;
  private minimum: Date | null = null;
  private maximum: Date | null = null;
  private invalidMinimum = false;
  private invalidMaximum = false;
  private filter: DateFilterFn<Date> | null = null;
  private minimumTime: CimaTime | null = null;
  private maximumTime: CimaTime | null = null;
  private dailyFilter: CimaTimeFilter | null = null;
  private minimumDateTime: Date | null = null;
  private maximumDateTime: Date | null = null;
  private invalidMinimumDateTime = false;
  private invalidMaximumDateTime = false;
  private onValidatorChange: () => void = () => {};
  private onChange: (value: Date | null) => void = () => {};
  private onTouched: () => void = () => {};

  /** Keeps the input's formatted value in sync with Material locale changes. */
  constructor() {
    this.adapter.localeChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.refresh());
  }

  /** Supplies the locally provided adapter without capturing it in a root-level service. */
  private get formatOptions() {
    return { adapter: this.adapter, hourCycle: this.picker.hourCycle, showSeconds: this.picker.showSeconds };
  }

  /** Exposes a copy so callers cannot mutate the selected date in place. */
  @Input()
  get value(): Date | null { return this.date ? this.adapter.clone(this.date) : null; }
  set value(value: Date | null) { this.writeValue(value); }

  /** Combines explicit input disabling with Angular Forms' disabled state. */
  @Input({ transform: booleanAttribute })
  get disabled(): boolean { return this.inputDisabled || this.formDisabled; }
  set disabled(value: boolean) { this.inputDisabled = value; this.refresh(); }

  /** Sets an inclusive date-only lower limit without changing the selected value. */
  @Input()
  get min(): Date | null {
    if (!this.minimum) return this.minimumDateTime;
    if (!this.minimumDateTime) return this.minimum;
    return this.adapter.compareDate(this.minimum, this.minimumDateTime) >= 0 ? this.minimum : this.minimumDateTime;
  }
  set min(value: Date | null) {
    this.invalidMinimum = value != null && !this.validDate(value);
    this.minimum = this.validDate(value) ? this.adapter.clone(value) : null;
    this.constraintsChanged();
  }

  /** Sets an inclusive date-only upper limit; its time portion is ignored. */
  @Input()
  get max(): Date | null {
    if (!this.maximum) return this.maximumDateTime;
    if (!this.maximumDateTime) return this.maximum;
    return this.adapter.compareDate(this.maximum, this.maximumDateTime) <= 0 ? this.maximum : this.maximumDateTime;
  }
  set max(value: Date | null) {
    this.invalidMaximum = value != null && !this.validDate(value);
    this.maximum = this.validDate(value) ? this.adapter.clone(value) : null;
    this.constraintsChanged();
  }

  /** Forwards the same date exclusion predicate to the calendar and form validation. */
  @Input('cimaDatetimePickerFilter')
  get dateFilter(): DateFilterFn<Date> | null { return this.filter; }
  set dateFilter(value: DateFilterFn<Date> | null) {
    this.filter = value;
    this.constraintsChanged();
  }

  /** Sets the recurring lower time limit; a greater min than max denotes an overnight window. */
  @Input()
  get minTime(): CimaTime | null { return this.minimumTime; }
  set minTime(value: CimaTime | null) { this.minimumTime = value == null ? null : { ...value }; this.constraintsChanged(); }

  /** Sets the inclusive recurring upper time limit. */
  @Input()
  get maxTime(): CimaTime | null { return this.maximumTime; }
  set maxTime(value: CimaTime | null) { this.maximumTime = value == null ? null : { ...value }; this.constraintsChanged(); }

  /** Applies the same time-of-day predicate on every date. */
  @Input()
  get timeFilter(): CimaTimeFilter | null { return this.dailyFilter; }
  set timeFilter(value: CimaTimeFilter | null) { this.dailyFilter = value; this.constraintsChanged(); }

  /** Sets an inclusive instant bound without replacing date-only min semantics. */
  @Input()
  get minDateTime(): Date | null { return this.minimumDateTime; }
  set minDateTime(value: Date | null) {
    this.invalidMinimumDateTime = value != null && !this.validDate(value);
    this.minimumDateTime = this.validDate(value) ? this.adapter.clone(value) : null;
    this.constraintsChanged();
  }

  /** Sets an inclusive instant upper bound; reversed datetime bounds are configuration errors. */
  @Input()
  get maxDateTime(): Date | null { return this.maximumDateTime; }
  set maxDateTime(value: Date | null) {
    this.invalidMaximumDateTime = value != null && !this.validDate(value);
    this.maximumDateTime = this.validDate(value) ? this.adapter.clone(value) : null;
    this.constraintsChanged();
  }

  /** Registers the directive with its associated picker. */
  ngOnInit(): void { this.picker.registerInput(this); this.refresh(); }

  /** Cancels an open session and completes the native input-state stream. */
  ngOnDestroy(): void { this.picker?.unregisterInput(this); this.stateChanges.complete(); }

  /** Writes model values without reporting a user edit or changing the source Date. */
  writeValue(value: Date | null): void {
    this.parseError = false;
    this.rawText = null;
    this.editBase = null;
    this.invalid = value != null && !this.validDate(value);
    this.date = this.validDate(value) ? this.adapter.clone(value) : null;
    this.picker?.updateInput();
    this.refresh();
  }

  /** Rejects invalid/non-Date values while leaving the form model available for diagnosis. */
  validate(control: AbstractControl): ValidationErrors | null {
    return this.parseError ? { cimaDatetimePickerParse: { text: this.rawText } } : this.validateValue(control.value);
  }

  /** Exposes parsing and constraint errors for integrations without Angular Forms. */
  get errors(): ValidationErrors | null {
    if (this.parseError) return { cimaDatetimePickerParse: { text: this.rawText } };
    return this.invalid ? { invalidDatetime: true } : this.validateValue(this.date);
  }

  /** Shares validation with the confirmation path so excluded values cannot be applied. */
  validateValue(value: unknown): ValidationErrors | null {
    if (this.invalidMinimum || this.invalidMaximum || this.invalidMinimumDateTime || this.invalidMaximumDateTime
      || (this.min && this.max && this.adapter.compareDate(this.min, this.max) > 0)
      || (this.minimumDateTime && this.maximumDateTime && this.minimumDateTime.getTime() > this.maximumDateTime.getTime())
      || validateTime(null, { minTime: this.minTime, maxTime: this.maxTime, timeFilter: this.timeFilter })) {
      return { invalidDatetimeConstraints: true };
    }
    if (value == null) return null;
    if (!this.validDate(value)) return { invalidDatetime: true };
    const errors: ValidationErrors = {};
    if (this.minimum && this.adapter.compareDate(value, this.minimum) < 0) {
      errors['cimaDatetimePickerMin'] = { min: this.adapter.clone(this.minimum), actual: this.adapter.clone(value) };
    }
    if (this.maximum && this.adapter.compareDate(value, this.maximum) > 0) {
      errors['cimaDatetimePickerMax'] = { max: this.adapter.clone(this.maximum), actual: this.adapter.clone(value) };
    }
    if (this.filter && !this.filter(value)) errors['cimaDatetimePickerFilter'] = true;
    if (this.minimumDateTime && value.getTime() < this.minimumDateTime.getTime()) {
      errors['cimaDatetimePickerMinDateTime'] = { min: this.adapter.clone(this.minimumDateTime), actual: this.adapter.clone(value) };
    }
    if (this.maximumDateTime && value.getTime() > this.maximumDateTime.getTime()) {
      errors['cimaDatetimePickerMaxDateTime'] = { max: this.adapter.clone(this.maximumDateTime), actual: this.adapter.clone(value) };
    }
    const time = { hours: this.adapter.getHours(value), minutes: this.adapter.getMinutes(value), seconds: this.adapter.getSeconds(value) };
    const timeErrors = validateTime(time, { minTime: this.minTime, maxTime: this.maxTime, timeFilter: this.timeFilter });
    if (timeErrors?.['timeMin']) errors['cimaDatetimePickerMinTime'] = true;
    if (timeErrors?.['timeMax']) errors['cimaDatetimePickerMaxTime'] = true;
    if (timeErrors?.['timeRange']) errors['cimaDatetimePickerTimeRange'] = true;
    if (timeErrors?.['timeFilter']) errors['cimaDatetimePickerTimeFilter'] = true;
    return Object.keys(errors).length ? errors : null;
  }

  /** Lets Angular Forms revalidate when bounds or the filter change. */
  registerOnValidatorChange(callback: () => void): void { this.onValidatorChange = callback; }

  /** Registers the form's change callback. */
  registerOnChange(callback: (value: Date | null) => void): void { this.onChange = callback; }

  /** Registers the form's touched callback. */
  registerOnTouched(callback: () => void): void { this.onTouched = callback; }

  /** Applies disabled changes from Angular Forms, cancelling a pending session if needed. */
  setDisabledState(disabled: boolean): void { this.formDisabled = disabled; this.refresh(); }

  /** Formats both date and time using the app's native Material date adapter. */
  refresh(): void {
    this.element.nativeElement.value = this.rawText ?? (this.date ? this.formats.formatDatetime(this.date, this.formatOptions) : '');
    this.element.nativeElement.disabled = this.disabled;
    this.stateChanges.next();
    if (this.disabled) this.picker?.close();
  }

  /** Applies one confirmed user value and emits complete datetime events. */
  commit(value: Date | null): void {
    this.rawText = null;
    this.editBase = null;
    this.parseError = false;
    this.date = value ? this.adapter.clone(value) : null;
    this.invalid = false;
    this.refresh();
    this.onChange(this.value);
    this.onValidatorChange();
    this.dateInput.emit({ source: this, targetElement: this.element.nativeElement, value: this.value });
    this.dateChange.emit({ source: this, targetElement: this.element.nativeElement, value: this.value });
  }

  /** Parses typing without replacing unfinished text or silently correcting invalid values. */
  onInput(): void {
    if (this.disabled || this.readonly) return;
    if (this.rawText == null) this.editBase = this.value;
    this.rawText = this.element.nativeElement.value;
    const text = this.rawText.trim();
    if (!text) this.editBase = null;
    this.date = text ? this.formats.parseDatetime(text, this.formatOptions, this.editBase) : null;
    this.parseError = !!text && !this.date;
    this.invalid = this.parseError;
    this.picker.updateInput();
    this.onChange(this.value);
    this.onValidatorChange();
    this.stateChanges.next();
    this.dateInput.emit({ source: this, targetElement: this.element.nativeElement, value: this.value });
  }

  /** Reports the native committed edit separately from individual keystrokes. */
  onNativeChange(): void {
    if (!this.disabled && !this.readonly) this.dateChange.emit({ source: this, targetElement: this.element.nativeElement, value: this.value });
  }

  /** Normalizes valid text on blur and preserves invalid text for correction. */
  onBlur(): void {
    if (!this.parseError) { this.rawText = null; this.editBase = null; this.refresh(); }
    this.markTouched();
  }

  /** Marks input blur or a completed picker session as touched. */
  markTouched(): void { this.onTouched(); }

  /** Supports Material's Alt+ArrowDown shortcut without intercepting normal form keys. */
  onKeydown(event: KeyboardEvent): void {
    if (event.altKey && event.key === 'ArrowDown' && !this.disabled) {
      event.preventDefault();
      this.picker.open();
    }
  }

  /** Supplies Material's initial calendar value. */
  getStartValue(): Date | null { return this.value; }

  /** Inherits the form-field palette for the native M2 calendar. */
  getThemePalette(): ThemePalette { return this.formField?.color; }

  /** Anchors the original popup to the visible form field rather than an internal element. */
  getConnectedOverlayOrigin(): ElementRef { return this.formField?.getConnectedOverlayOrigin() ?? this.element; }

  /** Connects the dialog's accessible name to the input's Material label. */
  getOverlayLabelId(): string | null { return this.formField?.getLabelId() ?? null; }

  /** Cancels stale drafts and refreshes calendar state and model validation after a rule change. */
  private constraintsChanged(): void {
    this.picker?.close();
    this.onValidatorChange();
    this.refresh();
  }

  /** Restricts the first public datetime value contract to valid native Date objects. */
  private validDate(value: unknown): value is Date {
    return value instanceof Date && this.adapter.isValid(value);
  }
}
