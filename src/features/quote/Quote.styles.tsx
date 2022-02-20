import styled from 'styled-components/macro';

import { textShadowAndStroke } from '../../styles';

export const StyledRoot = styled.div``;

export const StyledQuote = styled.div`
  font-size: 18px;
  color: #fff;
  text-align: center;
  margin-bottom: 9px;

  ${textShadowAndStroke}
`;

export const StyledAuthor = styled.div`
  font-size: 16px;
  color: #fff;
  text-align: center;

  ${textShadowAndStroke}
`;
