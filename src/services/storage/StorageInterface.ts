import { PubSubEvent } from '../pubSub/PubSubInterface';

export interface StorageInterface<T> {
  readonly changeEvent: PubSubEvent<T>;
  readonly outsideChangeEvent: PubSubEvent<T>;
  readonly key: string;
  readonly defaultValue?: T;

  setItem(data: T): Promise<void>;
  getItem(): Promise<T>;
  removeItem(): Promise<void>;
}
