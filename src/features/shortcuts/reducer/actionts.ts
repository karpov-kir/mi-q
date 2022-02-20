import { ShortcutItemModel } from '../../../models';

export enum ShortcutActionTypes {
  AddShortcut = 'add-shortcut',
  RemoveShortcut = 'remove-shortcut',
  EditShortcut = 'edit-shortcut',
  Initialize = 'initialize',
  Sync = 'sync',
}

export type ShortcutActions =
  | {
      type: ShortcutActionTypes.AddShortcut;
      data: Omit<ShortcutItemModel, 'id'>;
    }
  | {
      id: string;
      type: ShortcutActionTypes.EditShortcut;
      data: Partial<ShortcutItemModel>;
    }
  | {
      id: string;
      type: ShortcutActionTypes.RemoveShortcut;
    }
  | {
      type: ShortcutActionTypes.Initialize;
    };
