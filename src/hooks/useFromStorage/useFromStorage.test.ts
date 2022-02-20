import { act, renderHook } from '@testing-library/react-hooks';
import toast from 'react-hot-toast';

import { NotFoundError } from '../../errors';
import { PersistedStorage, StorageInterface } from '../../services';
import { delay } from '../../utils';
import { useFromStorage } from './useFromStorage';

jest.spyOn(toast, 'error');

describe(useFromStorage, () => {
  let storage: StorageInterface<string>;

  beforeEach(async () => {
    jest.clearAllMocks();

    storage = new PersistedStorage<string>('test', undefined);
    await storage.setItem('Test default');
  });

  describe('Initialization', () => {
    it('should load initial data from a storage', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useFromStorage({ storage }));

      expect(result.current.isInitialized).toBe(false);
      expect(result.current.data).toBe(undefined);

      // Wait until the initial data is loaded
      await waitForNextUpdate();

      expect(result.current.isInitialized).toBe(true);
      expect(result.current.data).toBe('Test default');
    });

    it('should load initialize data to undefined if the storage fails with 404 error', async () => {
      jest.spyOn(storage, 'getItem').mockRejectedValue(new NotFoundError('Test'));

      const { result, waitForNextUpdate } = renderHook(() => useFromStorage({ storage }));

      // Wait until the initial data is loaded
      await waitForNextUpdate();

      expect(result.current.isInitialized).toBe(true);
      expect(result.current.data).toBe(undefined);
    });

    it('should toast an error if initial loading from the storage with NOT 404 error', async () => {
      jest.spyOn(storage, 'getItem').mockRejectedValue(new Error('Test'));

      const { result, waitForNextUpdate } = renderHook(() => useFromStorage({ storage }));

      // Update should never happen as data is not loaded from the storage
      await expect(waitForNextUpdate()).rejects.toThrow();

      expect(toast.error).toBeCalledWith('Could not load initial data from test storage, error: Test');
      expect(result.current.isInitialized).toBe(false);
      expect(result.current.data).toBe(undefined);
    });

    it('should initialize data from a pub-sub event if it happens before initial loading', async () => {
      jest.spyOn(storage, 'getItem').mockImplementationOnce(async () => {
        // Delay the usual get item for some time to make sure that the storage's
        // change event wins the race.
        await delay(5);
        return 'Test delayed';
      });

      const { result, waitForNextUpdate } = renderHook(() => useFromStorage({ storage }));

      // This triggers the storage's change event and this should win the race
      act(() => {
        storage.setItem('Test from pub-sub event');
      });

      // Make sure that the initial loading of the data from the storage does not override the data from pub-sub event,
      // so waiting should fail as overriding should not happen.
      await expect(waitForNextUpdate()).rejects.toThrow();

      expect(result.current.isInitialized).toEqual(true);
      expect(result.current.data).toEqual('Test from pub-sub event');
    });

    it('should ignore initial error from storage if a pub-sub event happens before', async () => {
      jest.spyOn(storage, 'getItem').mockImplementationOnce(async () => {
        // Delay the usual get item for some time to make sure that the storage's
        // change event wins the race.
        await delay(5);
        throw new Error('Test');
      });

      const { result, waitForNextUpdate } = renderHook(() => useFromStorage({ storage }));

      act(() => {
        storage.setItem('Test from pub-sub event');
      });

      // Update should never happen as data is not loaded from the storage
      await expect(waitForNextUpdate()).rejects.toThrow();

      expect(toast.error).not.toBeCalled();
      expect(result.current.isInitialized).toBe(true);
      expect(result.current.data).toBe('Test from pub-sub event');
    });

    it('should be initialized from a pub-sub event after it is failed to be initialized from the initial loading', async () => {
      jest.spyOn(storage, 'getItem').mockRejectedValue(new Error('Test'));

      const { waitForNextUpdate, result } = renderHook(() => useFromStorage({ storage }));

      // Update should never happen as data is not loaded from the storage
      await expect(waitForNextUpdate()).rejects.toThrow();

      act(() => {
        storage.setItem('Test from pub-sub event');
      });

      expect(toast.error).toBeCalledWith('Could not load initial data from test storage, error: Test');
      expect(result.current.data).toBe('Test from pub-sub event');
      expect(result.current.isInitialized).toBe(true);
    });
  });

  describe('Use from a storage', () => {
    it('should use data from a pub-sub event', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useFromStorage({ storage }));

      // Wait until the initial data is loaded
      await waitForNextUpdate();

      await act(async () => {
        await delay(5);
        await storage.setItem('Test 2');
      });

      expect(result.current.data).toEqual('Test 2');
    });

    it('should use data from the latest pub-sub event if they happen multiple times in a row', async () => {
      const { result } = renderHook(() => useFromStorage({ storage }));

      // This triggers the storage's change event and this should win the race
      act(() => {
        storage.setItem('Test 1');
        storage.setItem('Test 2');
        storage.setItem('Test 3');
      });

      expect(result.current.data).toEqual('Test 3');
    });
  });
});
