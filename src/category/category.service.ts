import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ICategoryRepository, CATEGORY_REPOSITORY } from '../domain/category/category.repository.interface';
import { IStorageService, STORAGE_SERVICE } from '../infrastructure/storage/storage.interface';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  private readonly CACHE_PREFIX = 'category:';
  private readonly CACHE_TTL = 5; // 5 minutos

  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
    @Inject(STORAGE_SERVICE)
    private readonly storageService: IStorageService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, creatorId: string): Promise<Category> {
    // Verificar se já existe categoria com esse nome
    const existingCategory = await this.categoryRepository.findByName(createCategoryDto.name);
    if (existingCategory) {
      throw new ConflictException('Category name already exists');
    }

    const category = await this.categoryRepository.create(createCategoryDto, creatorId);

    // Invalidar cache da lista
    this.storageService.removeItem('categories:all');

    return category;
  }

  async findAll(): Promise<Category[]> {
    // Tentar buscar do cache
    const cached = this.storageService.getWithExpiry<Category[]>('categories:all');
    if (cached) {
      return cached;
    }

    const categories = await this.categoryRepository.findAll();
    
    // Salvar no cache
    this.storageService.setWithExpiry('categories:all', categories, this.CACHE_TTL);

    return categories;
  }

  async findOne(id: string): Promise<Category> {
    // Tentar buscar do cache
    const cacheKey = `${this.CACHE_PREFIX}${id}`;
    const cached = this.storageService.getWithExpiry<Category>(cacheKey);
    if (cached) {
      return cached;
    }

    const category = await this.categoryRepository.findOne(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Salvar no cache
    this.storageService.setWithExpiry(cacheKey, category, this.CACHE_TTL);

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const exists = await this.categoryRepository.findOne(id);
    if (!exists) {
      throw new NotFoundException('Category not found');
    }

    // Verificar se o novo nome já existe (em outra categoria)
    if (updateCategoryDto.name) {
      const existingCategory = await this.categoryRepository.findByName(updateCategoryDto.name);
      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException('Category name already exists');
      }
    }

    const category = await this.categoryRepository.update(id, updateCategoryDto);

    // Invalidar caches
    this.storageService.removeItem(`${this.CACHE_PREFIX}${id}`);
    this.storageService.removeItem('categories:all');

    return category;
  }

  async remove(id: string): Promise<void> {
    const exists = await this.categoryRepository.findOne(id);
    if (!exists) {
      throw new NotFoundException('Category not found');
    }

    await this.categoryRepository.remove(id);
    
    // Invalidar caches
    this.storageService.removeItem(`${this.CACHE_PREFIX}${id}`);
    this.storageService.removeItem('categories:all');
  }
}
