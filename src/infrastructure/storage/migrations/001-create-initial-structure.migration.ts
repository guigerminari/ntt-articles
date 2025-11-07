import { IStorageMigration } from './storage-migration.interface';

export class CreateInitialStructureMigration implements IStorageMigration {
  name = 'CreateInitialStructure';
  version = 1;

  async up(storage: any): Promise<void> {
    // Criar estrutura inicial se não existir
    if (!storage.getItem('permissions')) {
      storage.setItem('permissions', []);
    }
    if (!storage.getItem('users')) {
      storage.setItem('users', []);
    }
    if (!storage.getItem('articles')) {
      storage.setItem('articles', []);
    }
    console.log('   Initial structure created');
  }

  async down(storage: any): Promise<void> {
    // Remover estrutura
    storage.removeItem('permissions');
    storage.removeItem('users');
    storage.removeItem('articles');
    console.log('   Initial structure removed');
  }
}
