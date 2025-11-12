import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesService } from '../../src/articles/articles.service';
import { Article } from '../../src/articles/entities/article.entity';
import { NotFoundException } from '@nestjs/common';
import { ARTICLE_REPOSITORY } from '../../src/domain/articles/article.repository.interface';
import { STORAGE_SERVICE } from '../../src/infrastructure/storage/storage.interface';
import { CATEGORY_REPOSITORY } from '../../src/domain/category/category.repository.interface';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let articleRepository: any;
  let categoryRepository: any;
  let storageService: any;

  const mockArticle = {
    id: '1',
    title: 'Test Article',
    content: 'Test content',
    creatorId: '1',
    creator: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockArticleRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockCategoryRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByName: jest.fn(),
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
        ArticlesService,
        {
          provide: ARTICLE_REPOSITORY,
          useValue: mockArticleRepository,
        },
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

    service = module.get<ArticlesService>(ArticlesService);
    articleRepository = module.get(ARTICLE_REPOSITORY);
    categoryRepository = module.get(CATEGORY_REPOSITORY);
    storageService = module.get(STORAGE_SERVICE);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new article', async () => {
      const createArticleDto = {
        title: 'New Article',
        content: 'New content',
      };
      const creatorId = '1';

      mockArticleRepository.create.mockResolvedValue(mockArticle);
      mockStorageService.removeItem.mockReturnValue(undefined);

      const result = await service.create(createArticleDto, creatorId);

      expect(result).toEqual(mockArticle);
      expect(articleRepository.create).toHaveBeenCalledWith(createArticleDto, creatorId);
      expect(storageService.removeItem).toHaveBeenCalledWith('articles:all');
    });
  });

  describe('findAll', () => {
    it('should return an array of articles', async () => {
      const articles = [mockArticle];
      mockStorageService.getWithExpiry.mockReturnValue(null);
      mockArticleRepository.findAll.mockResolvedValue(articles);
      mockStorageService.setWithExpiry.mockReturnValue(undefined);

      const result = await service.findAll();

      expect(result).toEqual(articles);
      expect(storageService.getWithExpiry).toHaveBeenCalledWith('articles:all');
      expect(articleRepository.findAll).toHaveBeenCalled();
      expect(storageService.setWithExpiry).toHaveBeenCalledWith('articles:all', articles, 5);
    });
  });

  describe('findOne', () => {
    it('should return an article by id', async () => {
      mockStorageService.getWithExpiry.mockReturnValue(null);
      mockArticleRepository.findOne.mockResolvedValue(mockArticle);
      mockStorageService.setWithExpiry.mockReturnValue(undefined);

      const result = await service.findOne('1');

      expect(result).toEqual(mockArticle);
      expect(storageService.getWithExpiry).toHaveBeenCalledWith('article:1');
      expect(articleRepository.findOne).toHaveBeenCalledWith('1');
      expect(storageService.setWithExpiry).toHaveBeenCalledWith('article:1', mockArticle, 5);
    });

    it('should throw NotFoundException when article not found', async () => {
      mockStorageService.getWithExpiry.mockReturnValue(null);
      mockArticleRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an article', async () => {
      const updateArticleDto = { title: 'Updated Title' };
      const updatedArticle = { ...mockArticle, ...updateArticleDto };
      mockArticleRepository.findOne.mockResolvedValue(mockArticle);
      mockArticleRepository.update.mockResolvedValue(updatedArticle);
      mockStorageService.removeItem.mockReturnValue(undefined);

      const result = await service.update('1', updateArticleDto);

      expect(result.title).toBe('Updated Title');
      expect(articleRepository.update).toHaveBeenCalledWith('1', updateArticleDto);
      expect(storageService.removeItem).toHaveBeenCalledWith('article:1');
      expect(storageService.removeItem).toHaveBeenCalledWith('articles:all');
    });

    it('should throw NotFoundException when article not found', async () => {
      const updateArticleDto = { title: 'Updated Title' };
      mockArticleRepository.findOne.mockResolvedValue(null);

      await expect(service.update('999', updateArticleDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove an article', async () => {
      mockArticleRepository.findOne.mockResolvedValue(mockArticle);
      mockArticleRepository.remove.mockResolvedValue(undefined);
      mockStorageService.removeItem.mockReturnValue(undefined);

      await service.remove('1');

      expect(articleRepository.remove).toHaveBeenCalledWith('1');
      expect(storageService.removeItem).toHaveBeenCalledWith('article:1');
      expect(storageService.removeItem).toHaveBeenCalledWith('articles:all');
    });

    it('should throw NotFoundException when article not found', async () => {
      mockArticleRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});
