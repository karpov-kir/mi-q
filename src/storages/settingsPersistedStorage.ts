import { SettingsModel } from '../models';
import { PersistedStorage } from '../services';

export const settingsPersistedStorage = new PersistedStorage<SettingsModel>('settings', {
  isClockEnabled: true,
  isGreetingEnabled: false,
  isGreetingWithName: false,
  isSearchEnabled: true,
  isShortcutsEnabled: true,
  isQuoteEnabled: true,
});
