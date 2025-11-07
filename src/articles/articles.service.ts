import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './entities/article.entity';
import { IArticleRepository, ARTICLE_REPOSITORY } from '../domain/articles/article.repository.interface';
import { IStorageService, STORAGE_SERVICE } from '../infrastructure/storage/storage.interface';

@Injectable()
export class ArticlesService {
  private readonly CACHE_PREFIX = 'article:';
  private readonly CACHE_TTL = 5; // 5 minutos

  constructor(
    @Inject(ARTICLE_REPOSITORY)
    private readonly articleRepository: IArticleRepository,
    @Inject(STORAGE_SERVICE)
    private readonly storageService: IStorageService,
  ) {}

  async create(createArticleDto: CreateArticleDto, creatorId: string): Promise<Article> {
    const article = await this.articleRepository.create(createArticleDto, creatorId);
    
    // Invalidar cache da lista
    this.storageService.removeItem('articles:all');
    
    return article;
  }

  async findAll(): Promise<Article[]> {
    // Tentar buscar do cache
    const cached = this.storageService.getWithExpiry<Article[]>('articles:all');
    if (cached) {
      return cached;
    }

    const articles = await this.articleRepository.findAll();
    
    // Salvar no cache
    this.storageService.setWithExpiry('articles:all', articles, this.CACHE_TTL);
    
    return articles;
  }

  async findOne(id: string): Promise<Article> {
    // Tentar buscar do cache
    const cacheKey = `${this.CACHE_PREFIX}${id}`;
    const cached = this.storageService.getWithExpiry<Article>(cacheKey);
    if (cached) {
      return cached;
    }

    const article = await this.articleRepository.findOne(id);

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Salvar no cache
    this.storageService.setWithExpiry(cacheKey, article, this.CACHE_TTL);

    return article;
  }

  async update(id: string, updateArticleDto: UpdateArticleDto): Promise<Article> {
    const exists = await this.articleRepository.findOne(id);
    if (!exists) {
      throw new NotFoundException('Article not found');
    }

    const article = await this.articleRepository.update(id, updateArticleDto);
    
    // Invalidar caches
    this.storageService.removeItem(`${this.CACHE_PREFIX}${id}`);
    this.storageService.removeItem('articles:all');
    
    return article;
  }

  async remove(id: string): Promise<void> {
    const exists = await this.articleRepository.findOne(id);
    if (!exists) {
      throw new NotFoundException('Article not found');
    }

    await this.articleRepository.remove(id);
    
    // Invalidar caches
    this.storageService.removeItem(`${this.CACHE_PREFIX}${id}`);
    this.storageService.removeItem('articles:all');
  }
}
