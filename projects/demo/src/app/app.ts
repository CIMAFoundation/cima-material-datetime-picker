import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DatePipe, JsonPipe } from '@angular/common';
import { Component, computed, effect, inject, signal, ViewChild } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { OverlayContainer } from '@angular/cdk/overlay';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import { DateFilterFn, MatDatepickerIntl } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CimaTimePrecision, CimaInputFormats, getCimaPickerTranslation, CimaDatetimeRangePicker, CimaDatetimeRange, CimaDatetimeRangeLayout, CimaDatetimePicker, CimaDatetimePickerInput, CimaDatetimePickerToggle, CimaTimePicker, CimaTime, CimaTimeFilter, CimaTimeView, CimaHourDial, CimaTimepickerIntl, CimaTimePickerInput, CimaTimePickerPopup, CimaTimePickerToggle } from '@cima-foundation/material-datetime-picker';
import { DEMO_LOCALES } from './demo-locales';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, DatePipe, JsonPipe, FormsModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatSlideToggleModule, CimaDatetimeRangePicker, CimaTimePicker, CimaDatetimePicker, CimaDatetimePickerInput, CimaDatetimePickerToggle, CimaTimePickerInput, CimaTimePickerPopup, CimaTimePickerToggle],
  providers: [provideNativeDateAdapter()],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly compactLayout = toSignal(inject(BreakpointObserver).observe('(max-width: 760px)'));
  readonly darkMode = signal(false);
  readonly theme = signal<'m2' | 'm3'>('m3');
  readonly datetimeView = signal<CimaTimeView>('input');
  readonly popupTimeView = signal<CimaTimeView>('clock');
  readonly allowViewSwitch = signal(true);
  readonly readonlyInputs = signal(false);
  readonly hourCycle = signal<'12' | '24'>('12');
  readonly hourDial = signal<CimaHourDial>('dual-ring');
  readonly precision = signal<CimaTimePrecision>('full');
  readonly showSeconds = signal(false);
  readonly hourStep = signal(1);
  readonly minuteStep = signal(1);
  readonly secondStep = signal(1);
  readonly rangeTimeView = signal<CimaTimeView>('input');
  readonly rangeLayout = signal<CimaDatetimeRangeLayout>('auto');
  readonly range = new FormControl<CimaDatetimeRange | null>(null);
  readonly rangeCode = computed(() => `<cima-datetime-range-picker [formControl]="range"
  layout="${this.rangeLayout()}" precision="${this.precision()}" timeView="${this.rangeTimeView()}"
  hourCycle="${this.hourCycle()}" hourDial="${this.hourDial()}"
  [showSeconds]="${this.showSeconds()}" [allowViewSwitch]="${this.allowViewSwitch()}" />`);
  readonly appointment = new FormControl<Date | null>(null);
  readonly dateLimitsEnabled = signal(false);
  readonly timeRules = signal<'none' | 'business' | 'night'>('none');
  readonly minimumTime = computed<CimaTime | null>(() => this.timeRules() === 'none' ? null
    : { hours: this.timeRules() === 'night' ? 22 : 9, minutes: 0, seconds: 0 });
  readonly maximumTime = computed<CimaTime | null>(() => this.timeRules() === 'none' ? null
    : { hours: this.timeRules() === 'night' ? 6 : 18, minutes: 0, seconds: 0 });
  readonly availableTimes: CimaTimeFilter = time => time.hours !== 13;
  readonly activeTimeFilter = computed(() => this.timeRules() === 'business' ? this.availableTimes : null);
  readonly datetimeLimitsEnabled = signal(false);
  readonly minimumDateTime = new Date(2026, 9, 27, 16, 0);
  readonly maximumDateTime = new Date(2026, 9, 28, 10, 0);
  readonly minimumDate = new Date(2026, 9, 27);
  readonly maximumDate = new Date(2026, 9, 30);
  readonly availableDates: DateFilterFn<Date> = date => date == null || date.getDate() !== 28;
  readonly standaloneTime = signal<CimaTime | null>({ hours: 7, minutes: 0, seconds: 0 });
  readonly localization = signal('en-US');
  readonly locales = DEMO_LOCALES;
  private readonly inputFormats = inject(CimaInputFormats);
  readonly timeControl = new FormControl<CimaTime | null>(null, Validators.required);
  readonly popupShowActions = signal(false);
  readonly popupControl = new FormControl<CimaTime | null>(null);
  @ViewChild(CimaTimePickerPopup) popup!: CimaTimePickerPopup;
  readonly popupCode = computed(() => `<mat-form-field>
  <mat-label>Time</mat-label>
  <input matInput [cimaTimePicker]="timePopup" [formControl]="popupControl"${this.readonlyInputs() ? ' readonly' : ''}${this.timeConstraintAttributes()}>
  <cima-time-picker-toggle matIconSuffix [for]="timePopup" />
  <cima-time-picker-popup #timePopup${this.pickerAttributes(false)}${this.popupShowActions() ? ' [showActions]="true"' : ''} />
</mat-form-field>`);

  readonly datetimeCode = computed(() => {
    const dateLimits = this.dateLimitsEnabled()
      ? ' [min]="minimumDate" [max]="maximumDate" [cimaDatetimePickerFilter]="availableDates"' : '';
    const datetimeLimits = this.datetimeLimitsEnabled()
      ? ' [minDateTime]="minimumDateTime" [maxDateTime]="maximumDateTime"' : '';
    return `<mat-form-field>
  <mat-label>Date and time</mat-label>
  <input matInput [cimaDatetimePicker]="picker" [formControl]="appointment"${this.readonlyInputs() ? ' readonly' : ''}${dateLimits}${this.timeConstraintAttributes()}${datetimeLimits}>
  <cima-datetime-picker-toggle matIconSuffix [for]="picker" />
  <cima-datetime-picker #picker${this.pickerAttributes(true)} />
</mat-form-field>`;
  });

  /** Shows only display options that differ from the associated library component's defaults. */
  private pickerAttributes(datetime: boolean): string {
    const view = datetime ? this.datetimeView() : this.popupTimeView();
    const defaultView = datetime ? 'input' : 'clock';
    const attributes = [
      this.precision() !== 'full' ? `precision="${this.precision()}"` : '',
      this.hourCycle() !== '24' ? `hourCycle="${this.hourCycle()}"` : '',
      this.hourDial() !== 'dual-ring' ? `hourDial="${this.hourDial()}"` : '',
      view !== defaultView ? `timeView="${view}"` : '',
      this.showSeconds() ? '[showSeconds]="true"' : '',
      !this.allowViewSwitch() ? '[allowViewSwitch]="false"' : '',
      this.hourStep() !== 1 ? `[hourStep]="${this.hourStep()}"` : '',
      this.minuteStep() !== 1 ? `[minuteStep]="${this.minuteStep()}"` : '',
      this.secondStep() !== 1 ? `[secondStep]="${this.secondStep()}"` : '',
    ].filter(Boolean);
    return attributes.length ? ` ${attributes.join(' ')}` : '';
  }

  /** Includes daily bounds and filtering only when the example actually uses them. */
  private timeConstraintAttributes(): string {
    if (this.timeRules() === 'none') return '';
    return ' [minTime]="minimumTime()" [maxTime]="maximumTime()"'
      + (this.activeTimeFilter() ? ' [timeFilter]="activeTimeFilter()"' : '');
  }

  /** Applies the demo theme to CDK overlays as well as inline content. */
  constructor(private readonly adapter: DateAdapter<Date>, overlay: OverlayContainer,
    readonly timeIntl: CimaTimepickerIntl, private readonly dateIntl: MatDatepickerIntl) {
    this.setLocalization('en-US');
    effect((onCleanup) => {
      const container = overlay.getContainerElement();
      container.classList.toggle('m2', this.theme() === 'm2');
      container.classList.toggle('dark', this.darkMode());
      onCleanup(() => container.classList.remove('m2', 'dark'));
    });
  }

  /** Coordinates picker translations and locale formats without changing the English demo interface. */
  setLocalization(locale: string): void {
    this.localization.set(locale);
    this.adapter.setLocale(locale);
    this.timeIntl.setLocale(locale);
    Object.assign(this.dateIntl, getCimaPickerTranslation(locale).calendar);
    this.dateIntl.changes.next();
  }

  /** Formats the manual-entry hint using the same locale and precision as the actual input. */
  get datetimeExample(): string {
    return this.inputFormats.formatDatetime(new Date(2026, 9, 27, 14, this.precision() === 'hours' ? 0 : 30), {
      adapter: this.adapter, hourCycle: this.hourCycle(), showSeconds: this.showSeconds() && this.precision() !== 'hours', precision: this.precision(),
    });
  }

  /** Demonstrates setting and clearing Angular Forms' disabled state. */
  toggleFormDisabled(): void {
    if (this.timeControl.disabled) this.timeControl.enable();
    else this.timeControl.disable();
  }

  /** Formats time-only values without introducing a date or timezone. */
  formatTime(time: CimaTime | null): string {
    if (!time) return '';
    return this.inputFormats.formatTime(time, {
      adapter: this.adapter, hourCycle: this.hourCycle(), showSeconds: this.showSeconds() && this.precision() !== 'hours', precision: this.precision(),
    });
  }

  /** Demonstrates a complete Date value supplied programmatically by an application. */
  setAppointmentExample(): void { this.appointment.setValue(new Date(2026, 9, 27, 14, this.precision() === 'hours' ? 0 : 30, this.precision() === 'hours' ? 0 : 45)); }

  /** Demonstrates the datetime form control's disabled state. */
  toggleAppointmentDisabled(): void {
    if (this.appointment.disabled) this.appointment.enable();
    else this.appointment.disable();
  }
}
