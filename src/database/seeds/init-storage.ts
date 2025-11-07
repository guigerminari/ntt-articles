import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { IStorageService, STORAGE_SERVICE } from '../../infrastructure/storage/storage.interface';
import { Permission } from '../../permissions/entities/permission.entity';
import { User } from '../../users/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const storage = app.get<IStorageService>(STORAGE_SERVICE);

  console.log('🚀 Initializing storage database...\n');

  // Criar permissões
  const permissions: Permission[] = [
    {
      id: uuidv4(),
      name: 'Admin',
      description: 'Full access to manage articles and users',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Permission,
    {
      id: uuidv4(),
      name: 'Editor',
      description: 'Access to manage articles',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Permission,
    {
      id: uuidv4(),
      name: 'Reader',
      description: 'Access to read articles only',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Permission,
  ];

  storage.setItem('permissions', permissions);
  console.log('✅ Created permissions:', permissions.map(p => p.name).join(', '));

  // Criar usuário root
  const adminPermission = permissions.find(p => p.name === 'Admin');
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const rootUser: User = {
    id: uuidv4(),
    name: 'Root Admin',
    email: 'root@ntt.com',
    password: hashedPassword,
    permissionId: adminPermission.id,
    permission: adminPermission,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  storage.setItem('users', [rootUser]);
  console.log('✅ Created root user:');
  console.log('   Email: root@ntt.com');
  console.log('   Password: admin123');
  console.log('   Permission: Admin\n');

  // Inicializar array vazio de artigos
  storage.setItem('articles', []);
  console.log('✅ Initialized articles storage\n');

  console.log('🎉 Storage database initialized successfully!');
  console.log('📁 Data saved to: .storage/local-storage.json\n');

  await app.close();
}

bootstrap().catch(err => {
  console.error('❌ Error initializing storage:', err);
  process.exit(1);
});
