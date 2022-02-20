import { nanoid } from 'nanoid';

import { ShortcutActions, ShortcutActionTypes } from './actionts';
import { ShortcutReducerState } from './types';

export const shortcutReducer = (state: ShortcutReducerState, action: ShortcutActions): ShortcutReducerState => {
  if (!state) {
    return;
  }

  switch (action.type) {
    case ShortcutActionTypes.EditShortcut:
      return {
        ...state,
        items: state.items.map((shortcutItem) => {
          if (shortcutItem.id === action.id) {
            return { ...shortcutItem, ...action.data, id: action.id };
          } else {
            return shortcutItem;
          }
        }),
      };
    case ShortcutActionTypes.AddShortcut:
      return {
        ...state,
        items: [
          ...state.items,
          {
            ...action.data,
            id: nanoid(),
          },
        ],
      };
    case ShortcutActionTypes.RemoveShortcut:
      return {
        ...state,
        items: state.items.filter(({ id }) => id !== action.id),
      };
    default:
      return state;
  }
};
