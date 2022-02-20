import styled from 'styled-components/macro';

import { Button } from '../button';

export const modalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    padding: 20,
    transform: 'translate(-50%, -50%)',
    background: '#262626',
    borderRadius: 10,
  },
};

export const StyledTitle = styled.div`
  font-size: 18px;
  line-height: 22px;
  color: #fff;
  margin-bottom: 18px;
`;

export const StyledButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const StyledButton = styled(Button)`
  margin-left: 11px;
`;
