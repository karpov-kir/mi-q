import { StorageInterface } from '../../services';
import { useStorage } from '../useStorage';

interface UseFromStorageProps<StorageData> {
  storage: StorageInterface<StorageData>;
}

export function useFromStorage<StorageData>(props: UseFromStorageProps<StorageData>) {
  const { isInitialized, data, error } = useStorage(props);

  return { isInitialized, data, error };
}
