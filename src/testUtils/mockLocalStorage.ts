class SimpleLocalStorageMock {
  private storage: { [key: string]: string } = {};

  getItem(key: string) {
    return this.storage[key];
  }

  setItem(key: string, value: string) {
    this.storage[key] = value;
  }

  clear() {
    this.storage = {};
  }

  removeItem(key: string) {
    delete this.storage[key];
  }

  clearStorage() {
    this.storage = {};
  }
}

export function mockLocalStorage() {
  const simpleStorage = new SimpleLocalStorageMock();

  Object.defineProperty(window, 'localStorage', {
    value: simpleStorage,
  });

  return {
    clearLocalStorage: () => simpleStorage.clearStorage(),
  };
}
