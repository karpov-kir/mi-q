import { MouseEvent, ReactNode } from 'react';

import { Size, StyledContainedButtonContent, StyledOutlinedButtonContent, StyledRoot } from './Button.styles';

interface ButtonProps extends Partial<Size> {
  children: ReactNode;
  variant?: 'outlined' | 'contained';
  disabled?: boolean;
  type?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

export function Button(props: ButtonProps) {
  const { children, variant = 'outlined', onClick, disabled, className, size = 'medium' } = props;
  const StyledButtonContentComponent =
    variant === 'outlined' ? StyledOutlinedButtonContent : StyledContainedButtonContent;

  return (
    <StyledRoot className={className} onClick={onClick} disabled={disabled} size={size}>
      <StyledButtonContentComponent size={size}>{children}</StyledButtonContentComponent>
    </StyledRoot>
  );
}
