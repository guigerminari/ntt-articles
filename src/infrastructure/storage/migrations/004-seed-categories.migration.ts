import { IStorageMigration } from './storage-migration.interface';

export class SeedCategoriesMigration implements IStorageMigration {
  name = 'SeedCategories';
  version = 4;

  async up(storage: any): Promise<void> {
    const categories = [
      {
        id: '00000000-0000-0000-0000-000000000020',
        name: 'Tecnologia',
        description: 'Artigos sobre tecnologia, inovação e desenvolvimento',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '00000000-0000-0000-0000-000000000021',
        name: 'Negócios',
        description: 'Artigos sobre negócios, empreendedorismo e gestão',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '00000000-0000-0000-0000-000000000022',
        name: 'Geral',
        description: 'Artigos de interesse geral e diversos',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    storage.setItem('categories', categories);
    console.log('   Default categories created (Tecnologia, Negócios, Geral)');
  }

  async down(storage: any): Promise<void> {
    storage.setItem('categories', []);
    console.log('   Categories removed');
  }
}
