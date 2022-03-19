import { memo, useCallback, useState } from 'react';

import { PlusIcon } from '../../components';
import { useStorageReducer } from '../../hooks';
import { ShortcutItemModel } from '../../models';
import { shortcutsPersistedStorage } from '../../storages';
import { ShortcutActionTypes, shortcutReducer } from './reducer';
import { ShortcutItem, SmartShortcutItem } from './shortcutItem';
import { ShortcutItemForm } from './shortcutItemForm';
import { StyledRoot, StyledShortcutItemsContainer } from './Shortcuts.styles';

const MemoizedSmartShortcutItem = memo(SmartShortcutItem);

const MAXIMUM_SHORTCUT_ITEMS = 12;

export function Shortcuts() {
  const {
    reducerState: shortcutReducerState,
    dispatch: shortcutDispatch,
    error,
    isInitialized,
  } = useStorageReducer({
    storage: shortcutsPersistedStorage,
    reducer: shortcutReducer,
  });
  const [isAdding, setIsAdding] = useState(false);

  const handleShowShortcutItemForm = () => {
    setIsAdding(!isAdding);
  };

  const handleShortcutItemAdd = (newShortcutItem: Omit<ShortcutItemModel, 'id'>) => {
    shortcutDispatch({
      type: ShortcutActionTypes.AddShortcut,
      data: newShortcutItem,
    });
    setIsAdding(false);
  };

  const handleShortcutItemFormClose = () => {
    setIsAdding(false);
  };

  const handleShortcutItemEdit = useCallback(() => {
    setIsAdding(true);
  }, []);

  const handShortcutItemRemove = useCallback(
    (id: string) =>
      shortcutDispatch({
        type: ShortcutActionTypes.RemoveShortcut,
        id,
      }),
    [],
  );

  if (!isInitialized) {
    return null;
  }

  if (error) {
    return <div>Could not initialize the shortcuts</div>;
  }

  const { items: shortcutItems } = shortcutReducerState;

  return (
    <StyledRoot>
      <StyledShortcutItemsContainer>
        {shortcutItems.map((shortcutItem) => (
          <MemoizedSmartShortcutItem
            key={shortcutItem.id}
            {...shortcutItem}
            onRemove={handShortcutItemRemove}
            onEdit={handleShortcutItemEdit}
          />
        ))}
        {shortcutItems.length < MAXIMUM_SHORTCUT_ITEMS && (
          <ShortcutItem icon={<PlusIcon />} onClick={handleShowShortcutItemForm} isActionsHidden={true} />
        )}
      </StyledShortcutItemsContainer>

      <ShortcutItemForm
        onSubmit={handleShortcutItemAdd}
        isOpen={isAdding}
        onRequestClose={handleShortcutItemFormClose}
      />
    </StyledRoot>
  );
}
