import { DayTime } from '../../utils';
import { StyledRoot } from './Greeting.styles';

interface GreetingProps {
  name?: string;
}

export function Greeting(props: GreetingProps) {
  const { name } = props;

  return (
    <StyledRoot>
      {!!name && (
        <span>
          Good {DayTime.getName()}, {name}!
        </span>
      )}
      {!name && <span>Good {DayTime.getName()}!</span>}
    </StyledRoot>
  );
}
