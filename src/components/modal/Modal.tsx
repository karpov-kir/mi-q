import { ReactNode } from 'react';
import ReactModal from 'react-modal';

import { modalStyles, StyledButton, StyledButtonsContainer, StyledTitle } from './Modal.styles';

interface ModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  title: string;
  children: ReactNode;
  applyText?: string;
  cancelText?: string;
  onApply?: () => void;
  isSaveDisabled?: boolean;
  isActionsHidden?: boolean;
}

export function Modal(props: ModalProps) {
  const {
    title,
    isOpen,
    onRequestClose,
    children,
    cancelText = 'Cancel',
    applyText = 'Apply',
    onApply,
    isSaveDisabled,
  } = props;

  return (
    <ReactModal isOpen={isOpen} onRequestClose={onRequestClose} style={modalStyles} contentLabel={title}>
      <StyledTitle>{title}</StyledTitle>

      <div>{children}</div>

      <StyledButtonsContainer>
        <StyledButton variant="outlined" type="button" onClick={onRequestClose} size="small">
          {cancelText}
        </StyledButton>
        <StyledButton variant="contained" type="button" onClick={onApply} disabled={isSaveDisabled} size="small">
          {applyText}
        </StyledButton>
      </StyledButtonsContainer>
    </ReactModal>
  );
}
