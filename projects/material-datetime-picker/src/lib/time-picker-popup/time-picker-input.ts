import { AfterViewInit, Renderer2, booleanAttribute, DestroyRef, Directive, ElementRef, forwardRef, inject, Input, OnChanges, OnDestroy, OnInit, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatFormField } from '@angular/material/form-field';
import { CimaInputFormats } from '../input/input-formats';
import { validateTime } from '../time-picker/time-constraints';
import { CimaTime, CimaTimeFilter, isValidTime } from '../time-picker/time-value';
import { CimaTimePickerPopup } from './time-picker-popup';

export interface CimaTimeInputEvent {
  source: CimaTimePickerInput;
  targetElement: HTMLInputElement;
  value: CimaTime | null;
}

/** Editable time-only form input associated with an anchored timepicker popup. */
@Directive({
  selector: 'input[cimaTimePicker]',
  exportAs: 'cimaTimePickerInput',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CimaTimePickerInput), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => CimaTimePickerInput), multi: true },
  ],
  host: {
    '[readOnly]': 'readonly', '[disabled]': 'isDisabled', '[attr.aria-haspopup]': '"dialog"',
    '[attr.aria-expanded]': 'picker.isOpen()', '[attr.aria-controls]': 'picker.isOpen() ? picker.id : null',
    '[attr.aria-invalid]': 'hasErrors || null', '(input)': 'onInput()', '(change)': 'onNativeChange()',
    '(blur)': 'onBlur()', '(keydown)': 'onKeydown($event)', '(click)': 'onClick()',
  },
})
export class CimaTimePickerInput implements AfterViewInit, ControlValueAccessor, Validator, OnInit, OnChanges, OnDestroy {
  @Input({ required: true, alias: 'cimaTimePicker' }) picker!: CimaTimePickerPopup;
  @Input({ transform: booleanAttribute }) readonly = false;
  private readonly inputDisabled = signal(false);
  /** Tracks explicit disabling so the popup and toggle update even while closed. */
  @Input({ transform: booleanAttribute })
  get disabled(): boolean { return this.inputDisabled(); }
  set disabled(value: boolean) { this.inputDisabled.set(value); }
  @Input() minTime: CimaTime | null = null;
  @Input() maxTime: CimaTime | null = null;
  @Input() timeFilter: CimaTimeFilter | null = null;
  readonly timeInput = output<CimaTimeInputEvent>();
  readonly timeChange = output<CimaTimeInputEvent>();
  readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly formField = inject(MatFormField, { optional: true });
  private readonly formats = inject(CimaInputFormats);
  private readonly adapter = inject<DateAdapter<Date>>(DateAdapter);
  private readonly destroyRef = inject(DestroyRef);
  private time: CimaTime | null = null;
  private readonly formDisabled = signal(false);
  private parseError = false;
  private rawText: string | null = null;
  private editBase: CimaTime | null = null;
  private onChange: (value: CimaTime | null) => void = () => {};
  private onTouched: () => void = () => {};
  private onValidatorChange: () => void = () => {};

  /** Reformats valid values when Material's locale changes. */
  constructor() {
    this.adapter.localeChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.refresh());
  }

  /** Supplies the locally provided adapter without capturing it in a root-level service. */
  private get formatOptions() {
    return { adapter: this.adapter, hourCycle: this.picker.hourCycle, showSeconds: this.picker.showSeconds && this.picker.precision !== 'hours', precision: this.picker.precision };
  }

  /** Returns a copy of the time-only model. */
  @Input()
  get value(): CimaTime | null { return this.time == null ? null : { ...this.time }; }
  set value(value: CimaTime | null) { this.writeValue(value); }

  /** Reports both explicit and Forms disabled state. */
  get isDisabled(): boolean { return this.disabled || this.formDisabled(); }

  /** Exposes parsing and constraint errors to value-only integrations and ARIA. */
  get errors() { return this.parseError ? { cimaTimePickerParse: { text: this.rawText } } : validateTime(this.time, this); }

  /** Shares the popup precision with the common time validator. */
  get precision() { return this.picker?.precision ?? 'full'; }

  /** Supplies a boolean accessible invalid state. */
  get hasErrors(): boolean { return !!this.errors; }

  /** Uses Material's public form-field origin for popup positioning. */
  get origin(): ElementRef { return this.formField?.getConnectedOverlayOrigin() ?? this.element; }

  /** Registers the associated popup after directive inputs have been assigned. */
  ngOnInit(): void { this.picker.registerInput(this); this.refresh(); }

  /** Opens readonly inputs from the whole Material field, including its empty padding. */
  ngAfterViewInit(): void {
    const origin = this.formField?.getConnectedOverlayOrigin().nativeElement;
    if (origin) this.destroyRef.onDestroy(this.renderer.listen(origin, 'click', () => this.onClick()));
  }

  /** Revalidates changed rules and prevents a stale popup draft from applying. */
  ngOnChanges(): void { this.picker?.close(); this.onValidatorChange(); this.refresh(); }

  /** Removes the association when the input is destroyed. */
  ngOnDestroy(): void { this.picker?.unregisterInput(this); }

  /** Applies external values without user events and cancels stale drafts. */
  writeValue(value: CimaTime | null): void {
    this.picker?.close();
    this.time = value == null ? null : { ...value };
    this.parseError = false;
    this.rawText = null;
    this.editBase = null;
    this.refresh();
  }

  /** Validates the original Forms value, including malformed programmatic values. */
  validate(control: AbstractControl) {
    return this.parseError ? { cimaTimePickerParse: { text: this.rawText } } : validateTime(control.value, this);
  }

  /** Registers the Angular Forms value callback. */
  registerOnChange(callback: (value: CimaTime | null) => void): void { this.onChange = callback; }

  /** Registers the Angular Forms touched callback. */
  registerOnTouched(callback: () => void): void { this.onTouched = callback; }

  /** Registers revalidation for changed configuration or parsing state. */
  registerOnValidatorChange(callback: () => void): void { this.onValidatorChange = callback; }

  /** Cancels a pending session when Forms disables the input. */
  setDisabledState(disabled: boolean): void { this.formDisabled.set(disabled); this.refresh(); }

  /** Preserves unfinished text while refreshing formatted values and disabled state. */
  refresh(): void {
    this.element.nativeElement.value = this.rawText ?? (isValidTime(this.time) && this.picker ? this.formats.formatTime(this.time, this.formatOptions) : '');
    this.onValidatorChange();
    this.element.nativeElement.disabled = this.isDisabled;
    if (this.isDisabled) this.picker?.close();
  }

  /** Parses typing without rewriting the user's unfinished or invalid text. */
  onInput(): void {
    if (this.isDisabled || this.readonly) return;
    this.picker.close();
    if (this.rawText == null) this.editBase = this.value;
    this.rawText = this.element.nativeElement.value;
    const text = this.rawText.trim();
    if (!text) this.editBase = null;
    this.time = text ? this.formats.parseTime(text, this.formatOptions, this.editBase) : null;
    this.parseError = !!text && !this.time;
    this.onChange(this.value);
    this.onValidatorChange();
    this.timeInput.emit(this.event());
  }

  /** Emits the committed native edit separately from typing events. */
  onNativeChange(): void { if (!this.isDisabled && !this.readonly) this.timeChange.emit(this.event()); }

  /** Formats complete text on blur while leaving errors available for correction. */
  onBlur(): void {
    if (!this.parseError) { this.rawText = null; this.editBase = null; this.refresh(); }
    this.markTouched();
  }

  /** Commits a popup selection once, resetting any previous parsing error. */
  commit(value: CimaTime): void {
    this.time = { ...value };
    this.parseError = false;
    this.rawText = null;
    this.editBase = null;
    this.refresh();
    this.onChange(this.value);
    this.onValidatorChange();
    this.timeInput.emit(this.event());
    this.timeChange.emit(this.event());
  }

  /** Marks the field touched after blur or a completed popup session. */
  markTouched(): void { this.onTouched(); }

  /** Keeps pointer opening for read-only integrations while editable inputs support caret placement. */
  onClick(): void { if (this.readonly) this.picker.open(); }

  /** Opens with Alt+ArrowDown, or Enter/ArrowDown when the field is read-only. */
  onKeydown(event: KeyboardEvent): void {
    if ((event.altKey && event.key === 'ArrowDown') || (this.readonly && ['Enter', 'ArrowDown'].includes(event.key))) {
      event.preventDefault(); this.picker.open();
    }
  }

  /** Creates an independent event payload for each subscriber-facing output. */
  private event(): CimaTimeInputEvent { return { source: this, targetElement: this.element.nativeElement, value: this.value }; }
}
