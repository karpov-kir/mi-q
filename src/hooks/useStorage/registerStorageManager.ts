import { StorageInterface } from '../../services';
import { StorageManager } from './StorageManager';

// Cache managers, it reduces number of listeners and amount of initialization logic
const storageManagers = new Map<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  StorageInterface<any>,
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    storageManager: StorageManager<any>;
    instanceCount: number;
  }
>();

export function registerStorageManagerForStorage<StorageData>(
  storage: StorageInterface<StorageData>,
): StorageManager<StorageData> {
  const storageManagerDescriptor = storageManagers.get(storage);

  if (storageManagerDescriptor) {
    storageManagers.set(storage, {
      storageManager: storageManagerDescriptor.storageManager,
      instanceCount: storageManagerDescriptor.instanceCount + 1,
    });

    return storageManagerDescriptor.storageManager;
  }

  const newStorageManager = new StorageManager<StorageData>(storage);

  newStorageManager.init();

  storageManagers.set(storage, {
    storageManager: newStorageManager,
    instanceCount: 1,
  });

  return newStorageManager;
}

export function unregisterStorageManagerForStorage<StorageData>(storage: StorageInterface<StorageData>) {
  const storageManagerDescriptor = storageManagers.get(storage);

  if (!storageManagerDescriptor) {
    return;
  }

  const newInstanceCount = storageManagerDescriptor.instanceCount - 1;
  const isLastInstance = !newInstanceCount;

  if (isLastInstance) {
    storageManagerDescriptor.storageManager.destroy();

    storageManagers.delete(storage);
    return;
  }

  storageManagers.set(storage, {
    storageManager: storageManagerDescriptor.storageManager,
    instanceCount: newInstanceCount,
  });
}
