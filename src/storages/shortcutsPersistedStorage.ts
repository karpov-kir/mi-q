import { ShortcutItemModel } from '../models';
import { PersistedStorage } from '../services';

export interface ShortcutsPersistedStorageData {
  items: ShortcutItemModel[];
}

export const shortcutsPersistedStorage = new PersistedStorage<
  ShortcutsPersistedStorageData,
  ShortcutsPersistedStorageData
>('shortcuts', {
  items: [],
});
