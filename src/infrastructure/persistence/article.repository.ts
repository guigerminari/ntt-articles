import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from '../../articles/entities/article.entity';
import { CreateArticleDto } from '../../articles/dto/create-article.dto';
import { UpdateArticleDto } from '../../articles/dto/update-article.dto';
import { IArticleRepository } from '../../domain/articles/article.repository.interface';

@Injectable()
export class ArticleRepository implements IArticleRepository {
  constructor(
    @InjectRepository(Article)
    private readonly repository: Repository<Article>,
  ) {}

  async create(createArticleDto: CreateArticleDto, creatorId: string): Promise<Article> {
    const article = this.repository.create({
      title: createArticleDto.title,
      content: createArticleDto.content,
      category: createArticleDto.category as any,
      creatorId,
    });
    return await this.repository.save(article);
  }

  async findAll(): Promise<Article[]> {
    return await this.repository.find({
      relations: ['creator'],
    });
  }

  async findOne(id: string): Promise<Article | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['creator'],
    });
  }

  async update(id: string, updateArticleDto: UpdateArticleDto): Promise<Article> {
    await this.repository.update(id, updateArticleDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
