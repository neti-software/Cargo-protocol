import { isEmpty } from 'lodash';

const APP_STORAGE_PREFIX = 'cargo';

export class PersistentStorage<T> {
  private readonly appKey: string;

  constructor(key: string) {
    this.appKey = this.createKey(key);
  }

  serialize = (data?: T) => {
    localStorage.setItem(this.appKey, JSON.stringify(data || ''));
  };

  deserialize = (): T | undefined => {
    const serializedData = localStorage.getItem(this.appKey) || undefined;
    if (!serializedData) {
      return undefined;
    }
    return JSON.parse(serializedData);
  };

  clear = () => {
    localStorage.removeItem(this.appKey);
  };

  private createKey = (key: string) => {
    return `${APP_STORAGE_PREFIX}.${key}`;
  };
}
