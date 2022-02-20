import styled from 'styled-components/macro';

export const StyledRoot = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

export const StyledOverlay = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.1);
`;

export const StyledBackground = styled.div`
  background-color: #1e1e1e;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
`;

export const StyledContentContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;
