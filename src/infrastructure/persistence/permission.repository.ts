import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../../permissions/entities/permission.entity';
import { IPermissionRepository } from '../../domain/permissions/permission.repository.interface';

@Injectable()
export class PermissionRepository implements IPermissionRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly repository: Repository<Permission>,
  ) {}

  async findAll(): Promise<Permission[]> {
    return await this.repository.find();
  }

  async findByName(name: string): Promise<Permission | null> {
    return await this.repository.findOne({
      where: { name },
    });
  }
}
