import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { IUserRepository, USER_REPOSITORY } from '../domain/users/user.repository.interface';
import { IStorageService, STORAGE_SERVICE } from '../infrastructure/storage/storage.interface';

@Injectable()
export class UsersService {
  private readonly CACHE_PREFIX = 'user:';
  private readonly CACHE_TTL = 5; // 5 minutos

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(STORAGE_SERVICE)
    private readonly storageService: IStorageService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.userRepository.create(createUserDto);
    
    // Invalidar cache da lista
    this.storageService.removeItem('users:all');
    
    return user;
  }

  async findAll(): Promise<User[]> {
    // Tentar buscar do cache
    const cached = this.storageService.getWithExpiry<User[]>('users:all');
    if (cached) {
      return cached;
    }

    const users = await this.userRepository.findAll();
    
    // Salvar no cache
    this.storageService.setWithExpiry('users:all', users, this.CACHE_TTL);
    
    return users;
  }

  async findOne(id: string): Promise<User> {
    // Tentar buscar do cache
    const cacheKey = `${this.CACHE_PREFIX}${id}`;
    const cached = this.storageService.getWithExpiry<User>(cacheKey);
    if (cached) {
      return cached;
    }

    const user = await this.userRepository.findOne(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Salvar no cache
    this.storageService.setWithExpiry(cacheKey, user, this.CACHE_TTL);

    return user;
  }

  async findMe(userId: string): Promise<User> {
    return this.findOne(userId);
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findByEmail(email);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const exists = await this.userRepository.findOne(id);
    if (!exists) {
      throw new NotFoundException('User not found');
    }

    const user = await this.userRepository.update(id, updateUserDto);
    
    // Invalidar caches
    this.storageService.removeItem(`${this.CACHE_PREFIX}${id}`);
    this.storageService.removeItem('users:all');
    
    return user;
  }

  async remove(id: string): Promise<void> {
    const exists = await this.userRepository.findOne(id);
    if (!exists) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.remove(id);
    
    // Invalidar caches
    this.storageService.removeItem(`${this.CACHE_PREFIX}${id}`);
    this.storageService.removeItem('users:all');
  }
}
