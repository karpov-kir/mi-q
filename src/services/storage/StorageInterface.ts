import { PubSubEvent } from '../pubSub/PubSubInterface';

export interface SetItemOptions {
  isSilent?: boolean;
}

export interface StorageInterface<T> {
  readonly changeEvent: PubSubEvent<T>;
  readonly outsideChangeEvent: PubSubEvent<T>;
  readonly key: string;
  readonly defaultValue?: T;

  setItem(data: T, options?: SetItemOptions): Promise<void>;
  getItem(): Promise<T>;
  removeItem(): Promise<void>;
}
