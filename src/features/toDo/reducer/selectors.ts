import { ToDoReducerState } from './types';

export function selectActiveCategoryToDoItems(state: ToDoReducerState) {
  if (!state) {
    return [];
  }

  const { items, categoryId } = state;

  return items.filter((toDoItem) => toDoItem.categoryId === categoryId);
}
