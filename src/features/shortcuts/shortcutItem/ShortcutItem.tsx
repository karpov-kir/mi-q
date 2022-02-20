import { MouseEvent, ReactNode, useCallback, useRef, useState } from 'react';
import { useOnClickOutside } from 'usehooks-ts';

import { MoreVerticalIcon } from '../../../components';
import {
  StyledActionsContainer,
  StyledIconContainer,
  StyledMoreButton,
  StyledMoreButtonContainer,
  StyledName,
  StyledRoot,
  StyledShortcutButton,
  StyledShortcutContainer,
} from './ShortcutItem.styles';

interface ShortcutItemProps {
  name?: string;
  onClick: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
  icon: ReactNode;
  isActionsHidden?: boolean;
}

export function ShortcutItem(props: ShortcutItemProps) {
  const { name, icon, onClick, onEdit, onRemove, isActionsHidden } = props;
  const [isMoreShown, setIsMoreShown] = useState(false);
  const actionsContainerRef = useRef<HTMLDivElement | null>(null);
  const moreButtonRef = useRef<HTMLButtonElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const emptyRootRef = useRef<null>(null);

  const handleRootClick = (event: MouseEvent<HTMLDivElement>) => {
    const clickedElement = event.target as HTMLElement;
    const isClickedOnActionsRelatedElements =
      // Click on the action buttons container or on the show more (show actions) button
      [moreButtonRef.current || actionsContainerRef.current].some((element) => element === clickedElement) ||
      // Click on the children of more button
      moreButtonRef.current?.contains(clickedElement) ||
      // Click on the children of the action buttons container
      actionsContainerRef.current?.contains(clickedElement);

    if (isClickedOnActionsRelatedElements) {
      return;
    }

    onClick();
  };

  const handleMoreButtonClick = () => {
    setIsMoreShown(!isMoreShown);
  };

  const handleEditButtonClick = () => {
    setIsMoreShown(false);

    if (onEdit) {
      onEdit();
    }
  };

  const handleOutsideClick = useCallback(() => {
    setIsMoreShown(false);
  }, []);

  useOnClickOutside(
    // Attach the listener only when the action buttons are shown to avoid redundant event listeners attached
    // to each shortcut item.
    isMoreShown
      ? rootRef
      : // To avoid triggering of the hook that is responsible for attaching the actual outside click event listeners
        // we need to pass an immutable object to make sure that the hook is not fired between re-renders
        emptyRootRef,
    handleOutsideClick,
  );

  return (
    <StyledRoot onClick={handleRootClick} ref={rootRef}>
      <StyledShortcutContainer>
        <StyledShortcutButton type="button" isHidden={isMoreShown}>
          <StyledIconContainer>{icon}</StyledIconContainer>
        </StyledShortcutButton>
        <StyledActionsContainer ref={actionsContainerRef} isHidden={!isMoreShown}>
          <button onClick={handleEditButtonClick} type="button">
            Edit
          </button>
          <button onClick={onRemove} type="button">
            Delete
          </button>
        </StyledActionsContainer>

        {!isActionsHidden && (
          <StyledMoreButtonContainer onClick={handleMoreButtonClick}>
            <StyledMoreButton ref={moreButtonRef} type="button">
              <MoreVerticalIcon />
            </StyledMoreButton>
          </StyledMoreButtonContainer>
        )}
      </StyledShortcutContainer>

      {name && <StyledName>{name}</StyledName>}
    </StyledRoot>
  );
}
