import { act, renderHook } from '@testing-library/react-hooks';
import toast from 'react-hot-toast';

import { NotFoundError } from '../../errors';
import { PersistedStorage, StorageInterface } from '../../services';
import { delay } from '../../utils';
import { useSyncWithStorage } from './useSyncWithStorage';

jest.spyOn(toast, 'error');

interface TestData {
  [key: string]: string | number;
}

const initialStorageData = {
  testKey: 'testValue',
};
const newTestData1 = {
  newTestKey1: 'newTestValue1',
};
const newTestData2 = {
  newTestKey2: 'newTestValue2',
};
const newTestData3 = {
  newTestKey3: 'newTestValue3',
};

let localData = {};
const handleSync = jest.fn((newData: TestData) => {
  localData = newData;
});

describe(useSyncWithStorage, () => {
  let storage: StorageInterface<TestData>;

  beforeEach(async () => {
    jest.clearAllMocks();

    storage = new PersistedStorage<TestData>('test', undefined);
    await storage.setItem(initialStorageData);
  });

  describe('Initialization', () => {
    it('should be initialized but should NOT call sync callback if the storage fails with 404 error', async () => {
      jest.spyOn(storage, 'getItem').mockRejectedValue(new NotFoundError('Test'));

      const { result, waitForNextUpdate } = renderHook(() =>
        useSyncWithStorage({ storage, localData, onSync: handleSync }),
      );

      // Wait until the initial data is loaded
      await waitForNextUpdate();

      expect(result.current.isInitialized).toBe(true);
      expect(handleSync).not.toBeCalled();
    });

    it('should toast an error if initial loading from the storage fails with NOT 404 error', async () => {
      jest.spyOn(storage, 'getItem').mockRejectedValue(new Error('Test'));

      const { result, waitForNextUpdate } = renderHook(() =>
        useSyncWithStorage({ storage, localData, onSync: handleSync }),
      );

      // Update should never happen as data is not loaded from the storage
      await expect(waitForNextUpdate()).rejects.toThrow();

      expect(result.current.isInitialized).toBe(false);
      expect(handleSync).not.toBeCalled();
    });

    it('should initialize data from a pub-sub event if it happens before initial loading', async () => {
      jest.spyOn(storage, 'getItem').mockImplementationOnce(async () => {
        // Delay the usual get item for some time to make sure that the storage's
        // change event wins the race.
        await delay(5);
        return newTestData1;
      });

      const { result, waitForNextUpdate } = renderHook(() =>
        useSyncWithStorage({ storage, localData, onSync: handleSync }),
      );

      // This triggers the storage's change event and this should win the race
      act(() => {
        storage.setItem(newTestData2);
      });

      // Make sure that the initial loading of the data from the storage does not override the data from pub-sub event,
      // so waiting should fail as overriding should not happen.
      await expect(waitForNextUpdate()).rejects.toThrow();

      expect(result.current.isInitialized).toEqual(true);
      expect(handleSync).toBeCalledTimes(1);
      expect(handleSync).toBeCalledWith(newTestData2);
    });

    it('should ignore initial error from storage if a pub-sub event happens before', async () => {
      jest.spyOn(storage, 'getItem').mockImplementationOnce(async () => {
        // Delay the usual get item for some time to make sure that the storage's
        // change event wins the race.
        await delay(5);
        throw new Error('Test');
      });

      const { result, waitForNextUpdate } = renderHook(useSyncWithStorage, {
        initialProps: {
          storage,
          localData,
          onSync: handleSync,
        },
      });

      act(() => {
        storage.setItem(newTestData1);
      });

      // Update should never happen as data is not loaded from the storage
      await expect(waitForNextUpdate()).rejects.toThrow();

      expect(toast.error).not.toBeCalled();
      expect(result.current.isInitialized).toBe(true);
      expect(handleSync).toBeCalledTimes(1);
      expect(handleSync).toBeCalledWith(newTestData1);
    });

    it('should be initialized from a pub-sub event after it is failed to be initialized from the initial loading', async () => {
      jest.spyOn(storage, 'getItem').mockRejectedValue(new Error('Test'));

      const { result, waitForNextUpdate } = renderHook(useSyncWithStorage, {
        initialProps: {
          storage,
          localData,
          onSync: handleSync,
        },
      });

      // Update should never happen as data is not loaded from the storage
      await expect(waitForNextUpdate()).rejects.toThrow();

      act(() => {
        storage.setItem(newTestData1);
      });

      expect(toast.error).toBeCalledWith('Could not load initial data from test storage, error: Test');
      expect(handleSync).toBeCalledTimes(1);
      expect(handleSync).toBeCalledWith(newTestData1);
      expect(result.current.isInitialized).toBe(true);
    });
  });

  describe('Sync from a storage to local data', () => {
    it('should sync from a storage to local data', async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useSyncWithStorage({ storage, localData, onSync: handleSync }),
      );

      expect(result.current.isInitialized).toBe(false);

      // Wait until the initial data is loaded
      await waitForNextUpdate();

      expect(result.current.isInitialized).toBe(true);
      expect(handleSync).toBeCalledWith(initialStorageData);
      expect(handleSync).toBeCalledTimes(1);
    });

    it('should sync data from a pub-sub event to local data', async () => {
      const { waitForNextUpdate } = renderHook(() => useSyncWithStorage({ storage, localData, onSync: handleSync }));

      // Wait until the initial data is loaded
      await waitForNextUpdate();

      await act(async () => {
        await delay(5);
        await storage.setItem(newTestData1);
      });

      expect(handleSync).toBeCalledTimes(2);
      expect(handleSync).nthCalledWith(2, newTestData1);
    });

    it('should sync data from each unique pub-sub event to local data', async () => {
      renderHook(() => useSyncWithStorage({ storage, localData, onSync: handleSync }));

      // This triggers the storage's change event and this should win the race
      act(() => {
        storage.setItem(newTestData1);
        // Should be ignored as it is the same as previous one
        storage.setItem(newTestData1);
        storage.setItem(newTestData2);
        // Should be ignored as it is the same as previous one
        storage.setItem(newTestData2);
      });

      expect(handleSync).toBeCalledTimes(2);
      expect(handleSync).nthCalledWith(1, newTestData1);
      expect(handleSync).nthCalledWith(2, newTestData2);
    });
  });

  describe('Sync from local data to a storage', () => {
    it('should sync from local data to a storage', async () => {
      const { rerender, waitForNextUpdate } = renderHook(useSyncWithStorage, {
        initialProps: {
          storage,
          localData,
          onSync: handleSync,
        },
      });

      // Wait until the initial data is loaded
      await waitForNextUpdate();

      jest.spyOn(storage, 'setItem');
      rerender({ storage, localData: newTestData1, onSync: handleSync });
      // Should be ignored as it is the same as previous one
      rerender({ storage, localData: newTestData1, onSync: handleSync });
      rerender({ storage, localData: newTestData2, onSync: handleSync });
      // Should be ignored as it is the same as previous one
      rerender({ storage, localData: newTestData2, onSync: handleSync });

      expect(storage.setItem).toBeCalledTimes(2);
      expect(storage.setItem).nthCalledWith(1, newTestData1);
      expect(storage.setItem).nthCalledWith(2, newTestData2);
    });

    it('should toast an error if saving to storage fails', async () => {
      const { rerender, waitForNextUpdate } = renderHook(useSyncWithStorage, {
        initialProps: {
          storage,
          localData,
          onSync: handleSync,
        },
      });

      // Wait until the initial data is loaded
      await waitForNextUpdate();

      jest.spyOn(storage, 'setItem').mockRejectedValue(new Error('Test'));
      rerender({ storage, localData: newTestData1, onSync: handleSync });

      // Wait the same as hook waits as a toast should be shown only after saving to a storage fails
      await storage.setItem(newTestData1).catch(() => void 0);

      expect(toast.error).toBeCalledWith(
        'Could not save data to test storage, error: Test. Data will be lost on page reloading.',
      );
    });

    it('should not save local data to a storage if initial data is not initialized', async () => {
      jest.spyOn(storage, 'getItem').mockImplementation(async () => {
        await delay(5);
        return initialStorageData;
      });
      jest.spyOn(storage, 'setItem');

      const { rerender, waitForNextUpdate } = renderHook(useSyncWithStorage, {
        initialProps: {
          storage,
          localData,
          onSync: handleSync,
        },
      });

      rerender({ storage, localData: newTestData1, onSync: handleSync });

      await waitForNextUpdate();

      expect(storage.setItem).not.toBeCalled();
    });
  });

  describe('Advanced', () => {
    it('should handle multiple changes correctly', async () => {
      const { rerender } = renderHook(useSyncWithStorage, {
        initialProps: {
          storage,
          localData,
          onSync: handleSync,
        },
      });

      jest.spyOn(storage, 'setItem');

      await act(async () => {
        await storage.setItem(newTestData1);
      });
      rerender({ storage, localData: newTestData2, onSync: handleSync });
      rerender({ storage, localData: newTestData1, onSync: handleSync });
      await act(async () => {
        // Should be ignored as local data is synced to the save value in the previous
        await storage.setItem(newTestData1);
        await storage.setItem(newTestData2);
      });
      rerender({ storage, localData: newTestData3, onSync: handleSync });

      expect(handleSync).toBeCalledTimes(2);
      expect(handleSync).nthCalledWith(1, newTestData1);
      expect(handleSync).nthCalledWith(2, newTestData2);

      expect(storage.setItem).toBeCalledTimes(6);
      expect(storage.setItem).nthCalledWith(1, newTestData1);
      expect(storage.setItem).nthCalledWith(2, newTestData2);
      expect(storage.setItem).nthCalledWith(3, newTestData1);
      expect(storage.setItem).nthCalledWith(4, newTestData1);
      expect(storage.setItem).nthCalledWith(5, newTestData2);
      expect(storage.setItem).nthCalledWith(6, newTestData3);
    });
  });
});
