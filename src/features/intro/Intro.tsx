import { ChangeEvent, KeyboardEvent, useState } from 'react';
import toast from 'react-hot-toast';

import { namePersistedStorage } from '../../storages';
import { StyledButton, StyledInput, StyledInputContainer, StyledIntroText, StyledRoot } from './Intro.styles';
import { Logo } from './logo';

const MAX_NAME_LENGTH = 19;

export function Intro() {
  const [name, setName] = useState('');
  const trimmedName = name.trim();

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.length > MAX_NAME_LENGTH) {
      return;
    }

    setName(event.target.value);
  };

  const handleSubmit = () => {
    namePersistedStorage.setItem(name.trim()).catch((error: Error) => {
      toast.error(`Could not save name, error: ${error.message}`);
    });
  };

  const handleInputKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if ((event.code !== 'Enter' && event.code !== 'NumpadEnter') || !trimmedName) {
      return;
    }

    handleSubmit();
  };

  return (
    <StyledRoot>
      <Logo />
      <StyledIntroText>Hello, what is your name?</StyledIntroText>
      <StyledInputContainer>
        <StyledInput value={name} onChange={handleNameChange} type="text" onKeyPress={handleInputKeyPress} />
      </StyledInputContainer>
      <StyledButton variant="outlined" onClick={handleSubmit} disabled={!trimmedName} type="button" size="medium">
        Proceed
      </StyledButton>
    </StyledRoot>
  );
}
