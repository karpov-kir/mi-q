import { PubSubInterface } from './PubSubInterface';

export class PubSub<T> implements PubSubInterface<T> {
  private readonly subscribers = new Set<(data: T) => void>();

  public readonly event = {
    subscribe: (subscriber: (data: T) => void) => this.subscribe(subscriber),
    unsubscribe: (subscriber: (data: T) => void) => this.unsubscribe(subscriber),
  };

  public publish(data: T) {
    this.subscribers.forEach((subscriber) => subscriber(data));
  }

  public get subscriberCount() {
    return this.subscribers.size;
  }

  private subscribe(subscriber: (data: T) => void) {
    if (this.subscribers.has(subscriber)) {
      throw new Error('Provided subscriber is already subscribed');
    }

    this.subscribers.add(subscriber);
  }

  private unsubscribe(subscriber: (data: T) => void) {
    this.subscribers.delete(subscriber);
  }
}
