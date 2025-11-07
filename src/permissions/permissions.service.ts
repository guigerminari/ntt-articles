import { Injectable, Inject } from '@nestjs/common';
import { Permission } from './entities/permission.entity';
import { IPermissionRepository, PERMISSION_REPOSITORY } from '../domain/permissions/permission.repository.interface';
import { IStorageService, STORAGE_SERVICE } from '../infrastructure/storage/storage.interface';

@Injectable()
export class PermissionsService {
  private readonly CACHE_TTL = 30; // 30 minutos (permissões mudam raramente)

  constructor(
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: IPermissionRepository,
    @Inject(STORAGE_SERVICE)
    private readonly storageService: IStorageService,
  ) {}

  async findByName(name: string): Promise<Permission> {
    // Cache individual por nome
    const cacheKey = `permission:${name}`;
    const cached = this.storageService.getWithExpiry<Permission>(cacheKey);
    if (cached) {
      return cached;
    }

    const permission = await this.permissionRepository.findByName(name);
    
    if (permission) {
      this.storageService.setWithExpiry(cacheKey, permission, this.CACHE_TTL);
    }
    
    return permission;
  }

  async findAll(): Promise<Permission[]> {
    // Cache da lista completa
    const cached = this.storageService.getWithExpiry<Permission[]>('permissions:all');
    if (cached) {
      return cached;
    }

    const permissions = await this.permissionRepository.findAll();
    
    this.storageService.setWithExpiry('permissions:all', permissions, this.CACHE_TTL);
    
    return permissions;
  }
}
