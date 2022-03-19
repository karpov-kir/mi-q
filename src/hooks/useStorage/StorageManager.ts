import toast from 'react-hot-toast';

import { NotFoundError } from '../../errors';
import { PubSub, SetItemOptions, StorageInterface } from '../../services';

export interface StorageManagerEvent<StorageData> {
  data?: StorageData;
  error?: Error;
  isInitialized: boolean;
  // We can track when the payload (data, error, and initialization flag) is changed, so we can change a primitive
  // value, which is much faster to compare to detect whether there is a change or not.
  // Whenever the payload is changed this index is increased.
  payloadIndex: number;
}

// Takes care of loading the data from the storage initially or using the latest change event in case if by
// any chance the user is changed the data on a different tab while the initial data was loading.
export class StorageManager<StorageData> {
  public data?: StorageData;
  public isInitialized = false;
  public error?: Error;
  public payloadIndex = 0;

  private readonly dataPubSub = new PubSub<StorageManagerEvent<StorageData>>();
  public readonly dataEvent = {
    subscribe: (subscriber: (data: StorageManagerEvent<StorageData>) => void) => {
      this.dataPubSub.event.subscribe(subscriber);

      // Fire the event for new subscribers, so they are able to initialize the data. Without this
      // there is a possibility of the following sequence:
      // - the `useStorage` hook begins
      // - the manager starts to initialize the data (inside `registerStorageManagerForStorage`) in background
      // - the initial data is set to undefined for now (because the actual data is loading in the background)
      // - the data is loaded and initialized
      // - the use effect that should subscribe to new changes is executed (it can be executed after the initial data
      //   is loaded because the data is loaded very quickly from the local storage)
      //    - without the logic below this use effect never receives the data as the data was initialized before
      //      the use effect is subscribed to new changes
      if (this.isInitialized) {
        subscriber(this.getManagerEvent());
      }
    },

    unsubscribe: (subscriber: (data: StorageManagerEvent<StorageData>) => void) => {
      this.dataPubSub.event.unsubscribe(subscriber);
    },
  };

  private storage: StorageInterface<StorageData>;
  private ignoreInitialLoadFromStorage = false;

  constructor(storage: StorageInterface<StorageData>) {
    this.storage = storage;
  }

  public init() {
    // Subscribe to future updates in case if something is changed on a different browser tab or if a storage
    // is used directly to update a value.
    this.storage.changeEvent.subscribe((data) => this.handleStorageChange(data));
    this.loadInitialData().catch(() => void 0);
  }

  public destroy() {
    this.storage.changeEvent.unsubscribe(this.handleStorageChange);

    if (this.dataPubSub.subscriberCount) {
      throw new Error('Orphan subscribers detected while destroying a storage manager instance');
    }
  }

  public getManagerEvent(): StorageManagerEvent<StorageData> {
    return {
      isInitialized: this.isInitialized,
      data: this.data,
      error: this.error,
      payloadIndex: this.payloadIndex,
    };
  }

  private publishUpdates() {
    this.dataPubSub.publish(this.getManagerEvent());
  }

  private handleStorageChange(data: StorageData) {
    // When something is changed in the storage this has more priority than the initial loading
    // because the user might have changed something on another browser tab.
    this.isInitialized = true;
    this.error = undefined;
    this.data = data;
    this.payloadIndex++;

    this.publishUpdates();
  }

  // Use `this.data` when this is resolved to get the most recent data
  private async loadInitialData(): Promise<void> {
    this.storage
      .getItem()
      .then((data) => {
        // Respect the case when something has been changed outside after the initial data loading
        if (this.isInitialized) {
          return;
        }

        this.isInitialized = true;
        this.data = data;
        this.payloadIndex++;

        this.publishUpdates();
      })
      .catch((error) => {
        if (this.isInitialized) {
          return;
        }

        this.isInitialized = true;
        this.error = error instanceof NotFoundError ? undefined : error;
        this.payloadIndex++;

        this.publishUpdates();
      });
  }

  public setData(data: StorageData, options: SetItemOptions = {}) {
    if (!this.isInitialized) {
      throw new Error(`Cannot set data to the ${this.storage.key} storage until it is not initialized`);
    }

    // It will fire `dataEvent` using `publishUpdates` in `handleStorageChange`
    this.storage.setItem(data, options).catch((error: Error) => {
      console.error(`Could not save data to ${this.storage.key} storage`, error);
      toast.error(
        `Could not save data to ${this.storage.key} storage, error: ${error.message}. Data will be lost on page reloading.`,
      );
    });
  }
}
