import { validateTime } from './time-constraints';
import { CimaTime } from './time-value';

/** Creates a complete time for readable boundary examples. */
function time(hours: number, minutes = 0, seconds = 0): CimaTime { return { hours, minutes, seconds }; }

describe('Daily time constraints', () => {
  it('includes daytime bounds and compares hidden seconds', () => {
    const limits = { minTime: time(9, 30, 15), maxTime: time(18, 0, 30) };
    expect(validateTime(time(9, 30, 15), limits)).toBeNull();
    expect(validateTime(time(18, 0, 30), limits)).toBeNull();
    expect(validateTime(time(9, 30, 14), limits)).toEqual({ timeMin: true });
    expect(validateTime(time(18, 0, 31), limits)).toEqual({ timeMax: true });
  });

  it('supports overnight windows including midnight and both boundaries', () => {
    const limits = { minTime: time(22), maxTime: time(6) };
    for (const value of [time(22), time(23, 59, 59), time(0), time(6)]) {
      expect(validateTime(value, limits)).toBeNull();
    }
    expect(validateTime(time(6, 0, 1), limits)).toEqual({ timeRange: true });
    expect(validateTime(time(21, 59, 59), limits)).toEqual({ timeRange: true });
  });

  it('treats equal bounds as one allowed time rather than a full day', () => {
    const limits = { minTime: time(9), maxTime: time(9) };
    expect(validateTime(time(9), limits)).toBeNull();
    expect(validateTime(time(9, 0, 1), limits)).toEqual({ timeMax: true });
  });

  it('handles open-ended limits and optional values', () => {
    expect(validateTime(time(8), { minTime: time(9) })).toEqual({ timeMin: true });
    expect(validateTime(time(20), { maxTime: time(18) })).toEqual({ timeMax: true });
    expect(validateTime(null, { minTime: time(9) })).toBeNull();
  });

  it('reports malformed bounds even on empty controls', () => {
    expect(validateTime(null, { minTime: time(24) })).toEqual({ invalidTimeConstraints: true });
    expect(validateTime(time(9), { maxTime: time(9, 0, 60) })).toEqual({ invalidTimeConstraints: true });
  });

  it('combines a recurring filter with bounds and protects the original value', () => {
    const value = time(9);
    const limits = { minTime: time(8), timeFilter: (candidate: CimaTime) => {
      candidate.hours = 0;
      return false;
    } };
    expect(validateTime(value, limits)).toEqual({ timeFilter: true });
    expect(value).toEqual(time(9));
  });
});
