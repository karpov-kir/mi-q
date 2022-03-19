import { toDoCategories, ToDoItemModel } from '../models';
import { PersistedStorage } from '../services';

export interface ToDoPersistedStorageData {
  items: ToDoItemModel[];
  categoryId: string;
}

export const toDoPersistedStorage = new PersistedStorage<ToDoPersistedStorageData>('to-do', {
  items: [],
  categoryId: toDoCategories[0].id,
});
