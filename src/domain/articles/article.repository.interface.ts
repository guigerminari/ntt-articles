import { Article } from '../../articles/entities/article.entity';
import { CreateArticleDto } from '../../articles/dto/create-article.dto';
import { UpdateArticleDto } from '../../articles/dto/update-article.dto';

export interface IArticleRepository {
  create(createArticleDto: CreateArticleDto, creatorId: string): Promise<Article>;
  findAll(): Promise<Article[]>;
  findOne(id: string): Promise<Article | null>;
  update(id: string, updateArticleDto: UpdateArticleDto): Promise<Article>;
  remove(id: string): Promise<void>;
}

export const ARTICLE_REPOSITORY = Symbol('IArticleRepository');
