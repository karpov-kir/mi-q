import { useEffect, useState } from 'react';

import { StyledRoot } from './Clock.styles';

export enum ClockFormat {
  '24Hours' = '24Hours',
  '12Hours' = '12Hours',
}

interface ClockProps {
  format?: ClockFormat;
}

export function Clock(props: ClockProps) {
  const { format } = props;
  const [time, setTime] = useState(getTime(format));

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    runTimer();

    function runTimer() {
      timeoutId = setTimeout(() => {
        setTime(getTime(format));
        runTimer();
      }, 1000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return <StyledRoot>{time}</StyledRoot>;
}

function getTime(format: ClockFormat = ClockFormat['24Hours']) {
  const date = new Date();
  const hoursIn24Format = date.getHours();

  const formattedMinutes = date.getMinutes().toString().padStart(2, '0');
  let formattedHours = '';
  let suffix = '';

  if (format === ClockFormat['24Hours']) {
    formattedHours = hoursIn24Format.toString().toString().padStart(2, '0');
  } else {
    formattedHours = (hoursIn24Format % 12 || 12).toString().toString().padStart(2, '0');
    suffix = hoursIn24Format >= 12 ? 'PM' : 'AM';
  }

  return `${formattedHours}:${formattedMinutes}${suffix}`;
}
