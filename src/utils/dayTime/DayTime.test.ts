import { DayTime, DayTimeName } from './DayTime';

describe(DayTime, () => {
  it('should return date time period', () => {
    expect(DayTime.getName(new Date('2022-01-20 9:59:59'))).toEqual(DayTimeName.Morning);
    expect(DayTime.getName(new Date('2022-01-20 10:00:00'))).toEqual(DayTimeName.Day);
    expect(DayTime.getName(new Date('2022-01-20 17:00:00'))).toEqual(DayTimeName.Evening);
    expect(DayTime.getName(new Date('2022-01-20 22:00:00'))).toEqual(DayTimeName.Night);
    expect(DayTime.getName(new Date('2022-01-20 02:00:00'))).toEqual(DayTimeName.Night);
    expect(DayTime.getName(new Date('2022-01-20 4:59:59'))).toEqual(DayTimeName.Night);
  });

  it('should return date time to next period start', () => {
    expect(DayTime.getTimeUntilNextPeriodStart(new Date('2022-01-20 9:59:59'))).toEqual(1000);
    expect(DayTime.getTimeUntilNextPeriodStart(new Date('2022-01-20 17:00:00'))).toEqual(3 * 60 * 60 * 1000);
    expect(DayTime.getTimeUntilNextPeriodStart(new Date('2022-01-20 23:59:59'))).toEqual(5 * 60 * 60 * 1000 + 1000);
  });
});
