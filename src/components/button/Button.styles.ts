import styled from 'styled-components/macro';

export interface Size {
  size: 'small' | 'medium';
}

const fontSizeMap = {
  small: `12px`,
  medium: `14px`,
};

const lineHeightMap = {
  small: `18px`,
  medium: `18px`,
};

const paddingMap = {
  small: `4px 19px`,
  medium: `9px 42.5px`,
};

export const StyledRoot = styled.button<Size>`
  font-size: ${({ size }) => fontSizeMap[size]};
  line-height: ${({ size }) => lineHeightMap[size]};
  cursor: pointer;
  color: #fff;
  background: transparent;
  border: none;
  padding: 0;

  &:focus {
    outline: none;
  }
`;

const BaseButtonContentStyles = styled.div<Size>`
  padding: ${({ size }) => paddingMap[size]};
  border: 1px solid #fff;
  border-radius: 4px;
`;

export const StyledOutlinedButtonContent = styled(BaseButtonContentStyles)`
  background: transparent;

  ${StyledRoot}:hover & {
    background: rgba(240, 240, 240, 0.3);
  }

  ${StyledRoot}:focus & {
    background: rgba(240, 240, 240, 0.6);
    outline: none;
  }

  ${StyledRoot}:disabled & {
    color: #bbbbbb;
    border-color: #bbbbbb;
    cursor: not-allowed;

    ${StyledRoot}:focus &,
    ${StyledRoot}:hover & {
      background: inherit;
    }
  }
`;

export const StyledContainedButtonContent = styled(BaseButtonContentStyles)`
  background: #4d89e9;
  border-color: #4d89e9;

  ${StyledRoot}:hover & {
    background: #377eef;
  }

  ${StyledRoot}:focus & {
    background: #176df3;
    outline: none;
  }

  ${StyledRoot}:disabled & {
    background: #979797;
    border-color: #979797;
    cursor: not-allowed;

    ${StyledRoot}:focus &,
    ${StyledRoot}:hover & {
      background: #979797;
    }
  }
`;
