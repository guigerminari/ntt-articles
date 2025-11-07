import { Injectable } from '@nestjs/common';
import { IStorageMigration } from './storage-migration.interface';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageMigrationService {
  private readonly migrationsPath = path.join(process.cwd(), '.storage', 'migrations.json');
  private migrations: IStorageMigration[] = [];

  constructor() {
    this.ensureMigrationsFile();
  }

  private ensureMigrationsFile(): void {
    const dir = path.dirname(this.migrationsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.migrationsPath)) {
      fs.writeFileSync(this.migrationsPath, JSON.stringify({ executed: [] }, null, 2));
    }
  }

  registerMigration(migration: IStorageMigration): void {
    this.migrations.push(migration);
    this.migrations.sort((a, b) => a.version - b.version);
  }

  async runPendingMigrations(storage: any): Promise<void> {
    const executed = this.getExecutedMigrations();
    const pending = this.migrations.filter(m => !executed.includes(m.name));

    if (pending.length === 0) {
      console.log('No pending migrations');
      return;
    }

    for (const migration of pending) {
      console.log(`Running migration: ${migration.name}`);
      await migration.up(storage);
      this.markAsExecuted(migration.name);
      console.log(`✅ Migration ${migration.name} completed`);
    }
  }

  async rollback(storage: any): Promise<void> {
    const executed = this.getExecutedMigrations();
    if (executed.length === 0) {
      console.log('No migrations to rollback');
      return;
    }

    const lastMigration = executed[executed.length - 1];
    const migration = this.migrations.find(m => m.name === lastMigration);

    if (migration) {
      console.log(`Rolling back migration: ${migration.name}`);
      await migration.down(storage);
      this.removeFromExecuted(migration.name);
      console.log(`✅ Rollback of ${migration.name} completed`);
    }
  }

  private getExecutedMigrations(): string[] {
    const data = JSON.parse(fs.readFileSync(this.migrationsPath, 'utf-8'));
    return data.executed || [];
  }

  private markAsExecuted(name: string): void {
    const data = JSON.parse(fs.readFileSync(this.migrationsPath, 'utf-8'));
    data.executed.push(name);
    data.executed = [...new Set(data.executed)]; // Remove duplicates
    fs.writeFileSync(this.migrationsPath, JSON.stringify(data, null, 2));
  }

  private removeFromExecuted(name: string): void {
    const data = JSON.parse(fs.readFileSync(this.migrationsPath, 'utf-8'));
    data.executed = data.executed.filter((n: string) => n !== name);
    fs.writeFileSync(this.migrationsPath, JSON.stringify(data, null, 2));
  }
}
