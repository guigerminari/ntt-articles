import { Category } from '../../category/entities/category.entity';
import { CreateCategoryDto } from '../../category/dto/create-category.dto';
import { UpdateCategoryDto } from '../../category/dto/update-category.dto';

export interface ICategoryRepository {
  create(createCategoryDto: CreateCategoryDto, creatorId: string): Promise<Category>;
  findAll(): Promise<Category[]>;
  findOne(id: string): Promise<Category | null>;
  update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category>;
  remove(id: string): Promise<void>;
}

export const CATEGORY_REPOSITORY = Symbol('ICategoryRepository');
