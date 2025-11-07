import { Injectable, Inject } from '@nestjs/common';
import { Article } from '../../articles/entities/article.entity';
import { CreateArticleDto } from '../../articles/dto/create-article.dto';
import { UpdateArticleDto } from '../../articles/dto/update-article.dto';
import { IArticleRepository } from '../../domain/articles/article.repository.interface';
import { IStorageService, STORAGE_SERVICE } from '../storage/storage.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ArticleStorageRepository implements IArticleRepository {
  private readonly STORAGE_KEY = 'articles';

  constructor(
    @Inject(STORAGE_SERVICE)
    private readonly storage: IStorageService,
  ) {}

  private getAll(): Article[] {
    return this.storage.getItem<Article[]>(this.STORAGE_KEY) || [];
  }

  private saveAll(articles: Article[]): void {
    this.storage.setItem(this.STORAGE_KEY, articles);
  }

  async create(createArticleDto: CreateArticleDto, creatorId: string): Promise<Article> {
    const articles = this.getAll();
    
    const article: Article = {
      id: uuidv4(),
      ...createArticleDto,
      creatorId,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Article;

    articles.push(article);
    this.saveAll(articles);

    return article;
  }

  async findAll(): Promise<Article[]> {
    return this.getAll();
  }

  async findOne(id: string): Promise<Article | null> {
    const articles = this.getAll();
    return articles.find(a => a.id === id) || null;
  }

  async update(id: string, updateArticleDto: UpdateArticleDto): Promise<Article> {
    const articles = this.getAll();
    const index = articles.findIndex(a => a.id === id);
    
    if (index === -1) {
      return null;
    }

    articles[index] = {
      ...articles[index],
      ...updateArticleDto,
      updatedAt: new Date(),
    };

    this.saveAll(articles);
    return articles[index];
  }

  async remove(id: string): Promise<void> {
    const articles = this.getAll();
    const filtered = articles.filter(a => a.id !== id);
    this.saveAll(filtered);
  }
}
