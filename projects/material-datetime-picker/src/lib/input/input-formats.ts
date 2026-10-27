import { Injectable } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { CimaTime, isValidTime } from '../time-picker/time-value';

export interface CimaInputFormatOptions {
  adapter: DateAdapter<Date>;
  hourCycle: '12' | '24';
  showSeconds: boolean;
}

/** Replace this service to customize parsing and display without replacing the app's date adapter. */
@Injectable({ providedIn: 'root' })
export class CimaInputFormats {

  /** Formats a numeric Gregorian date using the current Material locale. */
  formatDate(value: Date, options: CimaInputFormatOptions): string {
    const format = { year: 'numeric', month: '2-digit', day: '2-digit', numberingSystem: 'latn', calendar: 'gregory' };
    const text = options.adapter.format(value, format);
    if (value.getFullYear() >= 1000) return text;
    const sample = options.adapter.format(new Date(2006, 10, 22), format);
    const fields: string[] = sample.match(/\d+/g) ?? [];
    const yearIndex = fields.indexOf('2006');
    let index = 0;
    return text.replace(/\d+/g, part => index++ === yearIndex ? part.padStart(4, '0') : part);
  }

  /** Formats time-only values with explicit precision and the locale's day periods. */
  formatTime(value: CimaTime, options: CimaInputFormatOptions): string {
    const hour = options.hourCycle === '12' ? value.hours % 12 || 12 : value.hours;
    const parts = [hour, value.minutes];
    if (options.showSeconds) parts.push(value.seconds);
    return parts.map(part => String(part).padStart(2, '0')).join(':')
      + (options.hourCycle === '12' ? ` ${this.period(value.hours >= 12, options)}` : '');
  }

  /** Uses the same date/time formats for display and parsing. */
  formatDatetime(value: Date, options: CimaInputFormatOptions): string {
    return `${this.formatDate(value, options)} ${this.formatTime({ hours: value.getHours(), minutes: value.getMinutes(), seconds: value.getSeconds() }, options)}`;
  }

  /** Parses complete times strictly; hidden seconds survive edits of an existing value. */
  parseTime(text: string, options: CimaInputFormatOptions, previous: CimaTime | null = null): CimaTime | null {
    const match = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?(?:\s+(.+))?$/.exec(text.trim());
    if (!match || (options.showSeconds ? match[3] == null : match[3] != null)) return null;
    let hours = Number(match[1]);
    if (options.hourCycle === '12') {
      const period = match[4]?.toLocaleLowerCase();
      const am = this.period(false, options).toLocaleLowerCase();
      const pm = this.period(true, options).toLocaleLowerCase();
      if (hours < 1 || hours > 12 || (period !== am && period !== pm)) return null;
      hours = hours % 12 + (period === pm ? 12 : 0);
    } else if (match[4]) return null;
    const value = { hours, minutes: Number(match[2]), seconds: options.showSeconds ? Number(match[3]) : previous?.seconds ?? 0 };
    return isValidTime(value) ? value : null;
  }

  /** Parses the locale's numeric date order and rejects overflow and nonexistent local times. */
  parseDatetime(text: string, options: CimaInputFormatOptions, previous: Date | null = null): Date | null {
    const sample = this.formatDate(new Date(2006, 10, 22), options);
    const fields = sample.match(/\d+/g) ?? [];
    const pattern = sample.split(/(\d+)/).map(part => /^\d+$/.test(part)
      ? (part === '2006' ? '(\\d{4})' : '(\\d{1,2})') : this.escape(part).replace(/\s+/g, '\\s*')).join('');
    const match = new RegExp(`^${pattern}\\s+(.+)$`).exec(text.trim());
    if (!match || fields.length !== 3) return null;
    const year = Number(match[fields.indexOf('2006') + 1]);
    const month = Number(match[fields.indexOf('11') + 1]) - 1;
    const day = Number(match[fields.indexOf('22') + 1]);
    const time = this.parseTime(match[4], options, previous ? { hours: previous.getHours(), minutes: previous.getMinutes(), seconds: previous.getSeconds() } : null);
    if (!time || year < 1 || month < 0 || month > 11 || day < 1 || day > 31) return null;
    const value = new Date(0);
    value.setFullYear(year, month, day);
    value.setHours(time.hours, time.minutes, time.seconds, 0);
    return value.getFullYear() === year && value.getMonth() === month && value.getDate() === day
      && value.getHours() === time.hours && value.getMinutes() === time.minutes && value.getSeconds() === time.seconds ? value : null;
  }

  /** Reads localized day periods from the adapter without accessing its protected locale. */
  private period(pm: boolean, options: CimaInputFormatOptions): string {
    const date = new Date(2006, 10, 22, pm ? 13 : 1);
    const format = { hour: 'numeric', numberingSystem: 'latn' };
    const hourOnly = options.adapter.format(date, { ...format, hour12: false }).replace(/[\d\u200e\u200f]/g, '').trim();
    return options.adapter.format(date, { ...format, hour12: true }).replace(/[\d\u200e\u200f]/g, '')
      .replace(hourOnly, '').trim();
  }

  /** Escapes locale separators before constructing a strict date pattern. */
  private escape(text: string): string { return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
}
