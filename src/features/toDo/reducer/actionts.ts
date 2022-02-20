import { ToDoItemModel } from '../../../models';
import { ToDoReducerState } from './types';

export enum ToDoActionTypes {
  AddToDo = 'add-to-do',
  RemoveToDo = 'remove-to-do',
  EditToDo = 'edit-to-do',
  EditCategory = 'edit-category',
  Sync = 'sync',
}

export type ToDoActions =
  | {
      title: string;
      type: ToDoActionTypes.AddToDo;
    }
  | {
      id: string;
      type: ToDoActionTypes.EditToDo;
      data: Partial<ToDoItemModel>;
    }
  | {
      id: string;
      type: ToDoActionTypes.RemoveToDo;
    }
  | {
      type: ToDoActionTypes.EditCategory;
      categoryId: string;
    }
  | {
      type: ToDoActionTypes.Sync;
      data: Omit<ToDoReducerState, 'isInitialized'>;
    };
