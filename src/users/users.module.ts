import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PermissionsModule } from '../permissions/permissions.module';
import { UserStorageRepository } from '../infrastructure/persistence/user-storage.repository';
import { USER_REPOSITORY } from '../domain/users/user.repository.interface';

@Module({
  imports: [PermissionsModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: USER_REPOSITORY,
      useClass: UserStorageRepository,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
