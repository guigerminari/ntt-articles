import { Injectable, Inject } from '@nestjs/common';
import { Category } from '../../category/entities/category.entity';
import { CreateCategoryDto } from '../../category/dto/create-category.dto';
import { UpdateCategoryDto } from '../../category/dto/update-category.dto';
import { ICategoryRepository } from '../../domain/category/category.repository.interface';
import { IStorageService, STORAGE_SERVICE } from '../storage/storage.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CategoryStorageRepository implements ICategoryRepository {
  private readonly STORAGE_KEY = 'categories';

  constructor(
    @Inject(STORAGE_SERVICE)
    private readonly storage: IStorageService,
  ) {}

  private getAll(): Category[] {
    return this.storage.getItem<Category[]>(this.STORAGE_KEY) || [];
  }

  private saveAll(categories: Category[]): void {
    this.storage.setItem(this.STORAGE_KEY, categories);
  }

  async create(createCategoryDto: CreateCategoryDto, creatorId: string): Promise<Category> {
    const categories = this.getAll();
    
    const category: Category = {
      id: uuidv4(),
      ...createCategoryDto,
      creatorId,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Category;

    categories.push(category);
    this.saveAll(categories);

    return category;
  }

  async findAll(): Promise<Category[]> {
    return this.getAll();
  }

  async findOne(id: string): Promise<Category | null> {
    const categories = this.getAll();
    return categories.find(a => a.id === id) || null;
  }

  async findByName(name: string): Promise<Category | null> {
    const categories = this.getAll();
    return categories.find(c => c.name.toLowerCase() === name.toLowerCase()) || null;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const categories = this.getAll();
    const index = categories.findIndex(a => a.id === id);
    
    if (index === -1) {
      return null;
    }

    categories[index] = {
      ...categories[index],
      ...updateCategoryDto,
      updatedAt: new Date(),
    };

    this.saveAll(categories);
    return categories[index];
  }

  async remove(id: string): Promise<void> {
    const categories = this.getAll();
    const filtered = categories.filter(a => a.id !== id);
    this.saveAll(filtered);
  }
}
