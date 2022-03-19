import { NotFoundError } from '../../errors';
import { mockLocalStorage } from '../../testUtils';
import { PersistedStorage } from './PersistedStorage';

mockLocalStorage();

const localStorageGetSpy = jest.spyOn(window.localStorage, 'getItem');
const localStorageSetSpy = jest.spyOn(window.localStorage, 'setItem');
const localStorageRemoveSpy = jest.spyOn(window.localStorage, 'removeItem');
const testKey = 'test';
const testKeyWithNameSpace = 'ps:test';
const testItem = {
  testKey: 'testValue',
};

describe(PersistedStorage, () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get an item from storage', async () => {
    localStorageGetSpy.mockReturnValueOnce(JSON.stringify(testItem));

    const persistedStorage = new PersistedStorage<typeof testItem>(testKey, undefined);

    await expect(persistedStorage.getItem()).resolves.toEqual(testItem);
  });

  it('should return a default value if it is set and an item is not found', async () => {
    const persistedStorage = new PersistedStorage<typeof testItem>(testKey, {
      testKey: 'default test value',
    });

    await expect(persistedStorage.getItem()).resolves.toEqual({
      ...testItem,
      testKey: 'default test value',
    });
  });

  it('should throw a not found error if an item is not found', async () => {
    const persistedStorage = new PersistedStorage<typeof testItem>(testKey, undefined);

    await expect(persistedStorage.getItem()).rejects.toThrow(new NotFoundError('Item not found'));
  });

  it('should set an item', async () => {
    const persistedStorage = new PersistedStorage<typeof testItem>(testKey, undefined);

    await persistedStorage.setItem(testItem);

    expect(localStorageSetSpy).toBeCalledWith(testKeyWithNameSpace, JSON.stringify(testItem));
  });

  it('should remove an item', async () => {
    const persistedStorage = new PersistedStorage<typeof testItem>(testKey, undefined);

    await persistedStorage.removeItem();

    expect(localStorageRemoveSpy).toBeCalledWith(testKeyWithNameSpace);
  });

  it('should notify when an item is changed internally', async () => {
    const persistedStorage = new PersistedStorage<typeof testItem>(testKey, undefined);
    const mockedSubscriber = jest.fn();

    persistedStorage.changeEvent.subscribe(mockedSubscriber);

    await persistedStorage.setItem(testItem);

    persistedStorage.changeEvent.unsubscribe(mockedSubscriber);

    await persistedStorage.setItem({
      ...testItem,
      testKey: 'new test value',
    });

    expect(mockedSubscriber).toBeCalledTimes(1);
    expect(mockedSubscriber).toBeCalledWith({ testKey: 'testValue' });
  });

  it('should notify when an item is changed externally', async () => {
    const mockedSubscriber = jest.fn();
    const persistedStorage = new PersistedStorage<typeof testItem>(testKey, undefined);

    await persistedStorage.setItem(testItem);

    persistedStorage.outsideChangeEvent.subscribe(mockedSubscriber);

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: testKeyWithNameSpace,
        newValue: JSON.stringify({
          ...testItem,
          testKey: 'new test key 1',
        }),
      }),
    );

    persistedStorage.outsideChangeEvent.unsubscribe(mockedSubscriber);

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: testKeyWithNameSpace,
        newValue: JSON.stringify({
          ...testItem,
          testKey: 'new test key 2',
        }),
      }),
    );

    expect(mockedSubscriber).toBeCalledTimes(1);
    expect(mockedSubscriber).toBeCalledWith({ testKey: 'new test key 1' });
  });

  it('should not notify when an item is changed to undefined externally', async () => {
    const mockedSubscriber = jest.fn();
    const persistedStorage = new PersistedStorage<typeof testItem>(testKey, undefined);

    await persistedStorage.setItem(testItem);

    persistedStorage.outsideChangeEvent.subscribe(mockedSubscriber);

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: testKeyWithNameSpace,
        newValue: undefined,
      }),
    );

    persistedStorage.outsideChangeEvent.unsubscribe(mockedSubscriber);

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: testKeyWithNameSpace,
        newValue: JSON.stringify({
          ...testItem,
          testKey: 'new test key 1',
        }),
      }),
    );

    expect(mockedSubscriber).toBeCalledTimes(0);
  });

  it('should notify with a default value if it is set and when an item is changed externally', async () => {
    const mockedSubscriber = jest.fn();
    const persistedStorage = new PersistedStorage<typeof testItem>(testKey, testItem);

    persistedStorage.outsideChangeEvent.subscribe(mockedSubscriber);

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: testKeyWithNameSpace,
        newValue: undefined,
      }),
    );

    persistedStorage.outsideChangeEvent.unsubscribe(mockedSubscriber);

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: testKeyWithNameSpace,
        newValue: JSON.stringify({
          ...testItem,
          testKey: 'new test key 1',
        }),
      }),
    );

    expect(mockedSubscriber).toBeCalledTimes(1);
    expect(mockedSubscriber).toBeCalledWith(testItem);
  });
});
