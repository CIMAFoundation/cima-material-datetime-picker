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
import { CimaDatetimePicker, CimaDatetimePickerInput, CimaDatetimePickerToggle, CimaTimePicker, CimaTime, CimaTimeFilter, CimaTimeView, CimaHourDial, CimaTimepickerIntl, CimaTimePickerInput, CimaTimePickerPopup, CimaTimePickerToggle } from '@cima-foundation/material-datetime-picker';
import { DEMO_CALENDAR_LABELS, DEMO_TIME_LABELS } from './demo-locales';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, DatePipe, JsonPipe, FormsModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatSlideToggleModule, CimaTimePicker, CimaDatetimePicker, CimaDatetimePickerInput, CimaDatetimePickerToggle, CimaTimePickerInput, CimaTimePickerPopup, CimaTimePickerToggle],
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
  readonly hourCycle = signal<'12' | '24'>('12');
  readonly hourDial = signal<CimaHourDial>('single-ring');
  readonly showSeconds = signal(false);
  readonly hourStep = signal(1);
  readonly minuteStep = signal(1);
  readonly secondStep = signal(1);
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
  readonly language = signal<'it' | 'en'>('en');
  readonly timeControl = new FormControl<CimaTime | null>(null, Validators.required);
  readonly popupShowActions = signal(false);
  readonly popupControl = new FormControl<CimaTime | null>(null);
  @ViewChild(CimaTimePickerPopup) popup!: CimaTimePickerPopup;
  readonly popupCode = computed(() => `<mat-form-field>
  <mat-label>Time</mat-label>
  <input matInput [cimaTimePicker]="timePopup" [formControl]="popupControl"${this.timeConstraintAttributes()}>
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
  <input matInput [cimaDatetimePicker]="picker" [formControl]="appointment"${dateLimits}${this.timeConstraintAttributes()}${datetimeLimits}>
  <cima-datetime-picker-toggle matIconSuffix [for]="picker" />
  <cima-datetime-picker #picker${this.pickerAttributes(true)} />
</mat-form-field>`;
  });

  /** Shows only display options that differ from the associated library component's defaults. */
  private pickerAttributes(datetime: boolean): string {
    const view = datetime ? this.datetimeView() : this.popupTimeView();
    const defaultView = datetime ? 'input' : 'clock';
    const attributes = [
      this.hourCycle() !== '24' ? `hourCycle="${this.hourCycle()}"` : '',
      this.hourDial() !== 'single-ring' ? `hourDial="${this.hourDial()}"` : '',
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
    this.setLanguage('en');
    effect((onCleanup) => {
      const container = overlay.getContainerElement();
      container.classList.toggle('m2', this.theme() === 'm2');
      container.classList.toggle('dark', this.darkMode());
      onCleanup(() => container.classList.remove('m2', 'dark'));
    });
  }

  /** Updates labels and Material's locale without changing any selected value or hour cycle. */
  setLanguage(language: 'it' | 'en'): void {
    this.language.set(language);
    this.adapter.setLocale(language === 'it' ? 'it-IT' : 'en-US');
    Object.assign(this.timeIntl, DEMO_TIME_LABELS[language], {
      cancel: language === 'it' ? 'Annulla' : 'Cancel', confirm: 'OK',
    });
    this.timeIntl.changes.next();
    Object.assign(this.dateIntl, DEMO_CALENDAR_LABELS[language]);
    this.dateIntl.changes.next();
  }

  /** Demonstrates setting and clearing Angular Forms' disabled state. */
  toggleFormDisabled(): void {
    if (this.timeControl.disabled) this.timeControl.enable();
    else this.timeControl.disable();
  }

  /** Formats time-only values without introducing a date or timezone. */
  formatTime(time: CimaTime | null): string {
    if (!time) return '';
    const hour = this.hourCycle() === '12' ? time.hours % 12 || 12 : time.hours;
    const parts = [hour, time.minutes];
    if (this.showSeconds()) parts.push(time.seconds);
    const period = this.hourCycle() === '12' ? ` ${time.hours >= 12 ? this.timeIntl.pm : this.timeIntl.am}` : '';
    return parts.map(value => String(value).padStart(2, '0')).join(':') + period;
  }

  /** Demonstrates a complete Date value supplied programmatically by an application. */
  setAppointmentExample(): void { this.appointment.setValue(new Date(2026, 9, 27, 14, 30, 45)); }

  /** Demonstrates the datetime form control's disabled state. */
  toggleAppointmentDisabled(): void {
    if (this.appointment.disabled) this.appointment.enable();
    else this.appointment.disable();
  }
}
