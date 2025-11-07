import { IStorageMigration } from './storage-migration.interface';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

export class SeedRootUserMigration implements IStorageMigration {
  name = 'SeedRootUser';
  version = 3;

  async up(storage: any): Promise<void> {
    const permissions = storage.getItem('permissions') || [];
    const adminPermission = permissions.find((p: any) => p.name === 'Admin');

    if (!adminPermission) {
      throw new Error('Admin permission not found. Run SeedPermissions migration first.');
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const rootUser = {
      id: uuidv4(),
      name: 'Root Admin',
      email: 'root@ntt.com',
      password: hashedPassword,
      permissionId: adminPermission.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const users = storage.getItem('users') || [];
    users.push(rootUser);
    storage.setItem('users', users);
    console.log('   Root user created (root@ntt.com / admin123)');
  }

  async down(storage: any): Promise<void> {
    const users = storage.getItem('users') || [];
    const filteredUsers = users.filter((u: any) => u.email !== 'root@ntt.com');
    storage.setItem('users', filteredUsers);
    console.log('   Root user removed');
  }
}
