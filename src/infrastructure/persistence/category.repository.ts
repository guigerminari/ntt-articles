import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../category/entities/category.entity';
import { CreateCategoryDto } from '../../category/dto/create-category.dto';
import { UpdateCategoryDto } from '../../category/dto/update-category.dto';
import { ICategoryRepository } from '../../domain/category/category.repository.interface';

@Injectable()
export class CategoryRepository implements ICategoryRepository {
  constructor(
    @InjectRepository(Category)
    private readonly repository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, creatorId: string): Promise<Category> {
    const category = this.repository.create({
      ...createCategoryDto,
      creatorId,
    });
    return await this.repository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return await this.repository.find({
      relations: ['creator'],
    });
  }

  async findOne(id: string): Promise<Category | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['creator'],
    });
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    await this.repository.update(id, updateCategoryDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
