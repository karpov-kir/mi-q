import { ShortcutItemModel } from '../../../models';

export type ShortcutReducerState =
  | {
      items: ShortcutItemModel[];
    }
  | undefined;

export type ShortcutReducerStateSyncData = Omit<ShortcutReducerState, 'isInitialized'>;
