import { Module, Global, OnModuleInit, Inject } from '@nestjs/common';
import { LocalStorageService } from './local-storage.service';
import { STORAGE_SERVICE } from './storage.interface';
import { StorageMigrationService } from './migrations/storage-migration.service';
import { CreateInitialStructureMigration } from './migrations/001-create-initial-structure.migration';
import { SeedPermissionsMigration } from './migrations/002-seed-permissions.migration';
import { SeedRootUserMigration } from './migrations/003-seed-root-user.migration';
import { SeedCategoriesMigration } from './migrations/004-seed-categories.migration';

@Global()
@Module({
  providers: [
    {
      provide: STORAGE_SERVICE,
      useClass: LocalStorageService,
    },
    StorageMigrationService,
  ],
  exports: [STORAGE_SERVICE],
})
export class StorageModule implements OnModuleInit {
  constructor(
    private readonly migrationService: StorageMigrationService,
    @Inject(STORAGE_SERVICE) private readonly storageService: LocalStorageService,
  ) {}

  async onModuleInit() {
    // Registrar migrations
    this.migrationService.registerMigration(new CreateInitialStructureMigration());
    this.migrationService.registerMigration(new SeedPermissionsMigration());
    this.migrationService.registerMigration(new SeedRootUserMigration());
    this.migrationService.registerMigration(new SeedCategoriesMigration());

    // Executar migrations pendentes automaticamente
    await this.migrationService.runPendingMigrations(this.storageService);
  }
}
