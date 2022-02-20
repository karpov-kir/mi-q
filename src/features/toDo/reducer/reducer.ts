import { nanoid } from 'nanoid';

import { ToDoActions, ToDoActionTypes } from './actionts';
import { ToDoReducerState } from './types';

export const toDoReducer = (state: ToDoReducerState, action: ToDoActions): ToDoReducerState => {
  if (!state) {
    return;
  }

  switch (action.type) {
    case ToDoActionTypes.EditToDo:
      return {
        ...state,
        items: state.items.map((toDoItem) => {
          if (toDoItem.id === action.id) {
            return { ...toDoItem, ...action.data, id: action.id };
          } else {
            return toDoItem;
          }
        }),
      };
    case ToDoActionTypes.AddToDo:
      return {
        ...state,
        items: [
          ...state.items,
          {
            id: nanoid(),
            isCompleted: false,
            title: action.title,
            categoryId: state.categoryId,
          },
        ],
      };
    case ToDoActionTypes.RemoveToDo:
      return {
        ...state,
        items: state.items.filter(({ id }) => id !== action.id),
      };
    case ToDoActionTypes.EditCategory:
      return {
        ...state,
        categoryId: action.categoryId,
      };
    case ToDoActionTypes.Sync:
      return {
        ...state,
        ...action.data,
      };
    default:
      return state;
  }
};
