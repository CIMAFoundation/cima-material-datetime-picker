import { NgComponentOutlet } from '@angular/common';
import { ComponentType } from '@angular/cdk/portal';
import { ChangeDetectorRef, Component, inject, InjectionToken } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { MatCalendar } from '@angular/material/datepicker';

export interface DatetimeCalendarContext {
  readonly selectedDay: Observable<Date>;
  readonly header: ComponentType<unknown>;
  onDateSelected(date: Date | null): void;
}

export const DATETIME_CALENDAR_CONTEXT = new InjectionToken<DatetimeCalendarContext>('Cima datetime calendar');

/** Observes public calendar selections while rendering the original or caller-supplied header. */
@Component({
  selector: 'cima-datetime-calendar-header',
  imports: [NgComponentOutlet],
  template: '<ng-container *ngComponentOutlet="context.header" />',
})
export class DatetimeCalendarHeader {
  readonly context = inject(DATETIME_CALENDAR_CONTEXT);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly calendar = inject<MatCalendar<Date>>(MatCalendar);

  /** Tracks the pending day without reading the native datepicker's private content/model. */
  constructor() {
    this.context.selectedDay.pipe(takeUntilDestroyed()).subscribe(date => {
      this.calendar.selected = date;
      this.calendar.activeDate = date;
      this.changeDetector.markForCheck();
    });
    this.calendar.selectedChange.pipe(takeUntilDestroyed()).subscribe(date => {
      this.context.onDateSelected(date);
    });
  }
}
