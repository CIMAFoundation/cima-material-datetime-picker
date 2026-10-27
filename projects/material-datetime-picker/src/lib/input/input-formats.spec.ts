import { TestBed } from '@angular/core/testing';
import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import { CimaInputFormats, CimaInputFormatOptions } from './input-formats';

describe('Localized input formats', () => {
  let formats: CimaInputFormats;
  let options: CimaInputFormatOptions;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideNativeDateAdapter()] });
    formats = TestBed.inject(CimaInputFormats);
    options = { adapter: TestBed.inject(DateAdapter<Date>), hourCycle: '24', showSeconds: false };
  });

  it.each([
    ['en-US', '10/27/2026 14:30'], ['it-IT', '27/10/2026 14:30'],
    ['en-GB', '27/10/2026 14:30'], ['de-DE', '27.10.2026 14:30'],
    ['ja-JP', '2026/10/27 14:30'],
  ])('round-trips numeric dates in %s without swapping day and month', (locale, text) => {
    options.adapter.setLocale(locale);
    const value = new Date(2026, 9, 27, 14, 30);
    expect(formats.formatDatetime(value, options)).toBe(text);
    expect(formats.parseDatetime(text, options)?.getTime()).toBe(value.getTime());
  });

  it('uses the active locale for ambiguous dates and does not guess other orders', () => {
    options.adapter.setLocale('en-US');
    expect(formats.parseDatetime('01/02/2026 09:00', options)?.getMonth()).toBe(0);
    expect(formats.parseDatetime('27/10/2026 09:00', options)).toBeNull();
    options.adapter.setLocale('it-IT');
    expect(formats.parseDatetime('01/02/2026 09:00', options)?.getMonth()).toBe(1);
  });

  it.each(['02/29/2026 12:00', '04/31/2026 12:00', '00/01/2026 12:00', '10/27/26 12:00', '10/27/2026', '10/27/2026 24:00', '10/27/2026 12:60'])('rejects impossible or incomplete dates: %s', text => {
    options.adapter.setLocale('en-US');
    expect(formats.parseDatetime(text, options)).toBeNull();
  });

  it('accepts leap days and four-digit years below 100 without Date constructor rollover', () => {
    options.adapter.setLocale('en-US');
    expect(formats.parseDatetime('02/29/2024 12:00', options)?.getDate()).toBe(29);
    const ancient = formats.parseDatetime('01/02/0099 12:00', options)!;
    expect(ancient.getFullYear()).toBe(99);
    expect(formats.formatDatetime(ancient, options)).toBe('01/02/0099 12:00');
  });

  it('requires a day period in 12-hour mode and handles noon and midnight', () => {
    options.adapter.setLocale('en-US'); options.hourCycle = '12';
    expect(formats.parseTime('12:30 am', options)?.hours).toBe(0);
    expect(formats.parseTime('12:30 PM', options)?.hours).toBe(12);
    expect(formats.parseTime('01:30 PM', options)?.hours).toBe(13);
    for (const text of ['01:30', '00:30 AM', '13:30 PM', '01:30 XX']) expect(formats.parseTime(text, options)).toBeNull();
    options.hourCycle = '24';
    expect(formats.parseTime('13:30 PM', options)).toBeNull();
  });

  it.each(['es-MX', 'ja-JP'])('round-trips localized 12-hour periods in %s', locale => {
    options.adapter.setLocale(locale); options.hourCycle = '12';
    for (const hours of [0, 12, 23]) {
      const value = { hours, minutes: 30, seconds: 0 };
      expect(formats.parseTime(formats.formatTime(value, options), options)).toEqual(value);
    }
  });

  it('preserves hidden seconds without mutating the previous value and requires visible seconds', () => {
    const previous = { hours: 1, minutes: 2, seconds: 45 };
    expect(formats.parseTime('14:30', options, previous)?.seconds).toBe(45);
    expect(formats.parseTime('14:30', options)?.seconds).toBe(0);
    expect(formats.parseTime('14:30:45', options)).toBeNull();
    options.showSeconds = true;
    expect(formats.parseTime('14:30', options)).toBeNull();
    expect(formats.parseTime('14:30:59', options)?.seconds).toBe(59);
    expect(formats.parseTime('14:30:60', options)).toBeNull();
    expect(previous).toEqual({ hours: 1, minutes: 2, seconds: 45 });
  });

  it.runIf(Intl.DateTimeFormat().resolvedOptions().timeZone === 'Europe/Rome')('rejects nonexistent local times at the spring DST transition', () => {
    options.adapter.setLocale('it-IT');
    expect(formats.parseDatetime('29/03/2026 02:30', options)).toBeNull();
    expect(formats.parseDatetime('29/03/2026 03:30', options)?.getHours()).toBe(3);
    expect(formats.parseDatetime('25/10/2026 02:30', options)?.getHours()).toBe(2);
  });

  it('resets milliseconds on manual datetime edits while preserving hidden seconds', () => {
    options.adapter.setLocale('en-US');
    const previous = new Date(2026, 9, 27, 14, 30, 45, 123);
    const parsed = formats.parseDatetime('10/28/2026 15:00', options, previous)!;
    expect(parsed.getSeconds()).toBe(45);
    expect(parsed.getMilliseconds()).toBe(0);
    expect(previous.getMilliseconds()).toBe(123);
  });
});
