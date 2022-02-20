import { KeyboardEvent, useRef } from 'react';

import { SearchIcon } from '../../components';
import { SearchIconContainer, StyledInput, StyledRoot } from './Search.styles';

const MAX_SEARCH_QUERY_LENGTH = 1500;

export function Search() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleIconClick = () => {
    if (!inputRef.current) {
      return;
    }

    inputRef.current.focus();
  };

  const handleInputInput = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.currentTarget.value.length > MAX_SEARCH_QUERY_LENGTH) {
      event.currentTarget.value = event.currentTarget.value.slice(0, MAX_SEARCH_QUERY_LENGTH);
    }
  };

  const handleInputKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    const trimmedSearch = event.currentTarget.value.trim();

    if ((event.code !== 'Enter' && event.code !== 'NumpadEnter') || !trimmedSearch) {
      return;
    }

    window.location.href = `https://google.com/search?q=${decodeURIComponent(trimmedSearch)}`;
  };

  return (
    <StyledRoot>
      <SearchIconContainer onClick={handleIconClick}>
        <SearchIcon />
      </SearchIconContainer>
      <StyledInput ref={inputRef} type="text" onKeyPress={handleInputKeyPress} onInput={handleInputInput} />
    </StyledRoot>
  );
}
