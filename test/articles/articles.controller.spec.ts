import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesController } from '../../src/articles/articles.controller';
import { ArticlesService } from '../../src/articles/articles.service';

describe('ArticlesController', () => {
  let controller: ArticlesController;
  let service: ArticlesService;

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

  const mockArticlesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticlesController],
      providers: [
        {
          provide: ArticlesService,
          useValue: mockArticlesService,
        },
      ],
    }).compile();

    controller = module.get<ArticlesController>(ArticlesController);
    service = module.get<ArticlesService>(ArticlesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new article', async () => {
      const createArticleDto = {
        title: 'New Article',
        content: 'New content',
      };

      const req = {
        user: { id: '1' },
      };

      mockArticlesService.create.mockResolvedValue(mockArticle);

      const result = await controller.create(createArticleDto, req);

      expect(result).toEqual(mockArticle);
      expect(service.create).toHaveBeenCalledWith(createArticleDto, '1');
    });
  });

  describe('findAll', () => {
    it('should return an array of articles', async () => {
      const articles = [mockArticle];
      mockArticlesService.findAll.mockResolvedValue(articles);

      const result = await controller.findAll();

      expect(result).toEqual(articles);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an article by id', async () => {
      mockArticlesService.findOne.mockResolvedValue(mockArticle);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockArticle);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update an article', async () => {
      const updateArticleDto = { title: 'Updated Title' };
      const updatedArticle = { ...mockArticle, title: 'Updated Title' };

      mockArticlesService.update.mockResolvedValue(updatedArticle);

      const result = await controller.update('1', updateArticleDto);

      expect(result).toEqual(updatedArticle);
      expect(service.update).toHaveBeenCalledWith('1', updateArticleDto);
    });
  });

  describe('remove', () => {
    it('should remove an article', async () => {
      mockArticlesService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });
});
