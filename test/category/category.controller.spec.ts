import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from '../../src/category/category.controller';
import { CategoryService } from '../../src/category/category.service';

describe('CategoryController', () => {
  let controller: CategoryController;
  let service: CategoryService;

  const mockCategory = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Tecnologia',
    description: 'Artigos sobre tecnologia',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCategoryService = {
    create: jest.fn().mockResolvedValue(mockCategory),
    findAll: jest.fn().mockResolvedValue([mockCategory]),
    findOne: jest.fn().mockResolvedValue(mockCategory),
    update: jest.fn().mockResolvedValue(mockCategory),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: mockCategoryService,
        },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    service = module.get<CategoryService>(CategoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a category', async () => {
      const createDto = {
        name: 'Tecnologia',
        description: 'Artigos sobre tecnologia',
      };
      const req = { user: { id: 'user-123' } };

      const result = await controller.create(createDto, req);

      expect(result).toEqual(mockCategory);
      expect(service.create).toHaveBeenCalledWith(createDto, 'user-123');
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      const result = await controller.findAll();

      expect(result).toEqual([mockCategory]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      const result = await controller.findOne('123');

      expect(result).toEqual(mockCategory);
      expect(service.findOne).toHaveBeenCalledWith('123');
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updateDto = { name: 'Tech' };

      const result = await controller.update('123', updateDto);

      expect(result).toEqual(mockCategory);
      expect(service.update).toHaveBeenCalledWith('123', updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      await controller.remove('123');

      expect(service.remove).toHaveBeenCalledWith('123');
    });
  });
});

