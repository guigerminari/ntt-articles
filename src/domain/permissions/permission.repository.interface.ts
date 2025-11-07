import { Permission } from '../../permissions/entities/permission.entity';

export interface IPermissionRepository {
  findAll(): Promise<Permission[]>;
  findByName(name: string): Promise<Permission | null>;
}

export const PERMISSION_REPOSITORY = Symbol('IPermissionRepository');
