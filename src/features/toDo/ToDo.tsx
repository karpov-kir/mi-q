import { ChangeEvent, KeyboardEvent, memo, useCallback } from 'react';

import { useStorageReducer } from '../../hooks';
import { toDoCategories, ToDoItemModel } from '../../models';
import { toDoPersistedStorage } from '../../storages';
import { ToDoActionTypes, toDoReducer } from './reducer';
import { selectActiveCategoryToDoItems } from './reducer/selectors';
import { StyledInput, StyledRoot } from './ToDo.styles';
import { ToDoItem } from './ToDoItem';

const MemoizedToDoItem = memo(ToDoItem);

const MAX_TO_DO_ITEM_TEXT_LENGTH = 1000;

export function ToDo() {
  const {
    reducerState: toDoReducerState,
    isInitialized,
    error,
    dispatch: toDoDispatch,
  } = useStorageReducer({
    storage: toDoPersistedStorage,
    reducer: toDoReducer,
  });

  const handleCategoryChange = (event: ChangeEvent<HTMLSelectElement>) =>
    toDoDispatch({
      type: ToDoActionTypes.EditCategory,
      categoryId: event.target.value,
    });

  // Add to do tem on Enter key press
  const handleToDoInputKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if ((event.key !== 'Enter' && event.code !== 'NumpadEnter') || !event.currentTarget.value.trim()) {
      return;
    }

    toDoDispatch({
      type: ToDoActionTypes.AddToDo,
      title: event.currentTarget.value,
    });

    event.currentTarget.value = '';
  };

  // Limit to do item length to `MAX_TO_DO_ITEM_TEXT_LENGTH`
  const handleToDoInputInput = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.currentTarget.value.length <= MAX_TO_DO_ITEM_TEXT_LENGTH) {
      return;
    }

    event.currentTarget.value = event.currentTarget.value.slice(0, MAX_TO_DO_ITEM_TEXT_LENGTH);
  };

  const handleToDoItemRemove = useCallback(
    (id: string) =>
      toDoDispatch({
        type: ToDoActionTypes.RemoveToDo,
        id,
      }),
    [],
  );

  const handleToDoItemEdit = useCallback(
    (id: string, data: Partial<ToDoItemModel>) =>
      toDoDispatch({
        type: ToDoActionTypes.EditToDo,
        id,
        data,
      }),
    [],
  );

  if (error) {
    return <div>Could not initialize the shortcuts</div>;
  }

  if (!toDoReducerState || !isInitialized) {
    return null;
  }

  const { categoryId } = toDoReducerState;
  const activeCategoryToDoItems = selectActiveCategoryToDoItems(toDoReducerState);

  return (
    <StyledRoot>
      <select value={categoryId} onChange={handleCategoryChange}>
        {toDoCategories.map(({ id, name }) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>
      {activeCategoryToDoItems.map((toDoItem) => (
        <MemoizedToDoItem key={toDoItem.id} {...toDoItem} onRemove={handleToDoItemRemove} onEdit={handleToDoItemEdit} />
      ))}
      <StyledInput
        placeholder="New task"
        type="text"
        onKeyPress={handleToDoInputKeyPress}
        onInput={handleToDoInputInput}
      />
    </StyledRoot>
  );
}
