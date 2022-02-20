export enum DayTimeName {
  Morning = 'morning',
  Day = 'day',
  Evening = 'evening',
  Night = 'night',
}

type DayTimePeriod = {
  // Inclusive
  start: number;
  // Inclusive
  end: number;
};

const periods: Map<DayTimeName, DayTimePeriod> = new Map();

// Map keeps the order of entry insertion
periods.set(DayTimeName.Morning, {
  start: 5,
  end: 9,
});
periods.set(DayTimeName.Day, {
  start: 10,
  end: 15,
});
periods.set(DayTimeName.Evening, {
  start: 16,
  end: 19,
});
periods.set(DayTimeName.Night, {
  start: 20,
  end: 4,
});

export class DayTime {
  private static getDateTimeDescriptor(date: string | number | Date): {
    name: DayTimeName;
    period: DayTimePeriod;
    nextPeriod: DayTimePeriod;
  } {
    const hours = new Date(date)
      // Returns the hours (0 to 23) of a date
      .getHours();

    let period: DayTimePeriod | undefined;
    let name: DayTimeName | undefined;
    let nextPeriod: DayTimePeriod | undefined;

    // This cycle support periods only within the same day
    for (const [iteratingName, iteratingPeriod] of periods) {
      const { start, end } = iteratingPeriod;

      // Must go before the next block to avoid initializing the next period
      // within the same iteration.
      if (period && !nextPeriod) {
        nextPeriod = iteratingPeriod;
      }

      if (!period && hours >= start && hours <= end) {
        name = iteratingName;
        period = iteratingPeriod;
      }

      if (period && name && nextPeriod) {
        return {
          period,
          name,
          nextPeriod,
        };
      }
    }

    // As the above cycle works only with the periods within the same day,
    // we need to manually handle the latest period, which breaks the day boundaries.
    const [[_, firstDateTimePeriod], ...restPeriods] = periods;
    const [lastDateTimeName, lastDateTimePeriod] = restPeriods[restPeriods.length - 1];

    return {
      name: lastDateTimeName,
      period: lastDateTimePeriod,
      nextPeriod: firstDateTimePeriod,
    };
  }

  public static getName(date: string | number | Date = new Date()): DayTimeName {
    return DayTime.getDateTimeDescriptor(date).name;
  }

  public static getTimeUntilNextPeriodStart(date: string | number | Date = new Date()) {
    const { period, nextPeriod } = DayTime.getDateTimeDescriptor(date);
    const parsedDate = new Date(date);

    // Next period starts within the same day
    if (period.start < nextPeriod.start) {
      const nextPeriodDate = new Date(parsedDate);

      nextPeriodDate.setHours(nextPeriod.start);
      nextPeriodDate.setMinutes(0);
      nextPeriodDate.setSeconds(0);
      nextPeriodDate.setMilliseconds(0);

      return nextPeriodDate.getTime() - parsedDate.getTime();
    }
    // Next period starts on the next day
    else {
      const nextPeriodDate = new Date(parsedDate);

      // This works even for the last day of a month (or year)
      nextPeriodDate.setDate(parsedDate.getDate() + 1);
      nextPeriodDate.setHours(nextPeriod.start);
      nextPeriodDate.setMinutes(0);
      nextPeriodDate.setSeconds(0);
      nextPeriodDate.setMilliseconds(0);

      return nextPeriodDate.getTime() - parsedDate.getTime();
    }
  }
}
