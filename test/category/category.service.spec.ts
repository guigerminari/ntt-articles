import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from '../../src/category/category.service';
import { CATEGORY_REPOSITORY } from '../../src/domain/category/category.repository.interface';
import { STORAGE_SERVICE } from '../../src/infrastructure/storage/storage.interface';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('CategoryService', () => {
  let service: CategoryService;
  let categoryRepository: any;
  let storageService: any;

  const mockCategory = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Tecnologia',
    description: 'Artigos sobre tecnologia',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockCategoryRepository = {
      create: jest.fn().mockResolvedValue(mockCategory),
      findAll: jest.fn().mockResolvedValue([mockCategory]),
      findOne: jest.fn().mockResolvedValue(mockCategory),
      findByName: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue(mockCategory),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const mockStorageService = {
      getWithExpiry: jest.fn().mockReturnValue(null),
      setWithExpiry: jest.fn(),
      removeItem: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: CATEGORY_REPOSITORY,
          useValue: mockCategoryRepository,
        },
        {
          provide: STORAGE_SERVICE,
          useValue: mockStorageService,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    categoryRepository = module.get(CATEGORY_REPOSITORY);
    storageService = module.get(STORAGE_SERVICE);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a category', async () => {
      const createDto = {
        name: 'Tecnologia',
        description: 'Artigos sobre tecnologia',
      };
      const creatorId = 'user-123';

      const result = await service.create(createDto, creatorId);

      expect(result).toEqual(mockCategory);
      expect(categoryRepository.create).toHaveBeenCalledWith(createDto, creatorId);
      expect(storageService.removeItem).toHaveBeenCalledWith('categories:all');
    });

    it('should throw ConflictException if category name already exists', async () => {
      categoryRepository.findByName.mockResolvedValue(mockCategory);

      const createDto = {
        name: 'Tecnologia',
        description: 'Artigos sobre tecnologia',
      };
      const creatorId = 'user-123';

      await expect(service.create(createDto, creatorId)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all categories from cache', async () => {
      storageService.getWithExpiry.mockReturnValue([mockCategory]);

      const result = await service.findAll();

      expect(result).toEqual([mockCategory]);
      expect(categoryRepository.findAll).not.toHaveBeenCalled();
    });

    it('should return all categories from repository and cache them', async () => {
      const result = await service.findAll();

      expect(result).toEqual([mockCategory]);
      expect(categoryRepository.findAll).toHaveBeenCalled();
      expect(storageService.setWithExpiry).toHaveBeenCalledWith(
        'categories:all',
        [mockCategory],
        expect.any(Number),
      );
    });
  });

  describe('findOne', () => {
    it('should return a category from cache', async () => {
      storageService.getWithExpiry.mockReturnValue(mockCategory);

      const result = await service.findOne('123');

      expect(result).toEqual(mockCategory);
      expect(categoryRepository.findOne).not.toHaveBeenCalled();
    });

    it('should return a category from repository and cache it', async () => {
      const result = await service.findOne('123');

      expect(result).toEqual(mockCategory);
      expect(categoryRepository.findOne).toHaveBeenCalledWith('123');
      expect(storageService.setWithExpiry).toHaveBeenCalled();
    });

    it('should throw NotFoundException if category not found', async () => {
      categoryRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updateDto = { name: 'Tech' };

      const result = await service.update('123', updateDto);

      expect(result).toEqual(mockCategory);
      expect(categoryRepository.update).toHaveBeenCalledWith('123', updateDto);
      expect(storageService.removeItem).toHaveBeenCalledWith('category:123');
      expect(storageService.removeItem).toHaveBeenCalledWith('categories:all');
    });

    it('should throw NotFoundException if category not found', async () => {
      categoryRepository.findOne.mockResolvedValue(null);

      await expect(service.update('invalid-id', {})).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if new name already exists', async () => {
      const anotherCategory = { ...mockCategory, id: 'another-id' };
      categoryRepository.findByName.mockResolvedValue(anotherCategory);

      await expect(service.update('123', { name: 'Tecnologia' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      await service.remove('123');

      expect(categoryRepository.remove).toHaveBeenCalledWith('123');
      expect(storageService.removeItem).toHaveBeenCalledWith('category:123');
      expect(storageService.removeItem).toHaveBeenCalledWith('categories:all');
    });

    it('should throw NotFoundException if category not found', async () => {
      categoryRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });
});

