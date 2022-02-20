export interface AsyncCacheInterface<T> {
  readonly defaultValue?: T;
  getItem: () => Promise<T>;
  setSource: (getItem: () => Promise<T>) => void;
  removeItem: () => Promise<void>;
}
