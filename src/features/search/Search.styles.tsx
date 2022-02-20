import styled from 'styled-components/macro';

export const StyledRoot = styled.div`
  position: relative;
  cursor: text;
`;

export const StyledInput = styled.input`
  width: 100%;
  border: none;
  font-size: 20px;
  line-height: 25px;
  padding: 8px 10px 8px 40px;
  flex: 1;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 12px;
  color: #fff;

  &:focus {
    outline: none;
  }
`;

export const SearchIconContainer = styled.div`
  width: 24px;
  color: #fff;
  position: absolute;
  left: 12px;
  top: 8.5px;
  display: inline-flex;
`;
