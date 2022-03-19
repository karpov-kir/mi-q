import { mockLocalStorage } from '../../testUtils';
import { PersistedStorage } from '../storage';
import { AsyncCache } from './AsyncCache';

const { clearLocalStorage } = mockLocalStorage();

const defaultTtl = 100;
const testItem = {
  testValue: 'testKey',
};

describe(AsyncCache, () => {
  beforeEach(() => {
    clearLocalStorage();
  });

  it('should get an item', async () => {
    const asyncCache = new AsyncCache<typeof testItem>(defaultTtl, new PersistedStorage('test'));

    asyncCache.setSource(async () => testItem);

    await expect(asyncCache.getItem()).resolves.toEqual(testItem);
  });

  it('it should throw an error if a source is not set', async () => {
    const asyncCache = new AsyncCache<typeof testItem>(defaultTtl, new PersistedStorage('test'));

    await expect(asyncCache.getItem()).rejects.toEqual(new Error('Source is not defined'));
  });

  it('it should throw an error if a source throws an error', async () => {
    const asyncCache = new AsyncCache<typeof testItem>(defaultTtl, new PersistedStorage('test'));

    asyncCache.setSource(async () => {
      throw new Error('Test');
    });

    await expect(asyncCache.getItem()).rejects.toEqual(new Error('Test'));
  });

  it('should call a source only once within TTL', async () => {
    const asyncCache = new AsyncCache<typeof testItem>(defaultTtl, new PersistedStorage('test'));
    const mockedSource = jest.fn().mockResolvedValue(testItem);

    asyncCache.setSource(mockedSource);

    await asyncCache.getItem();
    await asyncCache.getItem();

    expect(mockedSource).toBeCalledTimes(1);
  });

  it('should call a source again when TTL expires', async () => {
    const ttt = 1;
    const asyncCache = new AsyncCache<typeof testItem>(ttt, new PersistedStorage('test'));
    const mockedSource = jest.fn().mockResolvedValue(testItem);

    asyncCache.setSource(mockedSource);

    await asyncCache.getItem();
    const currentNow = Date.now();
    jest.spyOn(Date, 'now').mockReturnValueOnce(currentNow + ttt + 1);
    await asyncCache.getItem();

    expect(mockedSource).toBeCalledTimes(2);
  });

  it('it should remove an item', async () => {
    const asyncCache = new AsyncCache<typeof testItem>(defaultTtl, new PersistedStorage('test'));
    const mockedSource = jest.fn().mockResolvedValue(testItem);

    asyncCache.setSource(mockedSource);

    await asyncCache.getItem();
    await asyncCache.removeItem();
    await asyncCache.getItem();

    // The source should be called 2 times as the item is removed
    // right after it is set and then the item is requested one more time.
    // So, if the time is removed correctly as the second step, then 2 source calls are expected.
    expect(mockedSource).toBeCalledTimes(2);
  });

  it('should return a default value if it is set and a source is not reachable', async () => {
    const asyncCache = new AsyncCache<typeof testItem>(defaultTtl, new PersistedStorage('test'), testItem);

    asyncCache.setSource(async () => {
      throw new Error('Test');
    });

    await expect(asyncCache.getItem()).resolves.toEqual(testItem);
  });

  it('should throw an error if a default value is set but a source is not set', async () => {
    const asyncCache = new AsyncCache<typeof testItem>(defaultTtl, new PersistedStorage('test'), testItem);

    await expect(asyncCache.getItem()).rejects.toEqual(new Error('Source is not defined'));
  });
});
