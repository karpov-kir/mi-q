import styled from 'styled-components/macro';

import { Button } from '../../components';
import { textShadowAndStroke } from '../../styles';

export const StyledRoot = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  align-content: center;
  flex-direction: column;
`;

export const StyledIntroText = styled.div`
  font-size: 36px;
  line-height: 40px;
  color: #fff;
  margin-bottom: 66px;

  ${textShadowAndStroke}
`;

export const StyledInputContainer = styled.div`
  border-bottom: 1px solid #fff;
  width: 572px;
  margin-bottom: 36px;
`;

export const StyledInput = styled.input`
  font-size: 36px;
  line-height: 40px;
  color: #fff;
  border: none;
  background: transparent;
  width: 100%;
  padding: 9px;
  text-align: center;

  ${textShadowAndStroke}

  &:focus {
    outline: none;
  }
`;

export const StyledButton = styled(Button)`
  ${textShadowAndStroke};
`;
