import { IStorageMigration } from './storage-migration.interface';
import { v4 as uuidv4 } from 'uuid';

export class SeedPermissionsMigration implements IStorageMigration {
  name = 'SeedPermissions';
  version = 2;

  async up(storage: any): Promise<void> {
    const permissions = [
      {
        id: uuidv4(),
        name: 'Admin',
        description: 'Full access to manage articles and users',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: 'Editor',
        description: 'Can create and edit articles',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: 'Reader',
        description: 'Can only read articles',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    storage.setItem('permissions', permissions);
    console.log('   Permissions seeded (Admin, Editor, Reader)');
  }

  async down(storage: any): Promise<void> {
    storage.setItem('permissions', []);
    console.log('   Permissions removed');
  }
}
