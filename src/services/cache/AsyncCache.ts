import { NotFoundError } from '../../errors';
import { StorageInterface } from '../storage';
import { AsyncCacheInterface } from './AsyncCacheInterface';

export interface CachedItem<T> {
  // Timestamp
  createdAt: number;
  data: T;
}

export class ExpiredError extends Error {
  constructor(message = 'Expired') {
    super(message);

    // To make `instanceOf ExpiredError` work
    // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, ExpiredError.prototype);
  }
}

export class AsyncCache<T> implements AsyncCacheInterface<T> {
  private source: undefined | (() => Promise<T>) = undefined;
  private storage: StorageInterface<CachedItem<T>>;
  // In milliseconds
  private readonly getTtl: () => number;

  public readonly defaultValue?: T;

  constructor(ttl: number | (() => number), storage: StorageInterface<CachedItem<T>>, defaultValue?: T) {
    if (ttl < 0) {
      throw new Error('Invalid TTL');
    }

    this.defaultValue = defaultValue;
    this.storage = storage;
    this.getTtl = typeof ttl === 'function' ? ttl : () => ttl;
  }

  public setSource(getItem: () => Promise<T>) {
    this.source = getItem;
  }

  public async getItem() {
    const dataFromCache = await this.getDataFromCache();

    if (dataFromCache) {
      return dataFromCache;
    }

    const dataFromSource = await this.getDataFromSource();

    await this.cacheData(dataFromSource);

    return dataFromSource;
  }

  private async getDataFromCache() {
    try {
      const { createdAt, data } = await this.storage.getItem();
      const liveTime = Date.now() - createdAt;

      if (liveTime > this.getTtl()) {
        return undefined;
      }

      return data;
    } catch (error) {
      // TODO cover with unit test
      if (error instanceof NotFoundError) {
        return;
      }

      throw error;
    }
  }

  private async getDataFromSource() {
    if (!this.source) {
      throw new Error('Source is not defined');
    }

    let data;

    try {
      data = await this.source();
    } catch (error) {
      console.warn(`Could not load data from source (re. ${this.storage.key})`);
      if (this.defaultValue != null) {
        data = this.defaultValue;
      } else {
        throw error;
      }
    }

    return data;
  }

  private async cacheData(data: T) {
    const cachedItem: CachedItem<T> = {
      data,
      createdAt: Date.now(),
    };

    await this.storage.setItem(cachedItem);

    return data;
  }

  public async removeItem() {
    await this.storage.removeItem();
  }
}
