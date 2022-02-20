import styled from 'styled-components/macro';

import { textShadowAndStroke } from '../../../styles';

interface IsHidden {
  isHidden: boolean;
}

export const StyledRoot = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  width: 40px;
  position: relative;
`;

export const StyledShortcutContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  overflow: hidden;
`;

export const StyledShortcutButton = styled.button<IsHidden>`
  display: ${({ isHidden }) => (isHidden ? 'none' : 'flex')};
  cursor: pointer;
  background: rgba(255, 255, 255, 0.4);
  border: none;
  margin: 0 auto;
  width: 100%;
  height: 100%;

  &:hover,
  &:focus {
    background: rgba(255, 255, 255, 0.6);
  }

  &:focus {
    outline: none;
  }
`;

export const StyledIconContainer = styled.div`
  width: 25px;
  height: 25px;
  overflow: hidden;
  color: #cecece;
  margin: auto;
  border-radius: 6px;

  img,
  svg {
    width: 100%;
    height: auto;
    max-height: 25px;
  }
`;

export const StyledMoreButtonContainer = styled.div`
  position: absolute;
  right: -13px;
  top: 0;
  width: 13px;
  height: 15px;
  justify-content: flex-end;
  display: flex;
  opacity: 0;

  ${StyledRoot}:focus-within &,
  ${StyledRoot}:hover & {
    opacity: 1;
  }
`;

export const StyledMoreButton = styled.button`
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  width: 10px;
  overflow: hidden;
  color: #fff;

  svg {
    height: 15px;
    width: auto;
    position: relative;
    left: -2.5px;
  }
`;

export const StyledActionsContainer = styled.div<IsHidden>`
  background: #343434;
  display: ${({ isHidden }) => (isHidden ? 'none' : 'flex')};
  flex-direction: column;

  button {
    cursor: pointer;
    background: transparent;
    border: 0;
    margin: 0;
    color: #fff;
    font-size: 9px;
    line-height: 20px;
    padding: 0 5.5px;
    width: 100%;
    text-align: left;

    &:hover,
    &:focus {
      background: #4b4b4b;
    }

    &:focus {
      outline: none;
    }
  }
`;

export const StyledName = styled.div`
  font-size: 11px;
  line-height: 13px;
  color: #fff;
  text-align: center;
  margin-top: 6px;
  overflow: hidden;

  ${textShadowAndStroke}
`;
