import dataSource from '../../config/typeorm.config';
import { Permission } from '../../permissions/entities/permission.entity';
import { User } from '../../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function runSeed() {
  try {
    await dataSource.initialize();
    console.log('Data Source initialized');

    const permissionRepository = dataSource.getRepository(Permission);
    const userRepository = dataSource.getRepository(User);

    // Create permissions
    const permissions = [
      {
        name: 'Admin',
        description: 'Full access to manage articles and users',
      },
      {
        name: 'Editor',
        description: 'Access to manage articles',
      },
      {
        name: 'Reader',
        description: 'Access to read articles only',
      },
    ];

    console.log('Creating permissions...');
    for (const permData of permissions) {
      const existingPerm = await permissionRepository.findOne({
        where: { name: permData.name },
      });

      if (!existingPerm) {
        const permission = permissionRepository.create(permData);
        await permissionRepository.save(permission);
        console.log(`Permission '${permData.name}' created`);
      } else {
        console.log(`Permission '${permData.name}' already exists`);
      }
    }

    // Create root user (Admin)
    const adminPermission = await permissionRepository.findOne({
      where: { name: 'Admin' },
    });

    const existingRoot = await userRepository.findOne({
      where: { email: 'root@ntt.com' },
    });

    if (!existingRoot && adminPermission) {
      const hashedPassword = await bcrypt.hash('rootpassword', 10);
      const rootUser = userRepository.create({
        name: 'Root User',
        email: 'root@ntt.com',
        password: hashedPassword,
        permissionId: adminPermission.id,
      });

      await userRepository.save(rootUser);
      console.log('Root user created (email: root@ntt.com, password: rootpassword)');
    } else {
      console.log('Root user already exists');
    }

    console.log('Seeding completed successfully!');
    await dataSource.destroy();
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

runSeed();
