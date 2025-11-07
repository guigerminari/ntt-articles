import { Injectable } from '@nestjs/common';
import { IStorageService } from './storage.interface';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LocalStorageService implements IStorageService {
  private storage: Map<string, any> = new Map();
  private readonly storageFile: string;

  constructor() {
    // Simula localStorage usando arquivo JSON no servidor
    this.storageFile = path.join(process.cwd(), '.storage', 'local-storage.json');
    this.loadFromFile();
  }

  private loadFromFile(): void {
    try {
      const dir = path.dirname(this.storageFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(this.storageFile)) {
        const data = fs.readFileSync(this.storageFile, 'utf-8');
        const parsed = JSON.parse(data);
        this.storage = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.warn('Failed to load storage from file:', error);
    }
  }

  private saveToFile(): void {
    try {
      const obj = Object.fromEntries(this.storage);
      fs.writeFileSync(this.storageFile, JSON.stringify(obj, null, 2));
    } catch (error) {
      console.error('Failed to save storage to file:', error);
    }
  }

  setItem<T>(key: string, value: T): void {
    this.storage.set(key, value);
    this.saveToFile();
  }

  getItem<T>(key: string): T | null {
    return this.storage.has(key) ? (this.storage.get(key) as T) : null;
  }

  removeItem(key: string): void {
    this.storage.delete(key);
    this.saveToFile();
  }

  clear(): void {
    this.storage.clear();
    this.saveToFile();
  }

  has(key: string): boolean {
    return this.storage.has(key);
  }

  // Métodos úteis para cache
  setWithExpiry<T>(key: string, value: T, ttlMinutes: number): void {
    const expiry = Date.now() + ttlMinutes * 60 * 1000;
    this.setItem(key, { value, expiry });
  }

  getWithExpiry<T>(key: string): T | null {
    const item = this.getItem<{ value: T; expiry: number }>(key);
    
    if (!item) {
      return null;
    }

    if (Date.now() > item.expiry) {
      this.removeItem(key);
      return null;
    }

    return item.value;
  }
}
