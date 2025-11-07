import { Injectable, Inject } from '@nestjs/common';
import { Permission } from '../../permissions/entities/permission.entity';
import { IPermissionRepository } from '../../domain/permissions/permission.repository.interface';
import { IStorageService, STORAGE_SERVICE } from '../storage/storage.interface';

@Injectable()
export class PermissionStorageRepository implements IPermissionRepository {
  private readonly STORAGE_KEY = 'permissions';

  constructor(
    @Inject(STORAGE_SERVICE)
    private readonly storage: IStorageService,
  ) {}

  private getAll(): Permission[] {
    return this.storage.getItem<Permission[]>(this.STORAGE_KEY) || [];
  }

  async findAll(): Promise<Permission[]> {
    return this.getAll();
  }

  async findByName(name: string): Promise<Permission | null> {
    const permissions = this.getAll();
    return permissions.find(p => p.name === name) || null;
  }
}
