import styled from 'styled-components/macro';

export const StyledInputContainer = styled.div``;

export const StyledInput = styled.input`
  min-width: 333px;
  background: #1f1f1f;
  border-radius: 4px;
  border: none;
  border-bottom: 1px solid #1f1f1f;
  margin-bottom: 20px;
  line-height: 15px;
  font-size: 9px;
  color: #fff;
  padding: 4px 6px;

  &:focus {
    border-bottom: 1px solid #4d89e9;
    outline: none;
  }
`;

export const StyledInputLabel = styled.div`
  color: #979797;
  line-height: 15px;
  font-size: 9px;
  margin-bottom: 11px;

  ${StyledInputContainer}:focus-within & {
    color: #ffffff;
  },
`;
