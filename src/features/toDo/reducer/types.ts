import { ToDoItemModel } from '../../../models';

export type ToDoReducerState =
  | {
      items: ToDoItemModel[];
      categoryId: string;
    }
  | undefined;
