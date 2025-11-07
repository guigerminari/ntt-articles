import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../src/users/users.service';
import { User } from '../../src/users/entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import { USER_REPOSITORY } from '../../src/domain/users/user.repository.interface';
import { STORAGE_SERVICE } from '../../src/infrastructure/storage/storage.interface';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: any;
  let storageService: any;

  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword',
    permissionId: '1',
    permission: {
      id: '1',
      name: 'Admin',
      description: 'Admin permission',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockStorageService = {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    has: jest.fn(),
    setWithExpiry: jest.fn(),
    getWithExpiry: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
        {
          provide: STORAGE_SERVICE,
          useValue: mockStorageService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(USER_REPOSITORY);
    storageService = module.get(STORAGE_SERVICE);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        permissionId: '1',
      };

      mockUserRepository.create.mockResolvedValue(mockUser);
      mockStorageService.removeItem.mockReturnValue(undefined);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(userRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(storageService.removeItem).toHaveBeenCalledWith('users:all');
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [mockUser];
      mockStorageService.getWithExpiry.mockReturnValue(null);
      mockUserRepository.findAll.mockResolvedValue(users);
      mockStorageService.setWithExpiry.mockReturnValue(undefined);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(storageService.getWithExpiry).toHaveBeenCalledWith('users:all');
      expect(userRepository.findAll).toHaveBeenCalled();
      expect(storageService.setWithExpiry).toHaveBeenCalledWith('users:all', users, 5);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockStorageService.getWithExpiry.mockReturnValue(null);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockStorageService.setWithExpiry.mockReturnValue(undefined);

      const result = await service.findOne('1');

      expect(result).toEqual(mockUser);
      expect(storageService.getWithExpiry).toHaveBeenCalledWith('user:1');
      expect(userRepository.findOne).toHaveBeenCalledWith('1');
      expect(storageService.setWithExpiry).toHaveBeenCalledWith('user:1', mockUser, 5);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockStorageService.getWithExpiry.mockReturnValue(null);
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue(updatedUser);
      mockStorageService.removeItem.mockReturnValue(undefined);

      const result = await service.update('1', updateUserDto);

      expect(result.name).toBe('Updated Name');
      expect(userRepository.update).toHaveBeenCalledWith('1', updateUserDto);
      expect(storageService.removeItem).toHaveBeenCalledWith('user:1');
      expect(storageService.removeItem).toHaveBeenCalledWith('users:all');
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.remove.mockResolvedValue(undefined);
      mockStorageService.removeItem.mockReturnValue(undefined);

      await service.remove('1');

      expect(userRepository.remove).toHaveBeenCalledWith('1');
      expect(storageService.removeItem).toHaveBeenCalledWith('user:1');
      expect(storageService.removeItem).toHaveBeenCalledWith('users:all');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});
