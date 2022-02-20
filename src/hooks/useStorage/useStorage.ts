import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { StorageInterface } from '../../services';
import { registerStorageManagerForStorage, unregisterStorageManagerForStorage } from './registerStorageManager';
import { StorageManagerEvent } from './StorageManager';

export type InferStorageDefaultValue<Storage> = Storage extends {
  defaultValue: infer DefaultValue;
}
  ? DefaultValue
  : undefined;

interface UseStorageProps<StorageData> {
  storage: StorageInterface<StorageData>;
}

interface HookResult<StorageData> {
  isInitialized: boolean;
  error?: Error;
  data?: StorageData;
  setData: (data: StorageData) => void;
}

interface _HookResultV2<StorageData, DefaultValue> {
  isInitialized: boolean;
  error?: Error;
  data: DefaultValue;
  setData: (data: StorageData) => void;
}

export function useStorage<StorageData>(props: UseStorageProps<StorageData>): HookResult<StorageData> {
  const { storage } = props;
  const storageManager = useMemo(() => registerStorageManagerForStorage(storage), []);
  const [{ data, isInitialized, error, payloadIndex }, setData] = useState<StorageManagerEvent<StorageData>>(
    storageManager.getManagerEvent(),
  );
  const latestPayloadIndexRef = useRef(payloadIndex);

  // Sync data from the local state to the storage
  const wrappedSetData = useCallback((data: StorageData) => {
    // It will fire `dataEvent`, so the data from the storage to the local state will be
    // synchronized automatically in the next use effect.
    storageManager.setData(data);
  }, []);

  // Sync data from the storage to the local state
  useEffect(() => {
    const handleData = ({ isInitialized, error, data, payloadIndex }: StorageManagerEvent<StorageData>) => {
      // Avoid re-rendering in case if the initial data matches the first data event in case when this
      // use effect is executed after the data is initialized and the hook itself also is started after the data
      // is initialized (this is possible if this hook is used two times or more for the same storage
      // in different places of the app).Ss
      if (latestPayloadIndexRef.current === payloadIndex) {
        return;
      }

      latestPayloadIndexRef.current = payloadIndex;

      setData({
        payloadIndex,
        isInitialized,
        error,
        data,
      });
    };

    // Sync all data from the storage to the state:
    // - initial data
    // - outside changes
    // - direct state changes
    storageManager.dataEvent.subscribe(handleData);

    return () => {
      storageManager.dataEvent.unsubscribe(handleData);
      unregisterStorageManagerForStorage(storage);
    };
  }, []);

  return { data, isInitialized, setData: wrappedSetData, error };
}
