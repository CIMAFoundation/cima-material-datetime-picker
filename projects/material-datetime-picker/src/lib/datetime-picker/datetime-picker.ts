import {
  AfterViewInit, booleanAttribute, ChangeDetectorRef, Component, forwardRef, inject, Input, OnChanges,
  OnDestroy, output, signal, ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DateAdapter, ThemePalette } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepicker, MatDatepickerActions, MatDatepickerApply, MatDatepickerCancel, MatCalendarView, MatCalendarCellClassFunction, MatCalendarHeader } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { ComponentType } from '@angular/cdk/portal';
import { Subject, Subscription } from 'rxjs';
import { DATETIME_CALENDAR_CONTEXT, DatetimeCalendarContext, DatetimeCalendarHeader } from './datetime-calendar-header';
import { CimaTimePicker } from '../time-picker/time-picker';
import { CimaHourDial, CimaTime, CimaTimeView, CimaTimeLabels, isValidTime } from '../time-picker/time-value';
import { validateTime } from '../time-picker/time-constraints';
import { CimaTimepickerIntl } from '../time-picker/timepicker-intl';
import type { CimaDatetimePickerInput } from './datetime-picker-input';

/** Original Material datepicker panel with custom time content and a confirmed Date value. */
@Component({
  selector: 'cima-datetime-picker',
  exportAs: 'cimaDatetimePicker',
  providers: [{ provide: DATETIME_CALENDAR_CONTEXT, useExisting: forwardRef(() => CimaDatetimePicker) }],
  imports: [MatDatepicker, MatDatepickerActions, MatDatepickerApply, MatDatepickerCancel, MatButtonModule, MatDividerModule, CimaTimePicker],
  templateUrl: './datetime-picker.html',
  styleUrl: './datetime-picker.scss',
})
export class CimaDatetimePicker implements AfterViewInit, OnChanges, OnDestroy, DatetimeCalendarContext {
  @ViewChild('calendar', { static: true }) nativeCalendar!: MatDatepicker<Date>;
  @Input() hourStep = 1;
  @Input() minuteStep = 1;
  @Input() secondStep = 1;
  @Input() labels: Partial<CimaTimeLabels> = {};
  @Input({ transform: booleanAttribute }) opened = false;
  @Input() hourCycle: '12' | '24' = '24';
  @Input() hourDial: CimaHourDial = 'single-ring';
  @Input() timeView: CimaTimeView = 'input';
  @Input({ transform: booleanAttribute }) allowViewSwitch = true;
  @Input({ transform: booleanAttribute }) showSeconds = false;
  @Input() startAt: Date | null = null;
  @Input() startView: MatCalendarView = 'month';
  @Input({ transform: booleanAttribute }) touchUi = false;
  @Input() xPosition: 'start' | 'end' = 'start';
  @Input() yPosition: 'above' | 'below' = 'below';
  @Input({ transform: booleanAttribute }) restoreFocus = true;
  @Input() panelClass: string | string[] = [];
  @Input() color: ThemePalette;
  @Input() dateClass: MatCalendarCellClassFunction<Date> = () => '';
  @Input() calendarHeaderComponent!: ComponentType<unknown>;
  @Input({ transform: booleanAttribute }) disabled = false;

  readonly openedEvent = output<void>({ alias: 'opened' });
  readonly closed = output<void>();
  readonly openedChange = output<boolean>();
  readonly confirmed = output<Date | null>();
  readonly cancelled = output<void>();
  readonly yearSelected = output<Date>();
  readonly monthSelected = output<Date>();
  readonly viewChanged = output<MatCalendarView>();
  readonly isOpen = signal(false);
  readonly draftTime = signal<CimaTime | null>(null);
  readonly draftDate = signal<Date | null>(null);
  readonly selectedDay = new Subject<Date>();
  readonly headerBridge = DatetimeCalendarHeader;
  readonly intl = inject(CimaTimepickerIntl);
  private readonly adapter = inject<DateAdapter<Date>>(DateAdapter);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private control: CimaDatetimePickerInput | null = null;
  private model: ReturnType<MatDatepicker<Date>['registerInput']> | null = null;
  private selectionSubscription?: Subscription;
  private applied = false;
  private viewReady = false;

  /** Refreshes translated action labels without providing or replacing the app's adapter. */
  constructor() {
    this.intl.changes.pipe(takeUntilDestroyed()).subscribe(() => this.changeDetector.markForCheck());
  }

  /** Attaches the input after the native datepicker and its action portal are available. */
  ngAfterViewInit(): void { this.viewReady = true; this.attachInput(); if (this.opened) this.open(); }

  /** Reformats the full input when display options change. */
  ngOnChanges(changes: import('@angular/core').SimpleChanges): void {
    if (this.disabled) this.close();
    else if (changes['opened'] && this.viewReady && this.control) {
      if (this.opened) this.open(); else this.close();
    }
    this.control?.refresh();
  }

  /** Releases the native selection subscription. */
  ngOnDestroy(): void { this.selectionSubscription?.unsubscribe(); this.selectedDay.complete(); }

  /** Associates exactly one datetime input with this picker. */
  registerInput(control: CimaDatetimePickerInput): void {
    if ((this.control && this.control !== control) || (!this.control && this.model)) throw new Error('A CimaDatetimePicker can only have one input.');
    this.control = control;
    if (this.nativeCalendar) this.attachInput();
  }

  /** Cancels a session when its input is removed. */
  unregisterInput(control: CimaDatetimePickerInput): void {
    if (this.control !== control) return;
    this.close();
    this.selectionSubscription?.unsubscribe();
    this.control = null;
    if (this.nativeCalendar) this.nativeCalendar.disabled = true;
  }

  /** Synchronizes external values; an open draft is discarded to avoid overwriting new data. */
  updateInput(): void {
    if (this.isOpen()) this.close();
    if (this.control) this.model?.updateSelection(this.control.value, this.control);
    this.changeDetector.markForCheck();
  }

  /** Exposes the connected form state to the native panel and toggle. */
  get inputDisabled(): boolean { return this.control?.disabled ?? true; }

  /** Preserves the original header (or caller replacement) inside the public calendar bridge. */
  get header(): ComponentType<unknown> { return this.calendarHeaderComponent ?? MatCalendarHeader; }

  /** Shares recurring time rules with the embedded time content. */
  get timeConstraints() {
    return { minTime: this.control?.minTime ?? null, maxTime: this.control?.maxTime ?? null,
      timeFilter: this.control?.timeFilter ?? null };
  }

  /** Builds precisely the native Date that confirmation would apply, without mutating a draft. */
  get draftValue(): Date | null {
    const date = this.draftDate();
    const time = this.draftTime();
    return date && isValidTime(time) ? this.adapter.setTime(date, time.hours, time.minutes, time.seconds) : null;
  }

  /** Keeps all day, daily-time and instant rules in a single validation path. */
  get draftErrors() { return this.control?.validateValue(this.draftValue) ?? null; }

  /** Avoids duplicating the embedded timepicker's daily-rule message. */
  get showDraftError(): boolean {
    return !!this.draftDate() && !!this.draftErrors && !validateTime(this.draftTime(), this.timeConstraints);
  }

  /** Requires a selected day and an allowed complete value before OK becomes available. */
  get canConfirm(): boolean { return !!this.draftValue && !this.draftErrors && !this.disabled && !this.inputDisabled; }

  /** Receives only public MatCalendar day-selection events; no native private fields are read. */
  onDateSelected(date: Date | null): void {
    this.draftDate.set(date ? this.adapter.clone(date) : null);
  }

  /** Opens the original Material panel unless the picker or form input is disabled. */
  open(): void {
    if (!this.control || this.disabled || this.control.disabled) return;
    this.nativeCalendar.open();
  }

  /** Changes the pending calendar day while open; OK remains the only commit boundary. */
  select(date: Date): void {
    if (!this.isOpen() || this.disabled || this.inputDisabled || !(date instanceof Date) || !this.adapter.isValid(date)) return;
    this.onDateSelected(date);
    this.selectedDay.next(this.adapter.clone(date));
  }

  /** Closes without applying the current draft. */
  close(): void { this.nativeCalendar?.close(); }

  /** Starts an independent time draft when Material opens, including when opened by its toggle. */
  onOpened(): void {
    const date = this.control?.value;
    this.applied = false;
    this.draftDate.set(date ? this.adapter.clone(date) : null);
    this.draftTime.set(date ? {
      hours: this.adapter.getHours(date), minutes: this.adapter.getMinutes(date), seconds: this.adapter.getSeconds(date),
    } : { hours: 0, minutes: 0, seconds: 0 });
    this.isOpen.set(true);
    this.opened = true;
    this.openedChange.emit(true);
    this.openedEvent.emit();
  }

  /** Marks the form touched after a session and reports cancellation only when nothing applied. */
  onClosed(): void {
    this.isOpen.set(false);
    this.opened = false;
    this.openedChange.emit(false);
    this.draftTime.set(null);
    this.draftDate.set(null);
    this.control?.markTouched();
    if (!this.applied) this.cancelled.emit();
    this.closed.emit();
  }

  /** Uses Material's registration contract and ignores updates originating from our own input. */
  private attachInput(): void {
    if (!this.control || this.model) return;
    const control = this.control;
    this.model = this.nativeCalendar.registerInput(control);
    this.model.updateSelection(control.value, control);
    this.selectionSubscription = this.model.selectionChanged.subscribe(change => {
      if (change.source === control || !this.isOpen() || this.disabled || control.disabled) return;
      const time = this.draftTime();
      if (!isValidTime(time)) return;
      const date = this.draftDate();
      const value = date ? this.adapter.setTime(date, time.hours, time.minutes, time.seconds) : null;
      if (control.validateValue(value)) {
        this.model?.updateSelection(control.value, control);
        return;
      }
      this.applied = true;
      control.commit(value);
      this.model?.updateSelection(value, control);
      this.confirmed.emit(value ? this.adapter.clone(value) : null);
    });
  }
}
