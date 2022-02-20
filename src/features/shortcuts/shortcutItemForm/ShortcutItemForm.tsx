import { ChangeEvent, useMemo, useState } from 'react';

import { Modal } from '../../../components';
import { ShortcutItemModel } from '../../../models';
import { StyledInput, StyledInputContainer, StyledInputLabel } from './ShortcutItemForm.styles';

export interface ShortcutItemFormProps {
  onSubmit: (shortcutItem: Omit<ShortcutItemModel, 'id'>) => void;
  isOpen: boolean;
  onRequestClose: () => void;
}

export function ShortcutItemForm(props: ShortcutItemFormProps) {
  const { onSubmit, isOpen, onRequestClose } = props;
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const trimmedUrl = url.trim();
  const trimmedName = name.trim();

  const isUrlEmpty = !trimmedUrl;
  const { isValid: isUrlValid, isProtocolMissing } = useMemo(() => isValidUrl(trimmedUrl), [trimmedUrl]);

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
  };

  const handleSubmit = () => {
    onSubmit({
      name: trimmedName,
      url: (isProtocolMissing ? 'https://' : '') + trimmedUrl,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      title="Add shortcut"
      onApply={handleSubmit}
      isSaveDisabled={isUrlEmpty || !isUrlValid}
      applyText="Save"
    >
      <StyledInputContainer>
        <StyledInputLabel>Name</StyledInputLabel>
        <StyledInput value={name} onChange={handleNameChange} type="text" />
      </StyledInputContainer>

      <StyledInputContainer>
        <StyledInputLabel>URL</StyledInputLabel>
        <StyledInput value={url} onChange={handleUrlChange} type="text" />
        {!isUrlEmpty && !isUrlValid && <div>URL is not valid</div>}
      </StyledInputContainer>
    </Modal>
  );
}

function isValidUrl(url: string) {
  try {
    try {
      new URL(url);

      return {
        isValid: true,
        isProtocolMissing: false,
      };
    } catch (error) {
      new URL(`https://${url}`);

      return {
        isValid: true,
        isProtocolMissing: true,
      };
    }
  } catch (error) {
    return {
      isValid: false,
      isProtocolMissing: false,
    };
  }
}
