import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsService } from '../../src/permissions/permissions.service';
import { Permission } from '../../src/permissions/entities/permission.entity';
import { PERMISSION_REPOSITORY } from '../../src/domain/permissions/permission.repository.interface';
import { STORAGE_SERVICE } from '../../src/infrastructure/storage/storage.interface';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let permissionRepository: any;
  let storageService: any;

  const mockPermission = {
    id: '1',
    name: 'Admin',
    description: 'Full access to manage articles and users',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPermissionRepository = {
    findAll: jest.fn(),
    findByName: jest.fn(),
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
        PermissionsService,
        {
          provide: PERMISSION_REPOSITORY,
          useValue: mockPermissionRepository,
        },
        {
          provide: STORAGE_SERVICE,
          useValue: mockStorageService,
        },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
    permissionRepository = module.get(PERMISSION_REPOSITORY);
    storageService = module.get(STORAGE_SERVICE);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByName', () => {
    it('should return a permission by name', async () => {
      mockStorageService.getWithExpiry.mockReturnValue(null);
      mockPermissionRepository.findByName.mockResolvedValue(mockPermission);
      mockStorageService.setWithExpiry.mockReturnValue(undefined);

      const result = await service.findByName('Admin');

      expect(result).toEqual(mockPermission);
      expect(storageService.getWithExpiry).toHaveBeenCalledWith('permission:Admin');
      expect(permissionRepository.findByName).toHaveBeenCalledWith('Admin');
      expect(storageService.setWithExpiry).toHaveBeenCalledWith('permission:Admin', mockPermission, 30);
    });

    it('should return null when permission not found', async () => {
      mockStorageService.getWithExpiry.mockReturnValue(null);
      mockPermissionRepository.findByName.mockResolvedValue(null);

      const result = await service.findByName('NonExistent');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return an array of permissions', async () => {
      const permissions = [
        mockPermission,
        {
          id: '2',
          name: 'Editor',
          description: 'Access to manage articles',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          name: 'Reader',
          description: 'Access to read articles only',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockStorageService.getWithExpiry.mockReturnValue(null);
      mockPermissionRepository.findAll.mockResolvedValue(permissions);
      mockStorageService.setWithExpiry.mockReturnValue(undefined);

      const result = await service.findAll();

      expect(result).toEqual(permissions);
      expect(result).toHaveLength(3);
      expect(storageService.getWithExpiry).toHaveBeenCalledWith('permissions:all');
      expect(permissionRepository.findAll).toHaveBeenCalled();
      expect(storageService.setWithExpiry).toHaveBeenCalledWith('permissions:all', permissions, 30);
    });
  });
});
