import isEqual from 'lodash.isequal';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { NotFoundError } from '../../errors';
import { StorageInterface } from '../../services';

interface UseSyncWithStorageProps<StorageData> {
  storage: StorageInterface<StorageData>;
  localData: StorageData;
  onSync: (data: StorageData) => void;
}

export function useSyncWithStorage<StorageData>(props: UseSyncWithStorageProps<StorageData>) {
  const { storage, onSync, localData } = props;
  const [isInitialized, setIsInitialized] = useState(false);
  const lastLoadedData = useRef(localData);
  const ignoreInitialLoadFromStorageRef = useRef(false);
  // Use ref to avoid redundant triggers when watching local data changes
  const isInitializedRef = useRef(isInitialized);

  // Load initial data from a storage
  useEffect(() => {
    storage
      .getItem()
      .then((initialData) => {
        if (ignoreInitialLoadFromStorageRef.current) {
          return;
        }

        lastLoadedData.current = initialData;
        onSync(initialData);
        setIsInitialized(true);
        isInitializedRef.current = true;
      })
      .catch((error: Error) => {
        if (ignoreInitialLoadFromStorageRef.current) {
          return;
        }

        if (error instanceof NotFoundError) {
          setIsInitialized(true);
          isInitializedRef.current = true;
          return;
        }

        toast.error(`Could not load initial data from ${storage.key} storage, error: ${error.message}`);
      });
  }, []);

  // Handle new changes in the storage, e.g. something has been changed on a different browser tab
  useEffect(() => {
    const handleStorageChange = (data: StorageData) => {
      if (isEqual(data, lastLoadedData.current)) {
        return;
      }

      // When something is changed in the storage this has more priority than the initial loading
      // because the user might have changed something on another browser tab.
      lastLoadedData.current = data;
      onSync(data);
      setIsInitialized(true);
      ignoreInitialLoadFromStorageRef.current = true;
      isInitializedRef.current = true;
    };

    storage.changeEvent.subscribe(handleStorageChange);

    return () => {
      storage.changeEvent.unsubscribe(handleStorageChange);
    };
  }, []);

  // Save data to the persisted storage when something is changed
  useEffect(() => {
    if (!isInitializedRef.current || isEqual(localData, lastLoadedData.current)) {
      return;
    }

    lastLoadedData.current = localData;

    storage.setItem(localData).catch((error: Error) => {
      toast.error(
        `Could not save data to ${storage.key} storage, error: ${error.message}. Data will be lost on page reloading.`,
      );
    });
  }, [localData]);

  return { isInitialized };
}
