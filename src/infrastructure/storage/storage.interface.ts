export interface IStorageService {
  setItem<T>(key: string, value: T): void;
  getItem<T>(key: string): T | null;
  removeItem(key: string): void;
  clear(): void;
  has(key: string): boolean;
  setWithExpiry<T>(key: string, value: T, ttlMinutes: number): void;
  getWithExpiry<T>(key: string): T | null;
}

export const STORAGE_SERVICE = Symbol('IStorageService');
