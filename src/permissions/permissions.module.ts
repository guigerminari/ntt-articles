import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionStorageRepository } from '../infrastructure/persistence/permission-storage.repository';
import { PERMISSION_REPOSITORY } from '../domain/permissions/permission.repository.interface';

@Module({
  providers: [
    PermissionsService,
    {
      provide: PERMISSION_REPOSITORY,
      useClass: PermissionStorageRepository,
    },
  ],
  exports: [PermissionsService],
})
export class PermissionsModule {}
