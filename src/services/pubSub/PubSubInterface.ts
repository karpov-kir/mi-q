export interface PubSubEvent<T> {
  subscribe(subscriber: (data: T) => void): void;
  unsubscribe(subscriber: (data: T) => void): void;
}

export interface PubSubInterface<T> {
  readonly event: PubSubEvent<T>;
  readonly subscriberCount: number;
  publish(data: T): void;
}
