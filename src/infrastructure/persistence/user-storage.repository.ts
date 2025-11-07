import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { UpdateUserDto } from '../../users/dto/update-user.dto';
import { IUserRepository } from '../../domain/users/user.repository.interface';
import { IStorageService, STORAGE_SERVICE } from '../storage/storage.interface';
import { Permission } from '../../permissions/entities/permission.entity';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserStorageRepository implements IUserRepository {
  private readonly STORAGE_KEY = 'users';
  private readonly PERMISSIONS_KEY = 'permissions';

  constructor(
    @Inject(STORAGE_SERVICE)
    private readonly storage: IStorageService,
  ) {}

  private getAll(): User[] {
    return this.storage.getItem<User[]>(this.STORAGE_KEY) || [];
  }

  private saveAll(users: User[]): void {
    this.storage.setItem(this.STORAGE_KEY, users);
  }

  private getAllPermissions(): Permission[] {
    return this.storage.getItem<Permission[]>(this.PERMISSIONS_KEY) || [];
  }

  private attachPermission(user: User): User {
    const permissions = this.getAllPermissions();
    const permission = permissions.find(p => p.id === user.permissionId);
    
    if (permission) {
      user.permission = permission;
    }
    
    return user;
  }

  private attachPermissions(users: User[]): User[] {
    return users.map(user => this.attachPermission(user));
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const users = this.getAll();
    
    const existingUser = users.find(u => u.email === createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    const user: User = {
      id: uuidv4(),
      name: createUserDto.name,
      email: createUserDto.email,
      password: hashedPassword,
      permissionId: createUserDto.permissionId,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;

    users.push(user);
    this.saveAll(users);

    return user;
  }

  async findAll(): Promise<User[]> {
    const users = this.getAll();
    return this.attachPermissions(users);
  }

  async findOne(id: string): Promise<User | null> {
    const users = this.getAll();
    const user = users.find(u => u.id === id);
    return user ? this.attachPermission(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const users = this.getAll();
    const user = users.find(u => u.email === email);
    return user ? this.attachPermission(user) : null;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const users = this.getAll();
    const index = users.findIndex(u => u.id === id);
    
    if (index === -1) {
      return null;
    }

    if (updateUserDto.email) {
      const existingUser = users.find(u => u.email === updateUserDto.email && u.id !== id);
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    const updateData: any = { ...updateUserDto };
    
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    users[index] = {
      ...users[index],
      ...updateData,
      updatedAt: new Date(),
    };

    this.saveAll(users);
    return this.attachPermission(users[index]);
  }

  async remove(id: string): Promise<void> {
    const users = this.getAll();
    const filtered = users.filter(u => u.id !== id);
    this.saveAll(filtered);
  }
}
