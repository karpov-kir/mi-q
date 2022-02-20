import { ChangeEvent, KeyboardEvent } from 'react';

import { toDoCategories, ToDoItemModel } from '../../models';

interface ToDoItemProps extends ToDoItemModel {
  onRemove: (id: string) => void;
  onEdit: (id: string, data: Partial<Omit<ToDoItemModel, 'id'>>) => void;
}

const divElement = document.createElement('div');

export function ToDoItem(props: ToDoItemProps) {
  const { id, title, onRemove, onEdit, isCompleted, categoryId } = props;

  const handleToggle = (event: ChangeEvent<HTMLInputElement>) => {
    onEdit(id, {
      isCompleted: event.target.checked,
    });
  };

  const handleCategoryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onEdit(id, {
      categoryId: event.target.value,
    });
  };

  const handTitleChange = (event: KeyboardEvent<HTMLDivElement>) => {
    divElement.innerHTML = event.currentTarget.innerHTML;

    // TODO fix deprecation
    // TODO move the cursor to the previous place
    event.currentTarget.innerHTML = divElement.innerText;
    document.execCommand('selectAll', false, undefined);
    document.getSelection()?.collapseToEnd();

    onEdit(id, {
      title: divElement.innerText,
    });
  };

  const handleTitleRef = (divElement: HTMLDivElement | null) => {
    if (!divElement) {
      return;
    }

    divElement.innerText = title;
  };

  const handleRemove = () => onRemove(id);

  return (
    <div>
      <div ref={handleTitleRef} onInput={handTitleChange} contentEditable />
      <input type="checkbox" onChange={handleToggle} checked={isCompleted} />
      <select value={categoryId} onChange={handleCategoryChange}>
        {toDoCategories.map(({ id, name }) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>
      <button type="button" onClick={handleRemove}>
        Remove
      </button>
    </div>
  );
}
