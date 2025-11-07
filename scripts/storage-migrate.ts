import { LocalStorageService } from '../src/infrastructure/storage/local-storage.service';
import { StorageMigrationService } from '../src/infrastructure/storage/migrations/storage-migration.service';
import { CreateInitialStructureMigration } from '../src/infrastructure/storage/migrations/001-create-initial-structure.migration';
import { SeedPermissionsMigration } from '../src/infrastructure/storage/migrations/002-seed-permissions.migration';
import { SeedRootUserMigration } from '../src/infrastructure/storage/migrations/003-seed-root-user.migration';

async function main() {
  const storage = new LocalStorageService();
  const migrationService = new StorageMigrationService();

  // Registrar migrations
  migrationService.registerMigration(new CreateInitialStructureMigration());
  migrationService.registerMigration(new SeedPermissionsMigration());
  migrationService.registerMigration(new SeedRootUserMigration());

  const command = process.argv[2];

  if (command === 'run') {
    console.log('🔄 Running LocalStorage migrations...\n');
    await migrationService.runPendingMigrations(storage);
    console.log('\n🎉 All migrations completed!');
    console.log('📁 Data saved to: .storage/local-storage.json');
  } else if (command === 'rollback') {
    console.log('⏪ Rolling back last migration...\n');
    await migrationService.rollback(storage);
    console.log('\n✅ Rollback completed!');
  } else {
    console.log('Usage:');
    console.log('  npm run storage:migrate     - Run pending migrations');
    console.log('  npm run storage:rollback    - Rollback last migration');
  }
}

main().catch(console.error);
