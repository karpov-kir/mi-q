import { NotFoundError } from '../../errors';
import { PubSub } from '../pubSub';
import { StorageInterface } from './StorageInterface';

// Only one storage per key. Storages are never deleted.
const outsideChangeListeners = new Map<
  string,
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    externalChangePubSub: PubSub<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    changePubSub: PubSub<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultValue: any;
  }
>();

window.addEventListener('storage', ({ key, newValue }: StorageEvent) => {
  if (!key) {
    return;
  }

  const pubSubs = outsideChangeListeners.get(key);

  if (!pubSubs) {
    return;
  }

  const { externalChangePubSub, changePubSub, defaultValue } = pubSubs;

  const valueToSet = newValue == undefined ? defaultValue : JSON.parse(newValue);

  if (valueToSet == undefined) {
    return;
  }

  externalChangePubSub.publish(valueToSet);
  changePubSub.publish(valueToSet);
});

// Once this https://github.com/Microsoft/TypeScript/issues/26242 is implemented we can leverage
// partial type argument inference to make the `DefaultValue` generic
// be automatically inferred from the `defaultValue` argument. It cannot be done now as
// the `Value` generic argument is required, so we always have to specify the `DefaultValue` argument if
// the `defaultValue` argument is not undefined (because partial type argument inference is not supported by TS).
export class PersistedStorage<Value, DefaultValue extends Value | undefined = undefined>
  implements StorageInterface<Value>
{
  public readonly key: string;
  public readonly defaultValue: DefaultValue;

  private static readonly takenKeys = new Set<string>();
  private static readonly namespace = 'ps';

  private readonly externalChangePubSub = new PubSub<Value>();
  private readonly changePubSub = new PubSub<Value>();

  public readonly outsideChangeEvent = this.externalChangePubSub.event;
  public readonly changeEvent = this.changePubSub.event;

  constructor(key: string, defaultValue: DefaultValue) {
    if (PersistedStorage.takenKeys.has(key)) {
      throw new Error('Key is already taken');
    }

    this.key = key;
    this.defaultValue = defaultValue;

    outsideChangeListeners.set(this.getStorageKey(), {
      externalChangePubSub: this.externalChangePubSub,
      // Includes internal and external changes
      changePubSub: this.changePubSub,
      defaultValue: this.defaultValue,
    });
  }

  public async getItem(): Promise<Value> {
    const item = localStorage.getItem(this.getStorageKey());

    if (!item) {
      if (this.defaultValue != undefined) {
        return this.defaultValue as Value;
      }

      throw new NotFoundError('Item not found');
    }

    return JSON.parse(item) as Value;
  }

  public async setItem(data: Value): Promise<void> {
    localStorage.setItem(this.getStorageKey(), JSON.stringify(data));

    this.changePubSub.publish(data);
  }

  public async removeItem(): Promise<void> {
    localStorage.removeItem(this.getStorageKey());
  }

  private getStorageKey() {
    return `${PersistedStorage.namespace}:${this.key}`;
  }
}
