import { IStorageMigration } from './storage-migration.interface';

export class SeedPermissionsMigration implements IStorageMigration {
  name = 'SeedPermissions';
  version = 2;

  async up(storage: any): Promise<void> {
    const permissions = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Admin',
        description: 'Full access to manage articles and users',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        name: 'Editor',
        description: 'Can create and edit articles',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '00000000-0000-0000-0000-000000000003',
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
